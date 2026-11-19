import { lessons, modules, phases, designChallenges } from "@/data";
import type { Lesson, Module, Phase, DesignChallenge } from "@/types";

export function getPhase(id: string): Phase | undefined {
  return phases.find((p) => p.id === id);
}

export function getModule(id: string): Module | undefined {
  return modules.find((m) => m.id === id);
}

export function getLesson(id: string): Lesson | undefined {
  return lessons.find((l) => l.id === id);
}

export function getChallenge(id: string): DesignChallenge | undefined {
  return designChallenges.find((c) => c.id === id);
}

export function getModulesForPhase(phaseId: string): Module[] {
  return modules
    .filter((m) => m.phaseId === phaseId)
    .sort((a, b) => a.order - b.order);
}

export function getLessonsForModule(moduleId: string): Lesson[] {
  return lessons.filter((l) => l.moduleId === moduleId);
}

export function getLessonsForPhase(phaseId: string): Lesson[] {
  return lessons.filter((l) => l.phaseId === phaseId);
}

export function getAllLessonsOrdered(): Lesson[] {
  return phases.flatMap((phase) => {
    const phaseModules = getModulesForPhase(phase.id);
    return phaseModules.flatMap((mod) => getLessonsForModule(mod.id));
  });
}

export function getNextLesson(completedIds: string[]): Lesson | undefined {
  return getAllLessonsOrdered().find((l) => !completedIds.includes(l.id));
}

export function getProgressStats(completedIds: string[]) {
  const total = lessons.length;
  const completed = completedIds.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  const phaseProgress = phases.map((phase) => {
    const phaseLessons = getLessonsForPhase(phase.id);
    const phaseCompleted = phaseLessons.filter((l) =>
      completedIds.includes(l.id),
    ).length;
    return {
      phase,
      total: phaseLessons.length,
      completed: phaseCompleted,
      percent:
        phaseLessons.length > 0
          ? Math.round((phaseCompleted / phaseLessons.length) * 100)
          : 0,
    };
  });

  return { total, completed, percent, phaseProgress };
}

export function getChallengesByDifficulty() {
  return {
    beginner: designChallenges.filter((c) => c.difficulty === "beginner"),
    intermediate: designChallenges.filter((c) => c.difficulty === "intermediate"),
    advanced: designChallenges.filter((c) => c.difficulty === "advanced"),
    expert: designChallenges.filter((c) => c.difficulty === "expert"),
  };
}

/** @deprecated Prefer semantic tokens / PhaseMarker motifs */
export const phaseColors: Record<
  string,
  { bg: string; text: string; border: string; ring: string; gradient: string }
> = new Proxy(
  {},
  {
    get: () => ({
      bg: "bg-[var(--color-surface-raised)]",
      text: "text-[var(--color-ink)]",
      border: "border-[var(--color-rule)]",
      ring: "ring-[var(--color-signal)]",
      gradient: "from-[var(--color-ink)] to-[var(--color-ink-muted)]",
    }),
  },
);
