export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";

export interface LessonSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LessonExample {
  title: string;
  description: string;
}

export interface Lesson {
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
  resources?: string[];
}

export interface Module {
  id: string;
  phaseId: string;
  title: string;
  description: string;
  order: number;
  resources?: string[];
}

export interface Phase {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  description: string;
  color: string;
}

export interface DesignChallenge {
  id: string;
  title: string;
  difficulty: Difficulty;
  description: string;
  hints: string[];
  checklist: string[];
  estimatedMinutes: number;
}

export interface GlobalResource {
  title: string;
  type: "book" | "blog" | "opensource";
  url?: string;
  note?: string;
}

export interface UserProgress {
  completedLessons: string[];
  completedChallenges: string[];
  lessonNotes: Record<string, string>;
  lastVisitedLessonId: string | null;
  streak: number;
  lastActiveDate: string | null;
  totalMinutesLearned: number;
  sessionsCompleted: number;
}

export type SessionDuration = 5 | 15 | 30 | 60;

export interface SessionPlan {
  duration: SessionDuration;
  lessons: Lesson[];
  challenge?: DesignChallenge;
  totalMinutes: number;
}

export const DEFAULT_PROGRESS: UserProgress = {
  completedLessons: [],
  completedChallenges: [],
  lessonNotes: {},
  lastVisitedLessonId: null,
  streak: 0,
  lastActiveDate: null,
  totalMinutesLearned: 0,
  sessionsCompleted: 0,
};
