import type { LessonSection, LessonExample, LessonCaseStudy } from "@/types";

/** Helper to keep lesson authoring consistent across module files. */
export function lesson(partial: {
  id: string;
  title: string;
  moduleId: string;
  phaseId: string;
  durationMinutes: number;
  summary: string;
  sections: LessonSection[];
  concepts: string[];
  practices: string[];
  pitfalls: string[];
  examples: LessonExample[];
  keyTakeaways: string[];
  whyItMatters: string;
  reflectionQuestions: string[];
  caseStudies?: LessonCaseStudy[];
  resources?: string[];
}) {
  return partial;
}
