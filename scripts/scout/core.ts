import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";
import Database from "better-sqlite3";
import { aiConfig } from "../../ai.config.ts";
import {
  cosine,
  embedText,
  generateStructured,
  hasProviderKey,
  localHashEmbed,
} from "../../ai/providers/index.ts";
import { prompts } from "../../ai/prompts/index.ts";
import { z } from "zod";
import { root, contentDir, loadAllLessons } from "../content/lib.ts";

export type ScoutMode = "full" | "topic" | "lesson";
export type ScoutDepth = "quick" | "deep";

export interface ScoutItem {
  url: string;
  title: string;
  date: string;
  source: string;
  text: string;
}

export interface ScoutOptions {
  mode: ScoutMode;
  query?: string;
  lessonId?: string;
  depth?: ScoutDepth;
  sinceDays?: number;
  propose?: boolean;
  onProgress?: (event: { stage: string; message: string; data?: unknown }) => void;
}

export interface ScoutResult {
  jobId: string;
  mode: ScoutMode;
  items: ScoutItem[];
  clusters: ClusterResult[];
  digestPath?: string;
  briefing?: TopicBriefing;
}

export interface ClusterResult {
  label: string;
  items: ScoutItem[];
  novelty: number;
  durability: number;
  adoption: number;
  relevance: number;
  suggestedAction: "watchlist" | "draft" | "refresh" | "ignore";
  relatedLessonIds: string[];
  rationale: string;
}

export interface TopicBriefing {
  topic: string;
  summary: string;
  whyItMatters: string;
  maturity: string;
  coverage: "covered" | "partial" | "gap";
  relatedLessonIds: string[];
  sources: { title: string; url: string }[];
  suggestedActions: string[];
}

const ScoreSchema = z.object({
  label: z.string(),
  novelty: z.number(),
  durability: z.number(),
  adoption: z.number(),
  relevance: z.number(),
  rationale: z.string(),
  suggestedAction: z.enum(["watchlist", "draft", "refresh", "ignore"]),
  relatedLessonIds: z.array(z.string()).default([]),
});

export function scoutDbPath() {
  const dir = join(contentDir, "scout");
  mkdirSync(dir, { recursive: true });
  return join(dir, "scout.sqlite");
}

export function openScoutDb() {
  const db = new Database(scoutDbPath());
  db.exec(`
    CREATE TABLE IF NOT EXISTS items (
      url TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT,
      source TEXT,
      text TEXT,
      fetched_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS watchlist (
      id TEXT PRIMARY KEY,
      label TEXT NOT NULL,
      score REAL,
      first_seen TEXT,
      last_seen TEXT,
      weeks INTEGER DEFAULT 1,
      meta TEXT
    );
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      mode TEXT,
      status TEXT,
      created_at TEXT,
      result TEXT
    );
  `);
  return db;
}

function progress(
  opts: ScoutOptions,
  stage: string,
  message: string,
  data?: unknown,
) {
  opts.onProgress?.({ stage, message, data });
}

export function loadSources() {
  const path = join(contentDir, "scout", "sources.yaml");
  return parseYaml(readFileSync(path, "utf8")) as {
    rss: { id: string; name: string; url: string }[];
    arxiv: { categories: string[]; maxPerCategory: number };
    github_releases: { id: string; repo: string }[];
    conferences: { id: string; name: string; url: string }[];
    hackernews: { enabled: boolean; keywords: string[] };
    web_search: { enabled: boolean; queries: string[] };
    thresholds: { watchlist: number; draft: number; refresh: number };
  };
}

async function fetchRss(url: string, source: string): Promise<ScoutItem[]> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "system-design-guide-scout/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const xml = await res.text();
    const items: ScoutItem[] = [];
    const blocks = xml.split(/<item[\s>]/i).slice(1);
    for (const block of blocks.slice(0, 15)) {
      const title = textBetween(block, "title");
      const link = textBetween(block, "link") || attrBetween(block, "guid");
      const date =
        textBetween(block, "pubDate") ||
        textBetween(block, "updated") ||
        new Date().toISOString();
      const desc =
        textBetween(block, "description") || textBetween(block, "summary") || "";
      if (title && link) {
        items.push({
          url: link.replace(/<!\[CDATA\[|\]\]>/g, "").trim(),
          title: stripTags(title),
          date,
          source,
          text: stripTags(desc).slice(0, 2000),
        });
      }
    }
    return items;
  } catch {
    return [];
  }
}

