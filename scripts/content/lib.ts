import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  LessonSchema,
  SyllabusSchema,
  type Lesson,
  type Syllabus,
} from "../../src/content/schema.ts";

export const root = join(dirname(fileURLToPath(import.meta.url)), "../..");
export const contentDir = join(root, "content");

export function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function writeJson(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n", "utf8");
}

export function loadSyllabus(): Syllabus {
  const raw = parseYaml(readFileSync(join(contentDir, "syllabus.yaml"), "utf8"));
  return SyllabusSchema.parse(raw);
}

export function collectLessonFiles(dir = join(contentDir, "lessons")): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...collectLessonFiles(full));
    else if (entry.name.endsWith(".json")) out.push(full);
  }
  return out;
}

export function loadAllLessons(): Lesson[] {
  return collectLessonFiles().map((file) => {
    const parsed = LessonSchema.safeParse(readJson(file));
    if (!parsed.success) {
      throw new Error(`Invalid lesson ${file}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
}

export function lessonPath(moduleId: string, id: string) {
  return join(contentDir, "lessons", moduleId, `${id}.json`);
}

export function loadLesson(id: string): Lesson | undefined {
  return loadAllLessons().find((l) => l.id === id);
}

export function argValue(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag);
  if (idx >= 0 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith("-")) {
    return process.argv[idx + 1];
  }
  const eq = process.argv.find((a) => a.startsWith(`${flag}=`));
  return eq ? eq.split("=").slice(1).join("=") : undefined;
}

export function hasFlag(flag: string) {
  return process.argv.includes(flag);
}

export function stubLesson(args: {
  id: string;
  title: string;
  moduleId: string;
  phaseId: string;
  kind: "evergreen" | "living";
}): Lesson {
  const today = new Date().toISOString().slice(0, 10);
  return LessonSchema.parse({
    id: args.id,
    title: args.title,
    moduleId: args.moduleId,
    phaseId: args.phaseId,
    durationMinutes: 30,
    summary: `${args.title} — draft awaiting generation and review.`,
    kind: args.kind,
    difficulty: "intermediate",
    status: "draft",
    version: "0.1.0",
    lastReviewed: today,
    prerequisites: [],
    tags: [args.moduleId, args.kind],
    sections: [
      {
        title: "Overview",
        paragraphs: [
          `This draft covers ${args.title}. Run content:generate to expand it with a model provider, or edit manually.`,
        ],
      },
    ],
    depth: {
      core: [
        {
          title: "Overview",
          paragraphs: [
            `This draft covers ${args.title}. Run content:generate to expand it with a model provider, or edit manually.`,
          ],
        },
      ],
      deepDive: [],
      expert: [],
    },
    concepts: [`${args.title}: core idea`],
    practices: ["Start from requirements and constraints before choosing tools"],
    pitfalls: ["Treating tooling fashion as architecture"],
    examples: [],
    keyTakeaways: [`${args.title} belongs in the curriculum as ${args.kind} content`],
    whyItMatters: `Understanding ${args.title} improves design judgment for production systems.`,
    reflectionQuestions: [
      `When would you reach for ${args.title} in a real design?`,
    ],
    numbersToKnow: [],
    diagrams: [],
    caseStudies: [],
    interviewQuestions: [],
    exercises: [],
    sources: [],
    relatedLessons: [],
  });
}
