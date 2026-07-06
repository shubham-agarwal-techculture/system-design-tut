import { getAllLessonsOrdered, getNextLesson } from "@/utils/curriculum";
import { designChallenges } from "@/data";
import type { SessionDuration, SessionPlan } from "@/types";

export function buildSessionPlan(
  duration: SessionDuration,
  completedLessonIds: string[],
  completedChallengeIds: string[],
): SessionPlan {
  const ordered = getAllLessonsOrdered();
  const pending = ordered.filter((l) => !completedLessonIds.includes(l.id));

  const selectedLessons = [];
  let usedMinutes = 0;
  const buffer = duration === 5 ? 0 : 5;

  for (const lesson of pending) {
    if (usedMinutes + lesson.durationMinutes <= duration - buffer) {
      selectedLessons.push(lesson);
      usedMinutes += lesson.durationMinutes;
    }
    if (usedMinutes >= duration - buffer) break;
  }

  if (selectedLessons.length === 0 && pending.length > 0) {
    selectedLessons.push(pending[0]);
    usedMinutes = pending[0].durationMinutes;
  }

  let challenge;
  const remaining = duration - usedMinutes;

  if (remaining >= 20 && duration >= 30) {
    const pendingChallenges = designChallenges.filter(
      (c) => !completedChallengeIds.includes(c.id),
    );
    const fit = pendingChallenges.find((c) => c.estimatedMinutes <= remaining);
    if (fit) {
      challenge = fit;
      usedMinutes += fit.estimatedMinutes;
    }
  }

  return {
    duration,
    lessons: selectedLessons,
    challenge,
    totalMinutes: usedMinutes,
  };
}

export function getDailyRecommendation(completedLessonIds: string[]) {
  const next = getNextLesson(completedLessonIds);
  if (!next) {
    return {
      title: "Curriculum complete!",
      description:
        "You've finished all lessons. Tackle design challenges or revisit topics for deeper understanding.",
      lessonId: null as string | null,
    };
  }

  return {
    title: next.title,
    description: next.summary,
    lessonId: next.id,
    durationMinutes: next.durationMinutes,
  };
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function updateStreak(
  lastActiveDate: string | null,
  currentStreak: number,
): { streak: number; lastActiveDate: string } {
  const today = todayISO();
  if (lastActiveDate === today) {
    return { streak: currentStreak, lastActiveDate: today };
  }

  if (!lastActiveDate) {
    return { streak: 1, lastActiveDate: today };
  }

  const last = new Date(lastActiveDate);
  const now = new Date(today);
  const diffDays = Math.floor(
    (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 1) {
    return { streak: currentStreak + 1, lastActiveDate: today };
  }

  return { streak: 1, lastActiveDate: today };
}
