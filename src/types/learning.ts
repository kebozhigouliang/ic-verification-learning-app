export type ResourceType = "video" | "document" | "github" | "practice";

export interface LearningResource {
  id: string;
  title: string;
  type: ResourceType;
  scope: string;
  estimatedMinutes?: number;
  reason?: string;
  url?: string;
}

export interface LearningTask { id: string; title: string; quantity?: number; target?: string; }

export interface BuildTask {
  id: string;
  title: string;
  inputs?: string[];
  outputs?: string[];
  requirements: string[];
  requiresTestbench: boolean;
  requiresSimulation: boolean;
  requiresWaveform: boolean;
  deliverables: string[];
}

export interface DebugTask { id: string; title: string; prompt: string; expectedOutcome: string; }
export interface PassCriterion { id: string; label: string; }

export interface LearningStage {
  number: number;
  title: string;
}

export interface LearningDay {
  id: string;
  stage: LearningStage;
  week: number;
  day: number;
  kind: "learning" | "checkpoint";
  title: string;
  estimatedMinutes?: number;
  topics: string[];
  learn: LearningResource[];
  practice: LearningTask[];
  build: BuildTask[];
  debug: DebugTask[];
  passCriteria: PassCriterion[];
}

export interface LearningWeek { id: string; week: number; title: string; days: LearningDay[]; }
