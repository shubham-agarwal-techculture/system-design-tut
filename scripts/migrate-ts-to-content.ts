/**
 * One-time migration: serialize existing TypeScript curriculum into content/ JSON.
 * Run: npx tsx scripts/migrate-ts-to-content.ts
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const contentDir = join(root, "content");

async function loadModule(rel: string) {
  const abs = pathToFileURL(join(root, rel)).href;
  return import(abs);
}

function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function main() {
  // Import via Vite-unaware paths — use relative from src via tsx + path aliases won't work.
  // So we dynamically import compiled-ish TS with tsx which respects nothing for @/.
  // Workaround: import using relative file paths.
  const { phases } = await loadModule("src/data/phases.ts");
  const { modules } = await loadModule("src/data/modules.ts");
  const { lessons } = await loadModule("src/data/lessons/index.ts");
  const { designChallenges, globalResources } = await loadModule(
    "src/data/challenges.ts",
  );

  writeJson(join(contentDir, "phases.json"), phases);
  writeJson(join(contentDir, "modules.json"), modules);
  writeJson(join(contentDir, "challenges.json"), designChallenges);
  writeJson(join(contentDir, "resources.json"), globalResources);

  const today = new Date().toISOString().slice(0, 10);

  for (const lesson of lessons) {
    const enriched = {
      ...lesson,
      kind: "evergreen",
      difficulty: "intermediate",
      status: "published",
      version: "1.0.0",
      lastReviewed: today,
      prerequisites: lesson.prerequisites ?? [],
      tags: lesson.tags ?? [lesson.moduleId],
      depth: {
        core: lesson.sections,
        deepDive: [],
        expert: [],
      },
      numbersToKnow: [],
      diagrams: [],
      caseStudies: [],
      interviewQuestions: [],
      exercises: [],
      sources: (lesson.resources ?? []).map((title: string) => ({ title })),
      relatedLessons: [],
    };
    writeJson(
      join(contentDir, "lessons", lesson.moduleId, `${lesson.id}.json`),
      enriched,
    );
  }

  console.log(
    `Migrated ${phases.length} phases, ${modules.length} modules, ${lessons.length} lessons, ${designChallenges.length} challenges.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
