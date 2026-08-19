export type TaskStatus = "todo" | "doing" | "pass";
export type StudyTimeCategory = "learn" | "practice" | "build" | "debug";

export interface StudyTimeMinutes { learn: number; practice: number; build: number; debug: number; }
export interface TaskProgress { status: TaskStatus; completedAt?: string; }
export interface DayProgress { taskStates: Record<string, TaskProgress>; passCriteria: Record<string, boolean>; studyTime: StudyTimeMinutes; lastOpenedAt?: string; }
export interface CheckpointResult { week: number; criteria: Record<string, boolean>; evaluatedAt?: string; result: "not_started" | "review_required" | "ready"; }
export interface LearningProgress { currentWeek: number; currentDay: number; days: Record<string, DayProgress>; checkpoints: Record<string, CheckpointResult>; hdlBitsCompleted: number; }
