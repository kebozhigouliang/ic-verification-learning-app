import type { InterviewProgress } from "@/types/interview";
import type { LearningProgress } from "@/types/progress";
import type { NoteEntry } from "@/types/notes";
import type { ProjectRecord } from "@/types/projects";

export type ThemeSetting = "dark" | "light" | "system";

export interface AppData {
  schemaVersion: number;
  updatedAt: string;
  settings: {
    theme: ThemeSetting;
  };
  progress: LearningProgress;
  interviewProgress: InterviewProgress;
  notes: NoteEntry[];
  projects: ProjectRecord[];
}
