import { loadAllLessons, loadSyllabus, argValue } from "./lib.ts";

function main() {
  const syllabus = loadSyllabus();
  const lessons = loadAllLessons();
  const byId = new Map(lessons.map((l) => [l.id, l]));
  const moduleFilter = argValue("--module");

  const missing: { phaseId: string; moduleId: string; id: string; title: string }[] =
    [];
  const shallow: { id: string; title: string; reason: string }[] = [];

  for (const phase of syllabus.phases) {
    for (const mod of phase.modules) {
      if (moduleFilter && mod.id !== moduleFilter) continue;
      for (const target of mod.lessons) {
        const existing = byId.get(target.id);
        if (!existing) {
          missing.push({
            phaseId: phase.id,
            moduleId: mod.id,
            id: target.id,
            title: target.title,
          });
          continue;
        }
        const deep = existing.depth?.deepDive?.length ?? 0;
        const expert = existing.depth?.expert?.length ?? 0;
        if (deep === 0) {
          shallow.push({
            id: existing.id,
            title: existing.title,
            reason: "missing deepDive tier",
          });
        }
        if (expert === 0) {
          shallow.push({
            id: existing.id,
            title: existing.title,
            reason: "missing expert tier",
          });
        }
        if ((existing.status ?? "published") === "draft") {
          shallow.push({
            id: existing.id,
            title: existing.title,
            reason: "still draft",
          });
        }
      }
    }
  }

  console.log(`\nGap report${moduleFilter ? ` (module=${moduleFilter})` : ""}`);
  console.log(`Missing lessons: ${missing.length}`);
  for (const m of missing) {
    console.log(`  - [${m.phaseId}/${m.moduleId}] ${m.id}: ${m.title}`);
  }
  console.log(`\nShallow / incomplete: ${shallow.length}`);
  for (const s of shallow.slice(0, 40)) {
    console.log(`  - ${s.id}: ${s.reason}`);
  }
  if (shallow.length > 40) console.log(`  …and ${shallow.length - 40} more`);

  // Exit 0 always — gaps are informational for the pipeline
}

main();