async function fetchArxiv(categories: string[], maxPer: number): Promise<ScoutItem[]> {
  const out: ScoutItem[] = [];
  for (const cat of categories) {
    const url = `https://export.arxiv.org/api/query?search_query=cat:${cat}&start=0&max_results=${maxPer}&sortBy=submittedDate&sortOrder=descending`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) continue;
      const xml = await res.text();
      const entries = xml.split("<entry>").slice(1);
      for (const e of entries) {
        const title = textBetween(e, "title");
        const id = textBetween(e, "id");
        const summary = textBetween(e, "summary");
        const published = textBetween(e, "published");
        if (title && id) {
          out.push({
            url: id.trim(),
            title: stripTags(title).replace(/\s+/g, " "),
            date: published || new Date().toISOString(),
            source: `arxiv:${cat}`,
            text: stripTags(summary).slice(0, 2000),
          });
        }
      }
    } catch {
      /* ignore */
    }
  }
  return out;
}

async function fetchGithubReleases(repo: string): Promise<ScoutItem[]> {
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}/releases?per_page=5`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "system-design-guide-scout/1.0",
        ...(process.env.GITHUB_TOKEN
          ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
          : {}),
      },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as {
      html_url: string;
      name: string;
      tag_name: string;
      body: string;
      published_at: string;
    }[];
    return data.map((r) => ({
      url: r.html_url,
      title: `${repo} ${r.name || r.tag_name}`,
      date: r.published_at,
      source: `github:${repo}`,
      text: (r.body || "").slice(0, 2000),
    }));
  } catch {
    return [];
  }
}

async function fetchHn(keywords: string[]): Promise<ScoutItem[]> {
  try {
    const res = await fetch(
      "https://hacker-news.firebaseio.com/v0/topstories.json",
      { signal: AbortSignal.timeout(10000) },
    );
    if (!res.ok) return [];
    const ids = (await res.json() as number[]).slice(0, 40);
    const items: ScoutItem[] = [];
    for (const id of ids) {
      const ir = await fetch(
        `https://hacker-news.firebaseio.com/v0/item/${id}.json`,
        { signal: AbortSignal.timeout(8000) },
      );
      if (!ir.ok) continue;
      const story = (await ir.json()) as {
        title?: string;
        url?: string;
        time?: number;
        text?: string;
      };
      if (!story?.title) continue;
      const hay = `${story.title} ${story.text ?? ""}`.toLowerCase();
      if (!keywords.some((k) => hay.includes(k.toLowerCase()))) continue;
      items.push({
        url: story.url || `https://news.ycombinator.com/item?id=${id}`,
        title: story.title,
        date: story.time
          ? new Date(story.time * 1000).toISOString()
          : new Date().toISOString(),
        source: "hackernews",
        text: story.text || story.title,
      });
    }
    return items;
  } catch {
    return [];
  }
}

function textBetween(xml: string, tag: string) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? m[1].replace(/<!\[CDATA\[|\]\]>/g, "").trim() : "";
}

function attrBetween(xml: string, tag: string) {
  const m = xml.match(new RegExp(`<${tag}[^>]*>([^<]+)`, "i"));
  return m ? m[1].trim() : "";
}

