import { createDefaultAppData, CURRENT_SCHEMA_VERSION } from "@/storage/defaults";
import type { AppData, ThemeSetting } from "@/types/app-data";
import type {
  InterviewProgress,
  UserAnswer,
  UserAnswerStatus,
} from "@/types/interview";
import type {
  BugNote,
  NormalNote,
  NoteCategory,
  NoteEntry,
  NoteMetadata,
  NoteType,
  QuestionNote,
} from "@/types/notes";
import type { ProjectRecord, ProjectStatus } from "@/types/projects";
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

function normalizeUserAnswerStatus(value: unknown): UserAnswerStatus {
  return value === "LEARNING" || value === "MASTERED" ? value : "TODO";
}

function normalizeInterviewProgress(
  value: unknown,
  fallbackUpdatedAt: string,
): InterviewProgress {
  if (!isRecord(value)) return {};
  const answers: InterviewProgress = {};

  Object.entries(value).forEach(([entryId, rawAnswer]) => {
    if (!isRecord(rawAnswer)) return;
    const questionId = typeof rawAnswer.questionId === "string"
      ? rawAnswer.questionId.trim()
      : entryId.trim();
    if (!questionId || answers[questionId]) return;

    const answer: UserAnswer = {
      questionId,
      myAnswer: typeof rawAnswer.myAnswer === "string" ? rawAnswer.myAnswer : "",
      status: normalizeUserAnswerStatus(rawAnswer.status),
      updatedAt: typeof rawAnswer.updatedAt === "string"
        ? rawAnswer.updatedAt
        : fallbackUpdatedAt,
    };
    answers[questionId] = answer;
  });

  return answers;
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

function defaultNoteCategory(type: NoteType): NoteCategory {
  if (type === "bug") return "DEBUG";
  if (type === "question") return "INTERVIEW";
  return "RTL";
}

function normalizeNoteCategory(value: unknown, type: NoteType): NoteCategory {
  return value === "RTL"
    || value === "VERIFICATION"
    || value === "DEBUG"
    || value === "INTERVIEW"
    ? value
    : defaultNoteCategory(type);
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.flatMap((entry) => (
    typeof entry === "string" && entry.trim() ? [entry.trim()] : []
  )))];
}

function normalizeNoteMetadata(
  value: Record<string, unknown>,
  type: NoteType,
  projectId?: string,
): NoteMetadata {
  const relatedProjectIds = normalizeStringArray(value.relatedProjectIds);
  if (projectId && !relatedProjectIds.includes(projectId)) {
    relatedProjectIds.push(projectId);
  }

  return {
    category: normalizeNoteCategory(value.category, type),
    tags: normalizeStringArray(value.tags),
    relatedSkillIds: normalizeStringArray(value.relatedSkillIds),
    relatedProjectIds,
    relatedRoadmapIds: normalizeStringArray(value.relatedRoadmapIds),
  };
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
      ...normalizeNoteMetadata(value, "question"),
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
      ...normalizeNoteMetadata(value, "note"),
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
    const projectId = typeof value.projectId === "string" ? value.projectId : undefined;
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
      ...normalizeNoteMetadata(value, "bug", projectId),
    };
    if (projectId) note.projectId = projectId;
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

function normalizeProjectStatus(value: unknown): ProjectStatus | undefined {
  return value === "not_started"
    || value === "planning"
    || value === "in_progress"
    || value === "blocked"
    || value === "completed"
    ? value
    : undefined;
}

function normalizeProject(value: unknown, fallbackUpdatedAt: string): ProjectRecord | undefined {
  if (!isRecord(value) || typeof value.id !== "string" || typeof value.name !== "string") {
    return undefined;
  }

  const status = normalizeProjectStatus(value.status);
  const id = value.id.trim();
  const name = value.name.trim();
  if (!status || !id || !name) return undefined;

  const project: ProjectRecord = {
    id,
    name,
    status,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : fallbackUpdatedAt,
  };

  if (typeof value.startDate === "string") project.startDate = value.startDate;
  if (typeof value.completedDate === "string") project.completedDate = value.completedDate;
  if (typeof value.repositoryUrl === "string") project.repositoryUrl = value.repositoryUrl;
  if (typeof value.currentIssue === "string") project.currentIssue = value.currentIssue;
  return project;
}

function normalizeProjects(value: unknown, fallbackUpdatedAt: string): ProjectRecord[] {
  if (!Array.isArray(value)) return [];
  const seenIds = new Set<string>();

  return value.flatMap((rawProject) => {
    const project = normalizeProject(rawProject, fallbackUpdatedAt);
    if (!project || seenIds.has(project.id)) return [];
    seenIds.add(project.id);
    return [project];
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
    interviewProgress: normalizeInterviewProgress(
      value.interviewProgress,
      defaults.updatedAt,
    ),
    notes: normalizeNotes(value.notes),
    projects: normalizeProjects(value.projects, defaults.updatedAt),
  };
}
