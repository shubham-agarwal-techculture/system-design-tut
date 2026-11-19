import type { Lesson } from "../../src/content/schema.ts";

export interface RichSpec {
  id: string;
  title: string;
  moduleId: string;
  phaseId: string;
  kind?: "evergreen" | "living";
  difficulty?: "beginner" | "intermediate" | "advanced" | "expert";
  durationMinutes?: number;
  summary: string;
  sections: {
    title: string;
    paragraphs: string[];
    bullets?: string[];
  }[];
  deepDive?: { title: string; paragraphs: string[]; bullets?: string[] }[];
  expert?: { title: string; paragraphs: string[]; bullets?: string[] }[];
  concepts: string[];
  practices: string[];
  pitfalls: string[];
  examples: { title: string; description: string }[];
  keyTakeaways: string[];
  whyItMatters: string;
  reflectionQuestions: string[];
  numbersToKnow?: string[];
  interviewQuestions?: string[];
  exercises?: string[];
  sources?: { title: string; url?: string }[];
  prerequisites?: string[];
  tags?: string[];
  diagram?: { title: string; mermaid: string };
}

export function buildRichLesson(spec: RichSpec): Lesson {
  const today = new Date().toISOString().slice(0, 10);
  const deepDive = spec.deepDive ?? [
    {
      title: `${spec.title} — Operations`,
      paragraphs: [
        `Operating ${spec.title} in production means defining SLIs before tuning knobs, knowing amplification costs, and rehearsing failure modes.`,
        "Prefer reversible changes, feature flags, and canaries. Measure p50/p99 and error rate under load that matches production skew.",
      ],
      bullets: [
        "Define capacity from the scarcest resource",
        "Document blast radius per dependency",
        "Keep rollback cheaper than forward repair when possible",
      ],
    },
    {
      title: `${spec.title} — Failure modes`,
      paragraphs: [
        `Common failures around ${spec.title} include overload, partial dependency outages, and silent correctness bugs that pass happy-path tests.`,
        "Inject faults in staging: latency, loss, clock skew, and disk full. Verify alerts fire and degradation is intentional.",
      ],
    },
  ];
  const expert = spec.expert ?? [
    {
      title: `${spec.title} — Expert notes`,
      paragraphs: [
        `At the expert level, ${spec.title} intersects multi-region consistency, cost envelopes, and organizational constraints (team ownership, on-call load).`,
        "Write down the non-goals. Many outages come from optimizing a metric that was never the product requirement.",
      ],
    },
  ];

  return {
    id: spec.id,
    title: spec.title,
    moduleId: spec.moduleId,
    phaseId: spec.phaseId,
    durationMinutes: spec.durationMinutes ?? 40,
    summary: spec.summary,
    kind: spec.kind ?? "evergreen",
    difficulty: spec.difficulty ?? "intermediate",
    status: "published",
    version: "1.0.0",
    lastReviewed: today,
    prerequisites: spec.prerequisites ?? [],
    tags: spec.tags ?? [spec.moduleId, spec.kind ?? "evergreen"],
    sections: spec.sections,
    depth: {
      core: spec.sections,
      deepDive,
      expert,
    },
    concepts: spec.concepts,
    practices: spec.practices,
    pitfalls: spec.pitfalls,
    examples: spec.examples,
    keyTakeaways: spec.keyTakeaways,
    whyItMatters: spec.whyItMatters,
    reflectionQuestions: spec.reflectionQuestions,
    numbersToKnow: spec.numbersToKnow ?? [],
    diagrams: spec.diagram
      ? [
          {
            id: `${spec.id}-overview`,
            title: spec.diagram.title,
            mermaid: spec.diagram.mermaid,
          },
        ]
      : [
          {
            id: `${spec.id}-overview`,
            title: `${spec.title} overview`,
            mermaid: `flowchart LR\n  Client --> System\n  System --> Dependency`,
          },
        ],
    caseStudies: [],
    interviewQuestions: spec.interviewQuestions ?? [
      `Explain ${spec.title} and the main trade-offs in three minutes.`,
    ],
    exercises: spec.exercises ?? [
      `Sketch a design that depends on ${spec.title}; list three trade-offs and one failure mode.`,
    ],
    sources: spec.sources ?? [],
    relatedLessons: [],
  };
}
