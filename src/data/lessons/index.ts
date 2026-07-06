import type { Lesson } from "@/types";
import { networkingLessons } from "./networking";
import { operatingSystemsLessons } from "./operating-systems";
import { databaseLessons } from "./databases";
import { fundamentalsLessons } from "./fundamentals";
import { architectureInfraLessons } from "./architecture-infra";
import { advancedLessons } from "./advanced";

export const lessons: Lesson[] = [
  ...networkingLessons,
  ...operatingSystemsLessons,
  ...databaseLessons,
  ...fundamentalsLessons,
  ...architectureInfraLessons,
  ...advancedLessons,
];
