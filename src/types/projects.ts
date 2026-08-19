export type ProjectStatus = "not_started" | "planning" | "in_progress" | "blocked" | "completed";
export interface ProjectRecord { id: string; name: string; status: ProjectStatus; startDate?: string; completedDate?: string; repositoryUrl?: string; currentIssue?: string; }
