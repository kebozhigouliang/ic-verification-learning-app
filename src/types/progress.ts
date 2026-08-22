export type TaskStatus = "todo" | "doing" | "pass";
export type StudyCategory = "learn" | "practice" | "build" | "debug";
export type StudyTimeCategory = StudyCategory;

export interface DailyStudyTime { learn: number; practice: number; build: number; debug: number; }
export interface StudyTimeMinutes extends DailyStudyTime {}
export interface TaskProgress { status: TaskStatus; completedAt?: string; }
export interface ResourceProgress {
  resourceOpened: boolean;
  resourceCompleted: boolean;
  openedAt?: string;
  completedAt?: string;
}
export interface SoftwareProgress { status: TaskStatus; completedAt?: string; }
export interface BuildVerification {
  simulationSuccess: boolean;
  verifiedAt?: string;
}
export type MasteryProgress = Record<string, boolean>;
export interface DayProgress {
  taskStates: Record<string, TaskProgress>;
  resourceStates: Record<string, ResourceProgress>;
  softwareStates: Record<string, SoftwareProgress>;
  buildVerifications: Record<string, BuildVerification>;
  passCriteria: MasteryProgress;
  studyTime: StudyTimeMinutes;
  lastOpenedAt?: string;
}
export interface CheckpointResult { week: number; criteria: Record<string, boolean>; evaluatedAt?: string; result: "not_started" | "review_required" | "ready"; }
export interface LearningProgress { currentWeek: number; currentDay: number; days: Record<string, DayProgress>; checkpoints: Record<string, CheckpointResult>; hdlBitsCompleted: number; }
