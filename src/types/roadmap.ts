import type { PassCriterion } from "@/types/learning";
import type { LearningResource } from "@/types/resource";

export type RoadmapResourceCategory = "learn" | "practice" | "build";

export interface RoadmapResource extends LearningResource {
  category: RoadmapResourceCategory;
}

export interface RoadmapItem {
  id: string;
  weekStart: number;
  weekEnd: number;
  title: string;
  status: "available" | "coming_later";
}

export interface RoadmapStage {
  id: string;
  stage: number;
  title: string;
  items: RoadmapItem[];
}

export type RoadmapTaskCategory = "learn" | "practice" | "build" | "debug";

export interface RoadmapTask {
  id: string;
  category: RoadmapTaskCategory;
  title: string;
  deliverables?: string[];
}

export interface RoadmapDay {
  id: string;
  title: string;
  topics: string[];
  resources: RoadmapResource[];
  tasks: RoadmapTask[];
  passCriteria: PassCriterion[];
}

export interface RoadmapWeek {
  id: string;
  title: string;
  goal: string;
  topics: string[];
  tasks: RoadmapTask[];
  projectReferences: string[];
  resources: RoadmapResource[];
  days: RoadmapDay[];
}

export interface LearningRoadmapStage {
  id: string;
  title: string;
  description: string;
  duration: string;
  skills: string[];
  weeks: RoadmapWeek[];
}

export type LearningStage = LearningRoadmapStage;
export type Week = RoadmapWeek;
export type Day = RoadmapDay;
