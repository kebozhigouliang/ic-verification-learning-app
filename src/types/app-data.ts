import type { LearningProgress } from "@/types/progress";
import type { NoteEntry } from "@/types/notes";

export type ThemeSetting = "dark" | "light" | "system";

export interface AppData {
  schemaVersion: number;
  updatedAt: string;
  settings: {
    theme: ThemeSetting;
  };
  progress: LearningProgress;
  notes: NoteEntry[];
}