function stripTags(s: string) {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export async function fetchAll(opts: ScoutOptions): Promise<ScoutItem[]> {
  const sources = loadSources();
  progress(opts, "fetch", "Fetching sources…");
  const items: ScoutItem[] = [];

  if (opts.mode === "topic" && opts.query) {
    const q = opts.query;
    items.push(
      ...(await fetchArxiv(sources.arxiv.categories, opts.depth === "deep" ? 15 : 5)),
    );
    // Filter arxiv + HN + synthetic web-search placeholders by query
    const hn = await fetchHn([...sources.hackernews.keywords, ...q.split(/\s+/)]);
    items.push(...hn);
    for (const repo of sources.github_releases) {
      if (q.toLowerCase().split(/\s+/).some((t) => repo.repo.toLowerCase().includes(t) || repo.id.includes(t))) {
        items.push(...(await fetchGithubReleases(repo.repo)));
      }
    }
    // Web search placeholder item when no provider — still records the intent
    items.push({
      url: `https://www.google.com/search?q=${encodeURIComponent(q + " system design")}`,
      title: `Web search: ${q}`,
      date: new Date().toISOString(),
      source: "web_search",
      text: `Query for emerging material about: ${q}`,
    });
  } else if (opts.mode === "lesson" && opts.lessonId) {
    const lesson = loadAllLessons().find((l) => l.id === opts.lessonId);
    const q = lesson?.title ?? opts.lessonId;
    items.push(...(await fetchHn([q, ...(lesson?.tags ?? [])])));
    items.push(
      ...(await fetchArxiv(sources.arxiv.categories, 5)).filter((i) =>
        i.title.toLowerCase().includes((lesson?.tags?.[0] ?? "").toLowerCase()) ||
        true,
      ),
    );
  } else {
    for (const feed of sources.rss) {
      progress(opts, "fetch", `RSS ${feed.name}`);
      items.push(...(await fetchRss(feed.url, feed.id)));
    }
    if (opts.depth !== "quick") {
      items.push(
        ...(await fetchArxiv(
          sources.arxiv.categories,
          sources.arxiv.maxPerCategory,
        )),
      );
      for (const repo of sources.github_releases) {
        items.push(...(await fetchGithubReleases(repo.repo)));
      }
    }
    if (sources.hackernews.enabled) {
      items.push(...(await fetchHn(sources.hackernews.keywords)));
    }
  }

  // Persist
  const db = openScoutDb();
  const upsert = db.prepare(
    `INSERT INTO items (url, title, date, source, text, fetched_at)
     VALUES (@url, @title, @date, @source, @text, @fetched_at)
     ON CONFLICT(url) DO UPDATE SET title=@title, text=@text, fetched_at=@fetched_at`,
  );
  const now = new Date().toISOString();
  const tx = db.transaction((rows: ScoutItem[]) => {
    for (const r of rows) {
      upsert.run({ ...r, fetched_at: now });
    }
  });
  tx(items);
  db.close();

  progress(opts, "fetch", `Fetched ${items.length} items`, { count: items.length });
  return items;
}

async function embedLessons() {
  const lessons = loadAllLessons().filter((l) => l.status !== "draft" || true);
  const embedded: { id: string; title: string; vec: number[] }[] = [];
  for (const l of lessons) {
    const text = `${l.title} ${l.summary} ${(l.tags ?? []).join(" ")}`;
    const vec = hasProviderKey("openai")
      ? await embedText(text)
      : localHashEmbed(text);
    embedded.push({ id: l.id, title: l.title, vec });
  }
  return embedded;
}

function simpleCluster(items: ScoutItem[]): ScoutItem[][] {
  // Token-overlap clustering
  const clusters: ScoutItem[][] = [];
  const used = new Set<string>();
  for (const item of items) {
    if (used.has(item.url)) continue;
    const tokens = new Set(
      item.title.toLowerCase().split(/\W+/).filter((t) => t.length > 3),
    );
    const group = [item];
    used.add(item.url);
    for (const other of items) {
      if (used.has(other.url)) continue;
      const ot = other.title.toLowerCase().split(/\W+/).filter((t) => t.length > 3);
      const overlap = ot.filter((t) => tokens.has(t)).length;
      if (overlap >= 2) {
        group.push(other);
        used.add(other.url);
      }
    }
    if (group.length >= 1) clusters.push(group);
  }
  return clusters.sort((a, b) => b.length - a.length).slice(0, 20);
}

export async function analyze(
  items: ScoutItem[],
  opts: ScoutOptions,
): Promise<ClusterResult[]> {
  progress(opts, "analyze", "Embedding and clustering…");
  const lessonEmb = await embedLessons();
  const clusters = simpleCluster(items);
  const sources = loadSources();
  const results: ClusterResult[] = [];

  for (const group of clusters.slice(0, opts.depth === "deep" ? 12 : 6)) {
    const summary = group
      .map((g) => `- ${g.title} (${g.source}) ${g.url}`)
      .join("\n");
    const centroidText = group.map((g) => g.title).join(" ");
    const vec = localHashEmbed(centroidText);
    const related = lessonEmb
      .map((l) => ({ id: l.id, score: cosine(vec, l.vec) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
    const novelty = 1 - (related[0]?.score ?? 0);
    const coverage = related
      .map((r) => `${r.id}:${r.score.toFixed(2)}`)
      .join(", ");

    let scored: ClusterResult;
    if (hasProviderKey(aiConfig.routes.scoutScore.provider)) {
      try {
        const s = await generateStructured(
          ScoreSchema,
          prompts.scoutScore({
            clusterSummary: summary,
            existingCoverage: coverage,
          }),
          aiConfig.routes.scoutScore,
        );
        scored = { ...s, items: group };
      } catch {
        scored = heuristicScore(group, novelty, related.map((r) => r.id));
      }
    } else {
      scored = heuristicScore(group, novelty, related.map((r) => r.id));
    }

    // Apply thresholds
    const avg =
      (scored.novelty + scored.durability + scored.adoption + scored.relevance) /
      4;
    if (avg >= sources.thresholds.draft) scored.suggestedAction = "draft";
    else if (avg >= sources.thresholds.watchlist && scored.suggestedAction === "ignore") {
      scored.suggestedAction = "watchlist";
    }

    results.push(scored);
  }

  // Update watchlist
  const db = openScoutDb();
  const upsert = db.prepare(
    `INSERT INTO watchlist (id, label, score, first_seen, last_seen, weeks, meta)
     VALUES (@id, @label, @score, @first, @last, 1, @meta)
     ON CONFLICT(id) DO UPDATE SET
       score=@score, last_seen=@last, weeks=weeks+1, meta=@meta`,
  );
  const now = new Date().toISOString().slice(0, 10);
  for (const c of results.filter((r) => r.suggestedAction === "watchlist" || r.suggestedAction === "draft")) {
    const id = c.label.toLowerCase().replace(/\W+/g, "-").slice(0, 64);
    upsert.run({
      id,
      label: c.label,
      score: (c.novelty + c.durability + c.adoption + c.relevance) / 4,
      first: now,
      last: now,
      meta: JSON.stringify({ action: c.suggestedAction, related: c.relatedLessonIds }),
    });
  }
  db.close();

  progress(opts, "analyze", `Scored ${results.length} clusters`);
  return results;
}

function heuristicScore(
  group: ScoutItem[],
  novelty: number,
  relatedLessonIds: string[],
): ClusterResult {
  const sources = new Set(group.map((g) => g.source.split(":")[0]));
  const adoption = Math.min(1, sources.size / 4);
  const durability = group.some((g) => g.source.startsWith("arxiv") || g.source.startsWith("github"))
    ? 0.6
    : 0.35;
  const relevance = /llm|distributed|database|kafka|kubernetes|inference|raft|cache|agent|rag/i.test(
    group.map((g) => g.title).join(" "),
  )
    ? 0.75
    : 0.4;
  const avg = (novelty + durability + adoption + relevance) / 4;
  return {
    label: group[0].title.slice(0, 80),
    items: group,
    novelty,
    durability,
    adoption,
    relevance,
    suggestedAction: avg > 0.65 ? "draft" : avg > 0.45 ? "watchlist" : "ignore",
    relatedLessonIds,
    rationale: `Heuristic score from ${group.length} items across ${sources.size} source types.`,
  };
}

export function writeDigest(clusters: ClusterResult[]): string {
  const dir = join(contentDir, "scout", "digests");
  mkdirSync(dir, { recursive: true });
  const now = new Date();
  const week = getWeek(now);
  const name = `${now.getUTCFullYear()}-${String(week).padStart(2, "0")}.md`;
  const path = join(dir, name);
  const lines = [
    `# Scout Digest ${now.getUTCFullYear()}-W${String(week).padStart(2, "0")}`,
    "",
    `Generated: ${now.toISOString()}`,
    "",
    "## Ranked clusters",
    "",
  ];
  const ranked = [...clusters].sort(
    (a, b) =>
      b.novelty + b.durability + b.adoption + b.relevance -
      (a.novelty + a.durability + a.adoption + a.relevance),
  );
  for (const c of ranked) {
    lines.push(`### ${c.label}`);
    lines.push(
      `- Scores: novelty=${c.novelty.toFixed(2)} durability=${c.durability.toFixed(2)} adoption=${c.adoption.toFixed(2)} relevance=${c.relevance.toFixed(2)}`,
    );
    lines.push(`- Action: **${c.suggestedAction}**`);
    lines.push(`- ${c.rationale}`);
    for (const item of c.items.slice(0, 5)) {
      lines.push(`  - [${item.title}](${item.url}) (${item.source})`);
    }
    lines.push("");
  }
  writeFileSync(path, lines.join("\n"), "utf8");
  return path;
}

function getWeek(d: Date) {
  const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = t.getUTCDay() || 7;
  t.setUTCDate(t.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
  return Math.ceil(((t.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export async function runScout(opts: ScoutOptions): Promise<ScoutResult> {
  const jobId = `scout_${Date.now().toString(36)}`;
  progress(opts, "start", `Job ${jobId} mode=${opts.mode}`);
  const items = await fetchAll(opts);
  const clusters = await analyze(items, opts);
  let digestPath: string | undefined;
  let briefing: TopicBriefing | undefined;

  if (opts.mode === "full") {
    digestPath = writeDigest(clusters);
    progress(opts, "digest", `Wrote ${digestPath}`);
  }

  if (opts.mode === "topic" && opts.query) {
    const top = clusters[0];
    const lessons = loadAllLessons();
    const related = top?.relatedLessonIds ?? [];
    const coverage: TopicBriefing["coverage"] =
      related.length === 0
        ? "gap"
        : related.some((id) => lessons.find((l) => l.id === id && l.status === "published"))
          ? top && top.novelty < 0.35
            ? "covered"
            : "partial"
          : "gap";
    briefing = {
      topic: opts.query,
      summary: top?.rationale ?? `Scouted ${items.length} items for ${opts.query}`,
      whyItMatters:
        "Emerging patterns that survive multi-source adoption often become durable curriculum topics.",
      maturity: top ? (top.durability > 0.6 ? "emerging-durable" : "early") : "unknown",
      coverage,
      relatedLessonIds: related,
      sources: items.slice(0, 8).map((i) => ({ title: i.title, url: i.url })),
      suggestedActions: [
        coverage === "gap" ? "Draft lesson" : "Refresh related lessons",
        "Add to watchlist",
        "Open PR",
      ],
    };
    progress(opts, "briefing", "Topic briefing ready", briefing);
  }

  if (opts.propose) {
    const proposals = clusters.filter((c) => c.suggestedAction === "draft").slice(0, 3);
    const propDir = join(contentDir, "scout", "proposals");
    mkdirSync(propDir, { recursive: true });
    writeFileSync(
      join(propDir, `${jobId}.json`),
      JSON.stringify(proposals, null, 2),
    );
    progress(opts, "propose", `Wrote ${proposals.length} proposals`);
  }

  const db = openScoutDb();
  db.prepare(
    `INSERT INTO jobs (id, mode, status, created_at, result) VALUES (?, ?, ?, ?, ?)`,
  ).run(
    jobId,
    opts.mode,
    "finished",
    new Date().toISOString(),
    JSON.stringify({ clusters: clusters.length, items: items.length, briefing }),
  );
  db.close();

  progress(opts, "done", "Scout finished");
  return { jobId, mode: opts.mode, items, clusters, digestPath, briefing };
}

export function listWatchlist() {
  const db = openScoutDb();
  const rows = db.prepare(`SELECT * FROM watchlist ORDER BY score DESC`).all();
  db.close();
  return rows;
}

export function listJobs(limit = 20) {
  if (!existsSync(scoutDbPath())) return [];
  const db = openScoutDb();
  const rows = db
    .prepare(`SELECT * FROM jobs ORDER BY created_at DESC LIMIT ?`)
    .all(limit);
  db.close();
  return rows;
}

void root;
