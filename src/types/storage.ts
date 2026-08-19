import type { NoteEntry } from "./notes";
import type { ProjectRecord } from "./projects";
import type { LearningProgress } from "./progress";

export interface AppData {
  schemaVersion: 1;
  updatedAt: string;
  settings: { theme: "dark" | "light" | "system" };
  progress: LearningProgress;
  notes: NoteEntry[];
  projects: ProjectRecord[];
}
