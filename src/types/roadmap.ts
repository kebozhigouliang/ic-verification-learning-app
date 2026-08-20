import type { LearningResource, PassCriterion } from "@/types/learning";

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
  resources: LearningResource[];
  tasks: RoadmapTask[];
  passCriteria: PassCriterion[];
}

export interface RoadmapWeek {
  id: string;
  title: string;
  goal: string;
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
