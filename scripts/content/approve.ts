import { argValue, lessonPath, loadLesson, writeJson } from "./lib.ts";

function main() {
  const id = argValue("--lesson") ?? process.argv[2];
  if (!id || id.startsWith("-")) {
    console.error("Usage: npm run content:approve -- <lessonId>");
    process.exit(1);
  }
  const lesson = loadLesson(id);
  if (!lesson) {
    console.error(`Lesson not found: ${id}`);
    process.exit(1);
  }
  const updated = {
    ...lesson,
    status: "published" as const,
    lastReviewed: new Date().toISOString().slice(0, 10),
    version: bumpPatch(lesson.version ?? "0.1.0"),
  };
  writeJson(lessonPath(lesson.moduleId, lesson.id), updated);
  console.log(`Approved ${id} → published (v${updated.version})`);
}

function bumpPatch(v: string) {
  const parts = v.split(".").map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return "1.0.0";
  parts[2] += 1;
  return parts.join(".");
}

main();
