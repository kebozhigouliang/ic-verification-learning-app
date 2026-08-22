export type ProjectStatus = "todo" | "doing" | "done";
export type ProjectLevel = "basic" | "intermediate" | "advanced";

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
  githubUrl?: string;
  demoUrl?: string;
  progress: number;
}
