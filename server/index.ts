import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { streamText as honoStream } from "hono/streaming";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { aiConfig } from "../ai.config.ts";
import {
  hasProviderKey,
  localHashEmbed,
  cosine,
  streamPlain,
  generatePlain,
  generateStructured,
} from "../ai/providers/index.ts";
import { prompts } from "../ai/prompts/index.ts";
import { runScout, listJobs, listWatchlist } from "../scripts/scout/core.ts";
import { z } from "zod";
import { root } from "../scripts/content/lib.ts";

const PORT = Number(process.env.PORT ?? 8787);
const SCOUT_ADMIN_TOKEN = process.env.SCOUT_ADMIN_TOKEN ?? "";

const app = new Hono();
app.use("*", cors());

const dbPath = join(root, "data", "server.sqlite");
import { mkdirSync } from "node:fs";
mkdirSync(join(root, "data"), { recursive: true });
const db = new Database(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS cache (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS rate (
    ip TEXT PRIMARY KEY,
    count INTEGER,
    window_start INTEGER
  );
  CREATE TABLE IF NOT EXISTS embeddings (
    id TEXT PRIMARY KEY,
    text TEXT,
    vec TEXT
  );
  CREATE TABLE IF NOT EXISTS promote_queue (
    id TEXT PRIMARY KEY,
    payload TEXT,
    created_at TEXT
  );
`);

function rateLimit(ip: string, limit = 60): boolean {
  const now = Date.now();
  const row = db.prepare(`SELECT * FROM rate WHERE ip = ?`).get(ip) as
    | { count: number; window_start: number }
    | undefined;
  if (!row || now - row.window_start > 60_000) {
    db.prepare(
      `INSERT INTO rate (ip, count, window_start) VALUES (?, 1, ?)
       ON CONFLICT(ip) DO UPDATE SET count=1, window_start=?`,
    ).run(ip, now, now);
    return true;
  }
  if (row.count >= limit) return false;
  db.prepare(`UPDATE rate SET count = count + 1 WHERE ip = ?`).run(ip);
  return true;
}

function cacheGet(key: string): string | null {
  const row = db.prepare(`SELECT value FROM cache WHERE key = ?`).get(key) as
    | { value: string }
    | undefined;
  return row?.value ?? null;
}

function cacheSet(key: string, value: string) {
  db.prepare(
    `INSERT INTO cache (key, value, created_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value, created_at=excluded.created_at`,
  ).run(key, value, new Date().toISOString());
}

function hashKey(parts: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(parts) + aiConfig.promptVersion)
    .digest("hex");
}

function loadContentIndex() {
  const path = join(root, "src/generated/content-index.json");
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, "utf8")) as {
    lessons: {
      id: string;
      title: string;
      summary: string;
      sections: { title: string; paragraphs: string[] }[];
      concepts: string[];
    }[];
    designChallenges: {
      id: string;
      title: string;
      description: string;
      rubric?: string[];
      checklist: string[];
    }[];
  };
}

function retrieve(query: string, k = 5) {
  const index = loadContentIndex();
  if (!index) return [];
  const q = localHashEmbed(query);
  return index.lessons
    .map((l) => ({
      lesson: l,
      score: cosine(
        q,
        localHashEmbed(`${l.title} ${l.summary} ${l.concepts.join(" ")}`),
      ),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, k);
}

app.get("/api/health", (c) =>
  c.json({
    ok: true,
    providers: {
      openai: hasProviderKey("openai"),
      anthropic: hasProviderKey("anthropic"),
      google: hasProviderKey("google"),
      cursor: hasProviderKey("cursor"),
    },
  }),
);

app.post("/api/explain", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) return c.json({ error: "rate_limited" }, 429);
  const body = await c.req.json<{
    section: string;
    mode?: "simpler" | "expert" | "analogy";
  }>();
  const mode = body.mode ?? "simpler";
  const key = hashKey({ t: "explain", mode, section: body.section });
  const hit = cacheGet(key);
  if (hit) return c.json({ text: hit, cached: true });

  if (!hasProviderKey(aiConfig.routes.tutor.provider)) {
    const fallback = `(offline) ${mode} explanation:\n${body.section.slice(0, 400)}…\n\nConfigure API keys on the server for live explanations.`;
    return c.json({ text: fallback, cached: false, offline: true });
  }

  const text = await generatePlain(
    prompts.explain({ section: body.section, mode }),
    aiConfig.routes.tutor,
  );
  cacheSet(key, text);
  return c.json({ text, cached: false });
});

app.post("/api/tutor", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) return c.json({ error: "rate_limited" }, 429);
  const body = await c.req.json<{ message: string; lessonId?: string }>();
  const hits = retrieve(body.message);
  const context = hits
    .map(
      (h) =>
        `## ${h.lesson.title}\n${h.lesson.summary}\n${h.lesson.sections
          .slice(0, 1)
          .flatMap((s) => s.paragraphs)
          .join("\n")}`,
    )
    .join("\n\n");

  if (!hasProviderKey(aiConfig.routes.tutor.provider)) {
    return c.json({
      text: `Retrieved context (offline):\n\n${context.slice(0, 1200)}\n\nConfigure API keys for live tutoring.`,
      offline: true,
      citations: hits.map((h) => h.lesson.id),
    });
  }

  const result = await streamPlain(
    `You are a system design tutor. Use only the context when possible. Cite lesson ids.\n\nContext:\n${context}\n\nUser: ${body.message}`,
    aiConfig.routes.tutor,
  );

  return honoStream(c, async (stream) => {
    for await (const chunk of result.textStream) {
      await stream.write(chunk);
    }
  });
});

app.post("/api/quiz", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) return c.json({ error: "rate_limited" }, 429);
  const body = await c.req.json<{ lessonId: string }>();
  const index = loadContentIndex();
  const lesson = index?.lessons.find((l) => l.id === body.lessonId);
  if (!lesson) return c.json({ error: "lesson_not_found" }, 404);

  const QuizSchema = z.object({
    questions: z.array(
      z.object({
        type: z.enum(["mcq", "short"]),
        prompt: z.string(),
        choices: z.array(z.string()).optional(),
        answer: z.string(),
      }),
    ),
  });

  const key = hashKey({ t: "quiz", id: lesson.id });
  const hit = cacheGet(key);
  if (hit) return c.json({ ...JSON.parse(hit), cached: true });

  if (!hasProviderKey(aiConfig.routes.quiz.provider)) {
    const offline = {
      questions: lesson.concepts.slice(0, 5).map((concept, i) => ({
        type: "short" as const,
        prompt: `Explain: ${concept}`,
        answer: concept,
        id: i,
      })),
      offline: true,
    };
    return c.json(offline);
  }

  const obj = await generateStructured(
    QuizSchema,
    prompts.generateQuiz({
      title: lesson.title,
      content: JSON.stringify(lesson),
    }),
    aiConfig.routes.quiz,
  );
  cacheSet(key, JSON.stringify(obj));
  return c.json({ ...obj, cached: false });
});

app.post("/api/design-review", async (c) => {
  const ip = c.req.header("x-forwarded-for") ?? "local";
  if (!rateLimit(ip)) return c.json({ error: "rate_limited" }, 429);
  const body = await c.req.json<{ challengeId: string; answer: string }>();
  const index = loadContentIndex();
  const challenge = index?.designChallenges.find((ch) => ch.id === body.challengeId);
  if (!challenge) return c.json({ error: "not_found" }, 404);

  const ReviewSchema = z.object({
    strengths: z.array(z.string()),
    gaps: z.array(z.string()),
    rubricScores: z.array(z.object({ item: z.string(), score: z.number(), note: z.string() })),
    nextSteps: z.array(z.string()),
  });

  if (!hasProviderKey(aiConfig.routes.tutor.provider)) {
    return c.json({
      strengths: ["Submitted a design answer"],
      gaps: challenge.checklist.filter(
        (item) => !body.answer.toLowerCase().includes(item.toLowerCase().slice(0, 12)),
      ),
      rubricScores: (challenge.rubric ?? challenge.checklist).map((item) => ({
        item,
        score: body.answer.length > 200 ? 3 : 1,
        note: "Offline heuristic",
      })),
      nextSteps: ["Expand capacity estimation", "Call out failure modes"],
      offline: true,
    });
  }

  const obj = await generateStructured(
    ReviewSchema,
    prompts.designReview({
      challenge: `${challenge.title}\n${challenge.description}`,
      rubric: (challenge.rubric ?? challenge.checklist).join("\n"),
      answer: body.answer,
    }),
    aiConfig.routes.tutor,
  );
  return c.json(obj);
});

app.post("/api/path", async (c) => {
  const body = await c.req.json<{
    completedLessons?: string[];
    goal?: string;
  }>();
  const index = loadContentIndex();
  if (!index) return c.json({ lessons: [] });
  const done = new Set(body.completedLessons ?? []);
  const remaining = index.lessons.filter((l) => !done.has(l.id));
  const goal = body.goal?.toLowerCase() ?? "";
  const ranked = remaining
    .map((l) => ({
      id: l.id,
      title: l.title,
      score:
        (goal && `${l.title} ${l.summary}`.toLowerCase().includes(goal) ? 2 : 0) +
        1,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  return c.json({ lessons: ranked });
});

app.post("/api/promote", async (c) => {
  const body = await c.req.json<{ title: string; content: string; lessonId?: string }>();
  const id = `promote_${Date.now().toString(36)}`;
  db.prepare(
    `INSERT INTO promote_queue (id, payload, created_at) VALUES (?, ?, ?)`,
  ).run(id, JSON.stringify(body), new Date().toISOString());
  return c.json({ id, status: "queued" });
});

function requireScoutAdmin(c: { req: { header: (n: string) => string | undefined } }) {
  if (!SCOUT_ADMIN_TOKEN) return true; // allow in local/dev when unset
  return c.req.header("x-scout-token") === SCOUT_ADMIN_TOKEN;
}

const scoutJobs = new Map<
  string,
  { status: string; events: { stage: string; message: string; data?: unknown }[]; result?: unknown }
>();

app.post("/api/scout", async (c) => {
  if (!requireScoutAdmin(c)) return c.json({ error: "unauthorized" }, 401);
  const body = await c.req.json<{
    mode: "full" | "topic" | "lesson";
    query?: string;
    lessonId?: string;
    depth?: "quick" | "deep";
    propose?: boolean;
  }>();
  const active = [...scoutJobs.values()].filter((j) => j.status === "running").length;
  if (active >= aiConfig.costCaps.maxConcurrentScoutJobs) {
    return c.json({ error: "too_many_jobs" }, 429);
  }

  const jobId = `api_${Date.now().toString(36)}`;
  scoutJobs.set(jobId, { status: "running", events: [] });

  void runScout({
    mode: body.mode,
    query: body.query,
    lessonId: body.lessonId,
    depth: body.depth ?? "quick",
    propose: body.propose,
    onProgress: (e) => {
      const job = scoutJobs.get(jobId);
      if (job) job.events.push(e);
    },
  })
    .then((result) => {
      const job = scoutJobs.get(jobId);
      if (job) {
        job.status = "finished";
        job.result = {
          jobId: result.jobId,
          briefing: result.briefing,
          clusters: result.clusters.map((cl) => ({
            label: cl.label,
            suggestedAction: cl.suggestedAction,
            novelty: cl.novelty,
            durability: cl.durability,
            adoption: cl.adoption,
            relevance: cl.relevance,
            relatedLessonIds: cl.relatedLessonIds,
          })),
          digestPath: result.digestPath,
          itemCount: result.items.length,
        };
      }
    })
    .catch((err) => {
      const job = scoutJobs.get(jobId);
      if (job) {
        job.status = "error";
        job.result = { error: String(err) };
      }
    });

  return c.json({ jobId });
});

app.get("/api/scout/:jobId/stream", async (c) => {
  if (!requireScoutAdmin(c)) return c.json({ error: "unauthorized" }, 401);
  const jobId = c.req.param("jobId");
  return honoStream(c, async (stream) => {
    c.header("Content-Type", "text/event-stream");
    let cursor = 0;
    for (let i = 0; i < 300; i++) {
      const job = scoutJobs.get(jobId);
      if (!job) {
        await stream.write(`data: ${JSON.stringify({ stage: "error", message: "unknown job" })}\n\n`);
        break;
      }
      while (cursor < job.events.length) {
        await stream.write(`data: ${JSON.stringify(job.events[cursor])}\n\n`);
        cursor += 1;
      }
      if (job.status !== "running") {
        await stream.write(
          `data: ${JSON.stringify({ stage: "result", message: job.status, data: job.result })}\n\n`,
        );
        break;
      }
      await stream.sleep(500);
    }
  });
});

app.get("/api/scout/jobs", (c) => {
  if (!requireScoutAdmin(c)) return c.json({ error: "unauthorized" }, 401);
  const memory = [...scoutJobs.entries()].map(([id, j]) => ({
    id,
    status: j.status,
    events: j.events.length,
    result: j.result,
  }));
  return c.json({ memory, db: listJobs(), watchlist: listWatchlist() });
});

app.get("/api/watchlist", (c) => c.json({ items: listWatchlist() }));

console.log(`API server on http://localhost:${PORT}`);
serve({ fetch: app.fetch, port: PORT });
