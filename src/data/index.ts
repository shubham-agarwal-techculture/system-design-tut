import contentIndex from "@/generated/content-index.json";
import type {
  Lesson,
  Module,
  Phase,
  DesignChallenge,
  GlobalResource,
} from "@/types";

export const phases = contentIndex.phases as Phase[];
export const modules = contentIndex.modules as Module[];
export const lessons = contentIndex.lessons as Lesson[];
export const designChallenges =
  contentIndex.designChallenges as DesignChallenge[];
export const globalResources =
  contentIndex.globalResources as GlobalResource[];

export const contentGraph = contentIndex.graph;
export const searchDocs = contentIndex.searchDocs;
export const contentGeneratedAt = contentIndex.generatedAt;
