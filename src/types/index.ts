export type Difficulty = "beginner" | "intermediate" | "advanced" | "expert";
export type ContentKind = "evergreen" | "living";
export type ContentStatus = "draft" | "reviewed" | "published";

export interface LessonSection {
  title: string;
  paragraphs: string[];
  bullets?: string[];
}

export interface LessonExample {
  title: string;
  description: string;
}

export interface Diagram {
  id: string;
  title: string;
  mermaid: string;
  caption?: string;
}

export interface CaseStudy {
  title: string;
  company?: string;
  summary: string;
  takeaways?: string[];
}

export interface Source {
  title: string;
  url?: string;
  note?: string;
}

export interface GeneratedBy {
  provider: string;
  model: string;
  at?: string;
}

export interface DepthTiers {
  core: LessonSection[];
  deepDive: LessonSection[];
  expert: LessonSection[];
}

export interface Lesson {
  id: string;
  title: string;
  moduleId: string;
  phaseId: string;
  durationMinutes: number;
  summary: string;
  kind?: ContentKind;
  difficulty?: Difficulty;
  status?: ContentStatus;
  version?: string;
  lastReviewed?: string;
  prerequisites?: string[];
  tags?: string[];
  sections: LessonSection[];
  depth?: DepthTiers;
  concepts: string[];
  practices: string[];
  pitfalls: string[];
  examples: LessonExample[];
  keyTakeaways: string[];
  whyItMatters: string;
  reflectionQuestions: string[];
  resources?: string[];
  numbersToKnow?: string[];
  diagrams?: Diagram[];
  caseStudies?: CaseStudy[];
  interviewQuestions?: string[];
  exercises?: string[];
  sources?: Source[];
  generatedBy?: GeneratedBy;
  relatedLessons?: string[];
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
  rubric?: string[];
  referenceSolution?: string;
  scaleVariants?: string[];
  moduleId?: string;
  phaseId?: string;
  tags?: string[];
  status?: ContentStatus;
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
