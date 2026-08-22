export type ProjectStatus = "todo" | "doing" | "done";
export type ProjectLevel = "basic" | "intermediate" | "advanced";
export type ProjectReadmeStatus = "not_started" | "draft" | "complete";
export type ProjectCompletionStatus = "not_ready" | "in_progress" | "portfolio_ready";

export interface Project {
  id: string;
  title: string;
  description: string;
  background?: string;
  specification?: string;
  level: ProjectLevel;
  status: ProjectStatus;
  skills: string[];
  relatedRoadmapId: string;
  relatedRoadmapIds?: string[];
  verificationGoals?: string[];
  milestones: string[];
  expectedOutputs?: string[];
  interviewQuestions?: string[];
  repositoryUrl?: string;
  githubUrl?: string;
  demoUrl?: string;
  readmeStatus?: ProjectReadmeStatus;
  completionStatus?: ProjectCompletionStatus;
  portfolioNotes?: string;
  progress: number;
}
