import { z } from "zod";

export const DifficultySchema = z.enum([
  "beginner",
  "intermediate",
  "advanced",
  "expert",
]);

export const ContentKindSchema = z.enum(["evergreen", "living"]);

export const ContentStatusSchema = z.enum(["draft", "reviewed", "published"]);

export const LessonSectionSchema = z.object({
  title: z.string().min(1),
  paragraphs: z.array(z.string()).min(1),
  bullets: z.array(z.string()).optional(),
});

export const LessonExampleSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

export const DiagramSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  mermaid: z.string().min(1),
  caption: z.string().optional(),
});

export const CaseStudySchema = z.object({
  title: z.string().min(1),
  company: z.string().optional(),
  summary: z.string().min(1),
  takeaways: z.array(z.string()).optional(),
});

export const SourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  note: z.string().optional(),
});

export const GeneratedBySchema = z.object({
  provider: z.string().min(1),
  model: z.string().min(1),
  at: z.string().optional(),
});

export const DepthTierSchema = z.object({
  core: z.array(LessonSectionSchema).default([]),
  deepDive: z.array(LessonSectionSchema).default([]),
  expert: z.array(LessonSectionSchema).default([]),
});

export const LessonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  moduleId: z.string().min(1),
  phaseId: z.string().min(1),
  durationMinutes: z.number().positive(),
  summary: z.string().min(1),
  kind: ContentKindSchema.default("evergreen"),
  difficulty: DifficultySchema.default("intermediate"),
  status: ContentStatusSchema.default("published"),
  version: z.string().default("1.0.0"),
  lastReviewed: z.string().optional(),
  prerequisites: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  /** Legacy flat sections — used as core when depth.core is empty */
  sections: z.array(LessonSectionSchema).default([]),
  depth: DepthTierSchema.optional(),
  concepts: z.array(z.string()).default([]),
  practices: z.array(z.string()).default([]),
  pitfalls: z.array(z.string()).default([]),
  examples: z.array(LessonExampleSchema).default([]),
  keyTakeaways: z.array(z.string()).default([]),
  whyItMatters: z.string().default(""),
  reflectionQuestions: z.array(z.string()).default([]),
  resources: z.array(z.string()).optional(),
  numbersToKnow: z.array(z.string()).default([]),
  diagrams: z.array(DiagramSchema).default([]),
  caseStudies: z.array(CaseStudySchema).default([]),
  interviewQuestions: z.array(z.string()).default([]),
  exercises: z.array(z.string()).default([]),
  sources: z.array(SourceSchema).default([]),
  generatedBy: GeneratedBySchema.optional(),
  relatedLessons: z.array(z.string()).default([]),
});

export const ModuleSchema = z.object({
  id: z.string().min(1),
  phaseId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  order: z.number().int().nonnegative(),
  resources: z.array(z.string()).optional(),
});

export const PhaseSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  color: z.string().min(1),
});

export const DesignChallengeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  difficulty: DifficultySchema,
  description: z.string().min(1),
  hints: z.array(z.string()).default([]),
  checklist: z.array(z.string()).default([]),
  estimatedMinutes: z.number().positive(),
  rubric: z.array(z.string()).default([]),
  referenceSolution: z.string().optional(),
  scaleVariants: z.array(z.string()).default([]),
  moduleId: z.string().optional(),
  phaseId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  status: ContentStatusSchema.default("published"),
});

export const GlobalResourceSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["book", "blog", "opensource"]),
  url: z.string().url().optional(),
  note: z.string().optional(),
});

export const SyllabusLessonTargetSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  kind: ContentKindSchema.default("evergreen"),
  difficulty: DifficultySchema.optional(),
  depth: z.enum(["core", "deepDive", "expert"]).default("core"),
});

export const SyllabusModuleSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  lessons: z.array(SyllabusLessonTargetSchema).default([]),
});

export const SyllabusPhaseSchema = z.object({
  id: z.string().min(1),
  number: z.number().int().positive(),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  color: z.string().optional(),
  modules: z.array(SyllabusModuleSchema).default([]),
});

export const SyllabusSchema = z.object({
  version: z.string().default("1.0.0"),
  updated: z.string().optional(),
  phases: z.array(SyllabusPhaseSchema),
});

export type Lesson = z.infer<typeof LessonSchema>;
export type Module = z.infer<typeof ModuleSchema>;
export type Phase = z.infer<typeof PhaseSchema>;
export type DesignChallenge = z.infer<typeof DesignChallengeSchema>;
export type GlobalResource = z.infer<typeof GlobalResourceSchema>;
export type Syllabus = z.infer<typeof SyllabusSchema>;
export type Difficulty = z.infer<typeof DifficultySchema>;
export type ContentKind = z.infer<typeof ContentKindSchema>;
export type ContentStatus = z.infer<typeof ContentStatusSchema>;

/** Resolve sections for a depth tier, falling back to legacy sections for core. */
export function sectionsForDepth(
  lesson: Lesson,
  tier: "core" | "deepDive" | "expert" = "core",
) {
  if (tier === "core") {
    if (lesson.depth?.core?.length) return lesson.depth.core;
    return lesson.sections;
  }
  return lesson.depth?.[tier] ?? [];
}
