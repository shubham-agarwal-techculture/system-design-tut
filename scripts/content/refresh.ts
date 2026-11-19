import { mkdirSync, appendFileSync } from "node:fs";
import { join } from "node:path";
import { aiConfig } from "../../ai.config.ts";
import { generateStructured, hasProviderKey } from "../../ai/providers/index.ts";
import { prompts } from "../../ai/prompts/index.ts";
import { z } from "zod";
import {
  argValue,
  contentDir,
  lessonPath,
  loadAllLessons,
  writeJson,
} from "./lib.ts";

const RefreshSchema = z.object({
  changedSections: z.array(z.string()).default([]),
  newClaims: z
    .array(z.object({ claim: z.string(), source: z.string() }))
    .default([]),
  changelogEntry: z.string(),
  suggestedPatch: z.string().optional(),
});

function daysSince(dateStr?: string) {
  if (!dateStr) return Infinity;
  const t = Date.parse(dateStr);
  if (Number.isNaN(t)) return Infinity;
  return (Date.now() - t) / (1000 * 60 * 60 * 24);
}

async function main() {
  const onlyId = argValue("--lesson");
  const lessons = loadAllLessons().filter((l) => {
    if (onlyId) return l.id === onlyId;
    return (l.kind ?? "evergreen") === "living";
  });

  const due = lessons.filter(
    (l) => daysSince(l.lastReviewed) >= aiConfig.livingRefreshDays || onlyId,
  );

  console.log(`Refresh candidates: ${due.length}`);
  mkdirSync(join(contentDir, "changelog"), { recursive: true });
  const logPath = join(contentDir, "changelog", "REFRESH.md");

  for (const lesson of due) {
    if (lesson.kind === "evergreen" && !onlyId) {
      console.log(`skip evergreen ${lesson.id} (suggestions only via --lesson)`);
      continue;
    }

    if (!hasProviderKey(aiConfig.routes.refresh.provider)) {
      const entry = `- ${new Date().toISOString().slice(0, 10)}: ${lesson.id} flagged for human refresh (no API key)\n`;
      appendFileSync(logPath, entry);
      console.log(`flagged ${lesson.id}`);
      continue;
    }

    const result = await generateStructured(
      RefreshSchema,
      prompts.refreshLiving({
        id: lesson.id,
        content: JSON.stringify(lesson),
        sources: JSON.stringify(lesson.sources ?? []),
      }),
      aiConfig.routes.refresh,
    );

    // Living lessons may receive a soft bump of lastReviewed only when claims empty;
    // never auto-overwrite evergreen. For living, append changelog; human merges patch.
    appendFileSync(
      logPath,
      `- ${new Date().toISOString().slice(0, 10)}: **${lesson.id}** — ${result.changelogEntry}\n`,
    );
    writeJson(join(contentDir, "reviews", `${lesson.id}.refresh.json`), {
      lessonId: lesson.id,
      ...result,
      at: new Date().toISOString(),
    });

    if (lesson.kind === "living" && result.newClaims.length === 0) {
      writeJson(lessonPath(lesson.moduleId, lesson.id), {
        ...lesson,
        lastReviewed: new Date().toISOString().slice(0, 10),
      });
    }
    console.log(`refresh report → ${lesson.id}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
