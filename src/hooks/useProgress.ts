import { useCallback, useEffect, useState } from "react";
import type { UserProgress } from "@/types";
import { DEFAULT_PROGRESS } from "@/types";
import { updateStreak } from "@/utils/session";

const STORAGE_KEY = "sdj-progress";

function loadProgress(): UserProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_PROGRESS, ...JSON.parse(raw) };
    }
  } catch {
    /* ignore corrupt data */
  }
  return { ...DEFAULT_PROGRESS };
}

function saveProgress(progress: UserProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useProgress() {
  const [progress, setProgress] = useState<UserProgress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const markLessonComplete = useCallback((lessonId: string, minutes: number) => {
    setProgress((prev) => {
      const alreadyDone = prev.completedLessons.includes(lessonId);
      const streakUpdate = updateStreak(prev.lastActiveDate, prev.streak);
      return {
        ...prev,
        completedLessons: alreadyDone
          ? prev.completedLessons
          : [...prev.completedLessons, lessonId],
        lastVisitedLessonId: lessonId,
        totalMinutesLearned: prev.totalMinutesLearned + (alreadyDone ? 0 : minutes),
        sessionsCompleted: prev.sessionsCompleted + (alreadyDone ? 0 : 1),
        ...streakUpdate,
      };
    });
  }, []);

  const markChallengeComplete = useCallback((challengeId: string) => {
    setProgress((prev) => {
      if (prev.completedChallenges.includes(challengeId)) return prev;
      const streakUpdate = updateStreak(prev.lastActiveDate, prev.streak);
      return {
        ...prev,
        completedChallenges: [...prev.completedChallenges, challengeId],
        ...streakUpdate,
      };
    });
  }, []);

  const setLessonNote = useCallback((lessonId: string, note: string) => {
    setProgress((prev) => ({
      ...prev,
      lessonNotes: { ...prev.lessonNotes, [lessonId]: note },
    }));
  }, []);

  const setLastVisited = useCallback((lessonId: string) => {
    setProgress((prev) => ({
      ...prev,
      lastVisitedLessonId: lessonId,
      ...updateStreak(prev.lastActiveDate, prev.streak),
    }));
  }, []);

  const resetProgress = useCallback(() => {
    setProgress({ ...DEFAULT_PROGRESS });
  }, []);

  const isLessonComplete = useCallback(
    (lessonId: string) => progress.completedLessons.includes(lessonId),
    [progress.completedLessons],
  );

  const isChallengeComplete = useCallback(
    (challengeId: string) => progress.completedChallenges.includes(challengeId),
    [progress.completedChallenges],
  );

  return {
    progress,
    markLessonComplete,
    markChallengeComplete,
    setLessonNote,
    setLastVisited,
    resetProgress,
    isLessonComplete,
    isChallengeComplete,
  };
}
