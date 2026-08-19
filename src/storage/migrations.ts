import { createDefaultAppData, CURRENT_SCHEMA_VERSION } from "@/storage/defaults";
import type { AppData, ThemeSetting } from "@/types/app-data";
import type {
  CheckpointResult,
  DailyStudyTime,
  DayProgress,
  LearningProgress,
  MasteryProgress,
  TaskProgress,
  TaskStatus,
} from "@/types/progress";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPositiveInteger(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : fallback;
}

function readNonNegativeNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? value
    : fallback;
}

function normalizeTaskStatus(value: unknown): TaskStatus | undefined {
  return value === "todo" || value === "doing" || value === "pass"
    ? value
    : undefined;
}

function normalizeTaskStates(value: unknown): Record<string, TaskProgress> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).flatMap(([taskId, rawProgress]) => {
      if (!isRecord(rawProgress)) return [];
      const status = normalizeTaskStatus(rawProgress.status);
      if (!status) return [];

      const progress: TaskProgress = { status };
      if (typeof rawProgress.completedAt === "string") {
        progress.completedAt = rawProgress.completedAt;
      }
      return [[taskId, progress]];
    }),
  );
}

function normalizeMasteryProgress(value: unknown): MasteryProgress {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, boolean] => (
      typeof entry[1] === "boolean"
    )),
  );
}

function normalizeStudyTime(value: unknown): DailyStudyTime {
  const source = isRecord(value) ? value : {};
  return {
    learn: readNonNegativeNumber(source.learn),
    practice: readNonNegativeNumber(source.practice),
    build: readNonNegativeNumber(source.build),
    debug: readNonNegativeNumber(source.debug),
  };
}

function normalizeDayProgress(value: unknown): DayProgress {
  const source = isRecord(value) ? value : {};
  const progress: DayProgress = {
    taskStates: normalizeTaskStates(source.taskStates),
    passCriteria: normalizeMasteryProgress(source.passCriteria),
    studyTime: normalizeStudyTime(source.studyTime),
  };

  if (typeof source.lastOpenedAt === "string") {
    progress.lastOpenedAt = source.lastOpenedAt;
  }
  return progress;
}

function normalizeDays(value: unknown): Record<string, DayProgress> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).map(([dayId, progress]) => [dayId, normalizeDayProgress(progress)]),
  );
}

function normalizeCheckpoint(value: unknown): CheckpointResult | undefined {
  if (!isRecord(value)) return undefined;
  const result = value.result;
  if (result !== "not_started" && result !== "review_required" && result !== "ready") {
    return undefined;
  }

  const checkpoint: CheckpointResult = {
    week: readPositiveInteger(value.week, 1),
    criteria: normalizeMasteryProgress(value.criteria),
    result,
  };
  if (typeof value.evaluatedAt === "string") checkpoint.evaluatedAt = value.evaluatedAt;
  return checkpoint;
}

function normalizeCheckpoints(value: unknown): Record<string, CheckpointResult> {
  if (!isRecord(value)) return {};
  return Object.fromEntries(
    Object.entries(value).flatMap(([checkpointId, rawCheckpoint]) => {
      const checkpoint = normalizeCheckpoint(rawCheckpoint);
      return checkpoint ? [[checkpointId, checkpoint]] : [];
    }),
  );
}

function normalizeProgress(value: unknown, defaults: LearningProgress): LearningProgress {
  const source = isRecord(value) ? value : {};
  return {
    currentWeek: readPositiveInteger(source.currentWeek, defaults.currentWeek),
    currentDay: readPositiveInteger(source.currentDay, defaults.currentDay),
    days: normalizeDays(source.days),
    checkpoints: normalizeCheckpoints(source.checkpoints),
    hdlBitsCompleted: readNonNegativeNumber(source.hdlBitsCompleted),
  };
}

function normalizeTheme(value: unknown, fallback: ThemeSetting): ThemeSetting {
  return value === "dark" || value === "light" || value === "system"
    ? value
    : fallback;
}

export function migrateAppData(value: unknown): AppData {
  const defaults = createDefaultAppData();
  if (!isRecord(value)) return defaults;

  const settings = isRecord(value.settings) ? value.settings : {};
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : defaults.updatedAt,
    settings: {
      theme: normalizeTheme(settings.theme, defaults.settings.theme),
    },
    progress: normalizeProgress(value.progress, defaults.progress),
  };
}
