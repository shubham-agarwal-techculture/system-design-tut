import { existsSync } from "node:fs";
import { aiConfig } from "../../ai.config.ts";
import { hasProviderKey, generateStructured } from "../../ai/providers/index.ts";
import { prompts } from "../../ai/prompts/index.ts";
import { LessonSchema } from "../../src/content/schema.ts";
import {
  argValue,
  hasFlag,
  lessonPath,
  loadSyllabus,
  stubLesson,
  writeJson,
} from "./lib.ts";

async function main() {
  const moduleId = argValue("--module");
  const lessonId = argValue("--lesson");
  const force = hasFlag("--force");
  const syllabus = loadSyllabus();

  const targets: {
    id: string;
    title: string;
    moduleId: string;
    phaseId: string;
    kind: "evergreen" | "living";
  }[] = [];

  for (const phase of syllabus.phases) {
    for (const mod of phase.modules) {
      if (moduleId && mod.id !== moduleId) continue;
      for (const t of mod.lessons) {
        if (lessonId && t.id !== lessonId) continue;
        targets.push({
          id: t.id,
          title: t.title,
          moduleId: mod.id,
          phaseId: phase.id,
          kind: t.kind,
        });
      }
    }
  }

  if (targets.length === 0) {
    console.log("No matching syllabus targets. Use --module or --lesson.");
    return;
  }

  const canGenerate = hasProviderKey(aiConfig.routes.generate.provider);
  let created = 0;

  for (const t of targets.slice(0, aiConfig.costCaps.maxNewLessonsPerRun * 4)) {
    const path = lessonPath(t.moduleId, t.id);
    if (existsSync(path) && !force) {
      console.log(`skip ${t.id} (exists)`);
      continue;
    }

    let lesson = stubLesson(t);

    if (canGenerate) {
      try {
        const generated = await generateStructured(
          LessonSchema,
          prompts.generateLesson(t),
          aiConfig.routes.generate,
        );
        lesson = {
          ...generated,
          id: t.id,
          moduleId: t.moduleId,
          phaseId: t.phaseId,
          status: "draft",
          kind: t.kind,
        };
        console.log(`generated ${t.id}`);
      } catch (err) {
        console.warn(
          `model generate failed for ${t.id}, writing stub:`,
          err instanceof Error ? err.message : err,
        );
      }
    } else {
      console.log(`stub ${t.id} (no API key for ${aiConfig.routes.generate.provider})`);
    }

    writeJson(path, lesson);
    created += 1;
    if (created >= aiConfig.costCaps.maxNewLessonsPerRun && canGenerate) {
      console.log(`Hit maxNewLessonsPerRun=${aiConfig.costCaps.maxNewLessonsPerRun}`);
      break;
    }
  }

  console.log(`Done. Wrote ${created} lesson file(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
