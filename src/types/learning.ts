import type { LearningResource } from "@/types/resource";

export type { LearningResource, ResourceType } from "@/types/resource";

export interface LearningTaskOption {
  id: string;
  label: string;
}

export interface LearningTask {
  id: string;
  title: string;
  quantity?: number;
  target?: string;
  options?: LearningTaskOption[];
  correctOptionId?: string;
  explanation?: string;
  required?: boolean;
}

export interface BuildStep {
  stepNumber: number;
  title: string;
  description: string;
  command?: string;
  expectedResult?: string;
}

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
  starterCode?: string;
  steps?: BuildStep[];
  commands?: string[];
  expectedOutput?: string[];
  verificationMethod?: "compile" | "simulation" | "waveform" | "manual_review";
}

export interface SoftwareRequirement {
  id: string;
  name: string;
  purpose: string;
  installUrl: string;
  verificationSteps: string[];
  required: boolean;
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
  description?: string;
  estimatedMinutes?: number;
  topics: string[];
  learn: LearningResource[];
  practice: LearningTask[];
  build: BuildTask[];
  debug: DebugTask[];
  passCriteria: PassCriterion[];
  softwareRequirements?: SoftwareRequirement[];
}

export interface LearningWeek { id: string; week: number; title: string; days: LearningDay[]; }
