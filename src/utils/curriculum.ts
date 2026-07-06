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

export const phaseColors: Record<
  string,
  { bg: string; text: string; border: string; ring: string; gradient: string }
> = {
  indigo: {
    bg: "bg-emerald-950/8",
    text: "text-emerald-900",
    border: "border-emerald-900/20",
    ring: "ring-emerald-900/25",
    gradient: "from-emerald-800 to-emerald-950",
  },
  violet: {
    bg: "bg-slate-800/8",
    text: "text-slate-800",
    border: "border-slate-800/20",
    ring: "ring-slate-800/25",
    gradient: "from-slate-700 to-slate-900",
  },
  purple: {
    bg: "bg-red-950/8",
    text: "text-red-900",
    border: "border-red-900/20",
    ring: "ring-red-900/25",
    gradient: "from-red-900 to-red-950",
  },
  fuchsia: {
    bg: "bg-stone-600/8",
    text: "text-stone-700",
    border: "border-stone-600/25",
    ring: "ring-stone-600/25",
    gradient: "from-stone-600 to-stone-800",
  },
  pink: {
    bg: "bg-rose-900/8",
    text: "text-rose-900",
    border: "border-rose-900/20",
    ring: "ring-rose-900/25",
    gradient: "from-rose-800 to-rose-950",
  },
  rose: {
    bg: "bg-orange-950/8",
    text: "text-orange-950",
    border: "border-orange-900/20",
    ring: "ring-orange-900/25",
    gradient: "from-orange-800 to-orange-950",
  },
  orange: {
    bg: "bg-amber-900/8",
    text: "text-amber-900",
    border: "border-amber-800/25",
    ring: "ring-amber-800/25",
    gradient: "from-amber-700 to-amber-900",
  },
  amber: {
    bg: "bg-yellow-900/8",
    text: "text-yellow-900",
    border: "border-yellow-800/25",
    ring: "ring-yellow-800/25",
    gradient: "from-yellow-700 to-yellow-900",
  },
};
