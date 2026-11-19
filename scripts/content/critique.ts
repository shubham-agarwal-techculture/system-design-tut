import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { z } from "zod";
import { aiConfig } from "../../ai.config.ts";
import { generateStructured, hasProviderKey } from "../../ai/providers/index.ts";
import { prompts } from "../../ai/prompts/index.ts";
import { argValue, contentDir, loadAllLessons, loadLesson } from "./lib.ts";

const CritiqueSchema = z.object({
  accuracyIssues: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  outdatedClaims: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
  score: z.number().min(0).max(100),
});

async function critiqueOne(id: string) {
  const lesson = loadLesson(id);
  if (!lesson) {
    console.error(`Lesson not found: ${id}`);
    return;
  }

  const outDir = join(contentDir, "reviews");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, `${id}.json`);

  if (!hasProviderKey(aiConfig.routes.critique.provider)) {
    const offline = {
      lessonId: id,
      provider: "offline",
      score: lesson.status === "draft" ? 55 : 75,
      accuracyIssues: [],
      gaps: [
        ...(lesson.depth?.deepDive?.length ? [] : ["Missing deepDive tier"]),
        ...(lesson.sources?.length ? [] : ["No sources listed"]),
      ],
      outdatedClaims: [],
      suggestions: ["Have a human review before publishing"],
      at: new Date().toISOString(),
    };
    writeFileSync(outPath, JSON.stringify(offline, null, 2) + "\n");
    console.log(`Offline critique → ${outPath} (score ${offline.score})`);
    return;
  }

  const result = await generateStructured(
    CritiqueSchema,
    prompts.critiqueLesson({ id, content: JSON.stringify(lesson) }),
    aiConfig.routes.critique,
  );
  writeFileSync(
    outPath,
    JSON.stringify(
      { lessonId: id, ...result, at: new Date().toISOString() },
      null,
      2,
    ) + "\n",
  );
  console.log(`Critique → ${outPath} (score ${result.score})`);
}

async function main() {
  const id = argValue("--lesson");
  if (id) {
    await critiqueOne(id);
    return;
  }
  const drafts = loadAllLessons().filter((l) => l.status === "draft");
  console.log(`Critiquing ${drafts.length} draft(s)…`);
  for (const d of drafts) await critiqueOne(d.id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
