import { defaultProjects } from "@/data/projects";
import type { AppData } from "@/types/app-data";
import type { LearningProgress } from "@/types/progress";

export const CURRENT_SCHEMA_VERSION = 3;

export function createDefaultProgress(): LearningProgress {
  return {
    currentWeek: 1,
    currentDay: 1,
    days: {},
    checkpoints: {},
    hdlBitsCompleted: 0,
  };
}

export function createDefaultAppData(now = new Date()): AppData {
  const updatedAt = now.toISOString();
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt,
    settings: {
      theme: "system",
    },
    progress: createDefaultProgress(),
    notes: [],
    projects: defaultProjects.map((project) => ({ ...project, updatedAt })),
  };
}
