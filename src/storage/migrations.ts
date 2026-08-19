import { createDefaultAppData, CURRENT_SCHEMA_VERSION } from "@/storage/defaults";
import type { AppData, ThemeSetting } from "@/types/app-data";
import type { BugNote, NormalNote, NoteEntry, QuestionNote } from "@/types/notes";
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

function hasNoteBase(value: Record<string, unknown>): boolean {
  return typeof value.id === "string"
    && typeof value.date === "string"
    && typeof value.createdAt === "string"
    && typeof value.updatedAt === "string";
}

function normalizeNote(value: unknown): NoteEntry | undefined {
  if (!isRecord(value) || !hasNoteBase(value)) return undefined;

  if (value.type === "question" && typeof value.content === "string") {
    const note: QuestionNote = {
      id: value.id as string,
      type: "question",
      date: value.date as string,
      content: value.content,
      resolved: typeof value.resolved === "boolean" ? value.resolved : false,
      createdAt: value.createdAt as string,
      updatedAt: value.updatedAt as string,
    };
    return note;
  }

  if (value.type === "note" && typeof value.content === "string") {
    const note: NormalNote = {
      id: value.id as string,
      type: "note",
      date: value.date as string,
      content: value.content,
      createdAt: value.createdAt as string,
      updatedAt: value.updatedAt as string,
    };
    return note;
  }

  if (
    value.type === "bug"
    && typeof value.symptom === "string"
    && typeof value.rootCause === "string"
    && typeof value.solution === "string"
    && typeof value.learned === "string"
  ) {
    const note: BugNote = {
      id: value.id as string,
      type: "bug",
      date: value.date as string,
      symptom: value.symptom,
      rootCause: value.rootCause,
      solution: value.solution,
      learned: value.learned,
      createdAt: value.createdAt as string,
      updatedAt: value.updatedAt as string,
    };
    if (typeof value.projectId === "string") note.projectId = value.projectId;
    return note;
  }

  return undefined;
}

function normalizeNotes(value: unknown): NoteEntry[] {
  if (!Array.isArray(value)) return [];
  const seenIds = new Set<string>();

  return value.flatMap((rawNote) => {
    const note = normalizeNote(rawNote);
    if (!note || seenIds.has(note.id)) return [];
    seenIds.add(note.id);
    return [note];
  });
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
    notes: normalizeNotes(value.notes),
  };
}
