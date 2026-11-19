import { loadAllLessons, lessonPath, writeJson } from "./lib.ts";

/**
 * Heuristic organizer (works offline). With API keys, generate.ts / scout can
 * refine further — this pass ensures relatedLessons and basic prerequisites.
 */
function main() {
  const lessons = loadAllLessons();
  const byModule = new Map<string, typeof lessons>();
  for (const l of lessons) {
    const list = byModule.get(l.moduleId) ?? [];
    list.push(l);
    byModule.set(l.moduleId, list);
  }

  let updated = 0;
  for (const [, group] of byModule) {
    group.sort((a, b) => a.id.localeCompare(b.id));
    for (let i = 0; i < group.length; i++) {
      const lesson = group[i];
      const related = group
        .filter((g) => g.id !== lesson.id)
        .slice(0, 3)
        .map((g) => g.id);
      const prerequisites =
        lesson.prerequisites?.length
          ? lesson.prerequisites
          : i > 0
            ? [group[i - 1].id]
            : [];

      if (
        JSON.stringify(related) !== JSON.stringify(lesson.relatedLessons ?? []) ||
        JSON.stringify(prerequisites) !== JSON.stringify(lesson.prerequisites ?? [])
      ) {
        writeJson(lessonPath(lesson.moduleId, lesson.id), {
          ...lesson,
          relatedLessons: related,
          prerequisites,
          tags: Array.from(
            new Set([...(lesson.tags ?? []), lesson.moduleId, lesson.phaseId]),
          ),
        });
        updated += 1;
      }
    }
  }
  console.log(`Organized graph; updated ${updated} lesson(s).`);
}

main();
