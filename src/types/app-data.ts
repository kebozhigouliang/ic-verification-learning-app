import type { LearningProgress } from "@/types/progress";

export type ThemeSetting = "dark" | "light" | "system";

export interface AppData {
  schemaVersion: number;
  updatedAt: string;
  settings: {
    theme: ThemeSetting;
  };
  progress: LearningProgress;
}
