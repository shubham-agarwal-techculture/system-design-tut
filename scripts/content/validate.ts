import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  DesignChallengeSchema,
  GlobalResourceSchema,
  ModuleSchema,
  PhaseSchema,
} from "../../src/content/schema.ts";
import {
  collectLessonFiles,
  contentDir,
  loadAllLessons,
  loadSyllabus,
  readJson,
} from "./lib.ts";

let errors = 0;

function fail(msg: string) {
  console.error(`✗ ${msg}`);
  errors += 1;
}

function ok(msg: string) {
  console.log(`✓ ${msg}`);
}

function main() {
  const syllabus = loadSyllabus();
  ok(`syllabus ${syllabus.version} loaded (${syllabus.phases.length} phases)`);

  const phases = readJson<unknown[]>(join(contentDir, "phases.json")).map((p) =>
    PhaseSchema.parse(p),
  );
  const modules = readJson<unknown[]>(join(contentDir, "modules.json")).map((m) =>
    ModuleSchema.parse(m),
  );
  const challenges = readJson<unknown[]>(join(contentDir, "challenges.json")).map(
    (c) => DesignChallengeSchema.parse(c),
  );
  const resources = existsSync(join(contentDir, "resources.json"))
    ? readJson<unknown[]>(join(contentDir, "resources.json")).map((r) =>
        GlobalResourceSchema.parse(r),
      )
    : [];

  const lessons = loadAllLessons();
  const ids = new Set<string>();
  for (const lesson of lessons) {
    if (ids.has(lesson.id)) fail(`duplicate lesson id: ${lesson.id}`);
    ids.add(lesson.id);
    if (!modules.some((m) => m.id === lesson.moduleId)) {
      fail(`lesson ${lesson.id} references missing module ${lesson.moduleId}`);
    }
    if (!phases.some((p) => p.id === lesson.phaseId)) {
      fail(`lesson ${lesson.id} references missing phase ${lesson.phaseId}`);
    }
    for (const pre of lesson.prerequisites ?? []) {
      if (!ids.has(pre) && !lessons.some((l) => l.id === pre)) {
        // defer — check after full load
      }
    }
  }

  for (const lesson of lessons) {
    for (const pre of lesson.prerequisites ?? []) {
      if (!ids.has(pre)) fail(`lesson ${lesson.id} has unknown prerequisite ${pre}`);
    }
    for (const rel of lesson.relatedLessons ?? []) {
      if (!ids.has(rel)) fail(`lesson ${lesson.id} has unknown related lesson ${rel}`);
    }
  }

  ok(`${phases.length} phases, ${modules.length} modules`);
  ok(`${lessons.length} lessons (${collectLessonFiles().length} files)`);
  ok(`${challenges.length} challenges, ${resources.length} resources`);

  if (errors > 0) {
    console.error(`\nValidation failed with ${errors} error(s).`);
    process.exit(1);
  }
  console.log("\nValidation passed.");
}

main();
