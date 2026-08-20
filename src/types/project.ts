export type ProjectStatus = "todo" | "doing" | "done";
export type ProjectLevel = "basic" | "intermediate" | "advanced";

export interface Project {
  id: string;
  title: string;
  description: string;
  level: ProjectLevel;
  status: ProjectStatus;
  skills: string[];
  relatedRoadmapId: string;
  milestones: string[];
  githubUrl?: string;
  demoUrl?: string;
  progress: number;
}
