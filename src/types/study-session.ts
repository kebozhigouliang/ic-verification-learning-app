export type StudyType = "LEARN" | "PRACTICE" | "BUILD" | "DEBUG";

export interface StudySession {
  id: string;
  date: string;
  type: StudyType;
  /** Whole seconds spent actively studying; paused time is excluded. */
  duration: number;
  startTime: string;
  endTime: string;
  relatedDayId?: string;
  relatedTaskId?: string;
}
