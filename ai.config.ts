export type ProviderId = "openai" | "anthropic" | "google" | "cursor";

export interface ModelRoute {
  provider: ProviderId;
  model: string;
}

export const aiConfig = {
  /** Per-run caps shared by pipeline and scout */
  costCaps: {
    maxTokensPerJob: 120_000,
    maxNewLessonsPerRun: 5,
    maxConcurrentScoutJobs: 2,
  },
  /** Living lessons older than this many days are refresh candidates */
  livingRefreshDays: 30,
  routes: {
    generate: { provider: "anthropic", model: "claude-sonnet-4-5" } as ModelRoute,
    deepen: { provider: "openai", model: "gpt-4.1" } as ModelRoute,
    critique: { provider: "google", model: "gemini-2.5-pro" } as ModelRoute,
    refresh: { provider: "anthropic", model: "claude-sonnet-4-5" } as ModelRoute,
    tutor: { provider: "openai", model: "gpt-4.1-mini" } as ModelRoute,
    quiz: { provider: "openai", model: "gpt-4.1-mini" } as ModelRoute,
    scoutScore: { provider: "google", model: "gemini-2.5-flash" } as ModelRoute,
    embed: { provider: "openai", model: "text-embedding-3-small" } as ModelRoute,
    cursorAgent: { provider: "cursor", model: "composer-2.5" } as ModelRoute,
  },
  promptVersion: "2026-03-26",
} as const;

export type AiConfig = typeof aiConfig;
