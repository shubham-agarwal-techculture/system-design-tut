import { aiConfig } from "../../ai.config.ts";

const header = (task: string) =>
  `You are a senior systems engineer writing curriculum for a production-grade system design guide.
Task: ${task}
Prompt version: ${aiConfig.promptVersion}
Rules:
- Be precise, technical, and free of marketing language.
- Prefer first principles and measurable trade-offs.
- Cite sources when making claims about living/fast-moving topics.
- Output must match the requested JSON schema exactly when structured output is requested.
`;

export const prompts = {
  generateLesson: (args: {
    id: string;
    title: string;
    moduleId: string;
    phaseId: string;
    kind: string;
  }) =>
    `${header("Generate a complete lesson draft")}
Lesson id: ${args.id}
Title: ${args.title}
Module: ${args.moduleId}
Phase: ${args.phaseId}
Kind: ${args.kind} (evergreen = first principles; living = current tooling/practices)
Write core sections, concepts, practices, pitfalls, examples, keyTakeaways, whyItMatters, reflectionQuestions, and prerequisites.
Mark status as draft.`,

  deepenLesson: (args: { id: string; title: string; existingCore: string }) =>
    `${header("Deepen an existing lesson")}
Lesson: ${args.id} — ${args.title}
Existing core content:
${args.existingCore}
Add deepDive and expert section tiers, 1–2 Mermaid diagrams, caseStudies, numbersToKnow, interviewQuestions, and exercises.
Do not rewrite core unless factually wrong.`,

  critiqueLesson: (args: { id: string; content: string }) =>
    `${header("Critique a lesson draft")}
Lesson id: ${args.id}
Content:
${args.content}
Return JSON with: accuracyIssues[], gaps[], outdatedClaims[], suggestions[], score (0-100).`,

  refreshLiving: (args: { id: string; content: string; sources: string }) =>
    `${header("Refresh a living lesson")}
Lesson id: ${args.id}
Current content:
${args.content}
Recent sources / signals:
${args.sources}
Propose a patch: list changedSections[], newClaims[] with citations, and a changelogEntry.
Never invent sources.`,

  generateQuiz: (args: { title: string; content: string }) =>
    `${header("Generate practice quiz")}
Lesson: ${args.title}
Content:
${args.content}
Return 5 questions with type (mcq|short), prompt, choices (for mcq), and answer.`,

  scoutScore: (args: { clusterSummary: string; existingCoverage: string }) =>
    `${header("Score an emerging topic cluster")}
Cluster:
${args.clusterSummary}
Existing lesson coverage:
${args.existingCoverage}
Return JSON: { label, novelty (0-1), durability (0-1), adoption (0-1), relevance (0-1), rationale, suggestedAction: watchlist|draft|refresh|ignore, relatedLessonIds[] }.`,

  explain: (args: {
    section: string;
    mode: "simpler" | "expert" | "analogy";
  }) =>
    `${header(`Explain a section (${args.mode})`)}
Section:
${args.section}`,

  designReview: (args: {
    challenge: string;
    rubric: string;
    answer: string;
  }) =>
    `${header("Review a system design answer")}
Challenge:
${args.challenge}
Rubric:
${args.rubric}
Candidate answer:
${args.answer}
Return structured feedback: strengths[], gaps[], rubricScores[], nextSteps[].`,

  organizeGraph: (args: { lessonSummaries: string }) =>
    `${header("Reorganize curriculum graph")}
Lessons:
${args.lessonSummaries}
Propose prerequisites and relatedLessons for each id. Prefer minimal, accurate edges.`,
} as const;
