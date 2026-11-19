import { aiConfig } from "../../ai.config.ts";
import { generateStructured, hasProviderKey } from "../../ai/providers/index.ts";
import { prompts } from "../../ai/prompts/index.ts";
import { DepthTiersSchema, LessonSectionSchema } from "../../src/content/schema.ts";
import { z } from "zod";
import {
  argValue,
  lessonPath,
  loadLesson,
  writeJson,
} from "./lib.ts";

const DeepenResult = z.object({
  deepDive: z.array(LessonSectionSchema),
  expert: z.array(LessonSectionSchema),
  diagrams: z
    .array(
      z.object({
        id: z.string(),
        title: z.string(),
        mermaid: z.string(),
        caption: z.string().optional(),
      }),
    )
    .default([]),
  caseStudies: z
    .array(
      z.object({
        title: z.string(),
        company: z.string().optional(),
        summary: z.string(),
        takeaways: z.array(z.string()).optional(),
      }),
    )
    .default([]),
  numbersToKnow: z.array(z.string()).default([]),
  interviewQuestions: z.array(z.string()).default([]),
  exercises: z.array(z.string()).default([]),
});

async function main() {
  const id = argValue("--lesson") ?? process.argv[2];
  if (!id || id.startsWith("-")) {
    console.error("Usage: npm run content:deepen -- --lesson <id>");
    process.exit(1);
  }

  const lesson = loadLesson(id);
  if (!lesson) {
    console.error(`Lesson not found: ${id}`);
    process.exit(1);
  }

  const coreText = JSON.stringify(lesson.depth?.core?.length ? lesson.depth.core : lesson.sections);

  if (!hasProviderKey(aiConfig.routes.deepen.provider)) {
    // Offline deepen: add structural placeholders
    const deepened = {
      ...lesson,
      depth: DepthTiersSchema.parse({
        core: lesson.depth?.core?.length ? lesson.depth.core : lesson.sections,
        deepDive: [
          {
            title: `${lesson.title} — Deep Dive`,
            paragraphs: [
              `Extended treatment of ${lesson.title}: internals, failure modes, and operational knobs.`,
              "Replace this placeholder by running content:deepen with an API key, or edit manually.",
            ],
            bullets: [
              "Measure before optimizing",
              "Document the failure domain",
              "Know the amplification costs (read/write/space)",
            ],
          },
        ],
        expert: [
          {
            title: `${lesson.title} — Expert Notes`,
            paragraphs: [
              `Expert-level considerations for ${lesson.title}: edge cases, multi-region behavior, and cost envelopes.`,
            ],
          },
        ],
      }),
      diagrams:
        lesson.diagrams?.length
          ? lesson.diagrams
          : [
              {
                id: `${lesson.id}-overview`,
                title: `${lesson.title} overview`,
                mermaid: `flowchart LR\n  Client --> System\n  System --> Store`,
                caption: "Placeholder diagram — refine during review",
              },
            ],
      numbersToKnow: lesson.numbersToKnow?.length
        ? lesson.numbersToKnow
        : ["Latency budget: define p50/p99 before scaling"],
      interviewQuestions: lesson.interviewQuestions?.length
        ? lesson.interviewQuestions
        : [`How would you explain ${lesson.title} in a design interview?`],
      exercises: lesson.exercises?.length
        ? lesson.exercises
        : [`Sketch a design that depends on ${lesson.title} and list three trade-offs.`],
    };
    writeJson(lessonPath(lesson.moduleId, lesson.id), deepened);
    console.log(`Deepened ${id} offline (placeholders).`);
    return;
  }

  const result = await generateStructured(
    DeepenResult,
    prompts.deepenLesson({
      id: lesson.id,
      title: lesson.title,
      existingCore: coreText,
    }),
    aiConfig.routes.deepen,
  );

  const updated = {
    ...lesson,
    depth: {
      core: lesson.depth?.core?.length ? lesson.depth.core : lesson.sections,
      deepDive: result.deepDive,
      expert: result.expert,
    },
    diagrams: [...(lesson.diagrams ?? []), ...result.diagrams],
    caseStudies: [...(lesson.caseStudies ?? []), ...result.caseStudies],
    numbersToKnow: result.numbersToKnow,
    interviewQuestions: result.interviewQuestions,
    exercises: result.exercises,
  };
  writeJson(lessonPath(lesson.moduleId, lesson.id), updated);
  console.log(`Deepened ${id}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
