import type { AppData } from "@/types/app-data";
import type { LearningProgress } from "@/types/progress";

export const CURRENT_SCHEMA_VERSION = 2;

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
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: now.toISOString(),
    settings: {
      theme: "system",
    },
    progress: createDefaultProgress(),
    notes: [],
  };
}
