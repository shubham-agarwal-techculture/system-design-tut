/**
 * Compile content/ into src/generated/content-index.json (+ search + graph metadata).
 * Run: npx tsx --tsconfig tsconfig.scripts.json scripts/build-content-index.ts
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  LessonSchema,
  ModuleSchema,
  PhaseSchema,
  DesignChallengeSchema,
  GlobalResourceSchema,
} from "../src/content/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");
const outDir = join(root, "src", "generated");

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

function collectLessonFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectLessonFiles(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

function main() {
  if (!existsSync(contentDir)) {
    console.error("content/ missing — run migrate-ts-to-content first");
    process.exit(1);
  }

  const phasesRaw = readJson<unknown[]>(join(contentDir, "phases.json"));
  const modulesRaw = readJson<unknown[]>(join(contentDir, "modules.json"));
  const challengesRaw = readJson<unknown[]>(join(contentDir, "challenges.json"));
  const resourcesRaw = existsSync(join(contentDir, "resources.json"))
    ? readJson<unknown[]>(join(contentDir, "resources.json"))
    : [];

  const phases = phasesRaw.map((p, i) => {
    const r = PhaseSchema.safeParse(p);
    if (!r.success) {
      console.error(`Invalid phase[${i}]`, r.error.flatten());
      process.exit(1);
    }
    return r.data;
  });

  const modules = modulesRaw.map((m, i) => {
    const r = ModuleSchema.safeParse(m);
    if (!r.success) {
      console.error(`Invalid module[${i}]`, r.error.flatten());
      process.exit(1);
    }
    return r.data;
  });

  const lessons = collectLessonFiles(join(contentDir, "lessons")).map((file) => {
    const raw = readJson<unknown>(file);
    const r = LessonSchema.safeParse(raw);
    if (!r.success) {
      console.error(`Invalid lesson ${file}`, r.error.flatten());
      process.exit(1);
    }
    return r.data;
  });

  const challenges = challengesRaw.map((c, i) => {
    const r = DesignChallengeSchema.safeParse(c);
    if (!r.success) {
      console.error(`Invalid challenge[${i}]`, r.error.flatten());
      process.exit(1);
    }
    return r.data;
  });

  const resources = resourcesRaw.map((res, i) => {
    const r = GlobalResourceSchema.safeParse(res);
    if (!r.success) {
      console.error(`Invalid resource[${i}]`, r.error.flatten());
      process.exit(1);
    }
    return r.data;
  });

  // Prerequisite graph edges
  const graph = {
    nodes: lessons.map((l) => ({ id: l.id, title: l.title, moduleId: l.moduleId, phaseId: l.phaseId })),
    edges: lessons.flatMap((l) =>
      (l.prerequisites ?? []).map((from) => ({ from, to: l.id })),
    ),
  };

  // Search documents for MiniSearch (client builds the index)
  const searchDocs = lessons.map((l) => ({
    id: l.id,
    title: l.title,
    summary: l.summary,
    moduleId: l.moduleId,
    phaseId: l.phaseId,
    tags: (l.tags ?? []).join(" "),
    concepts: (l.concepts ?? []).join(" "),
    kind: l.kind ?? "evergreen",
  }));

  const index = {
    generatedAt: new Date().toISOString(),
    phases,
    modules,
    lessons,
    designChallenges: challenges,
    globalResources: resources,
    graph,
    searchDocs,
  };

  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "content-index.json"),
    JSON.stringify(index, null, 2) + "\n",
    "utf8",
  );

  console.log(
    `Built content index: ${phases.length} phases, ${modules.length} modules, ${lessons.length} lessons, ${challenges.length} challenges.`,
  );
}

main();
