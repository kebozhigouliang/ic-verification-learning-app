export type NoteType = "question" | "note" | "bug";

export interface QuestionNote {
  id: string;
  type: "question";
  date: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NormalNote {
  id: string;
  type: "note";
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugNote {
  id: string;
  type: "bug";
  date: string;
  projectId?: string;
  symptom: string;
  rootCause: string;
  solution: string;
  learned: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteEntry = QuestionNote | NormalNote | BugNote;

export type CreateNoteInput =
  | { type: "question"; content: string }
  | { type: "note"; content: string }
  | {
    type: "bug";
    projectId?: string;
    symptom: string;
    rootCause: string;
    solution: string;
    learned: string;
  };

export type UpdateNoteInput =
  | { type: "question"; content: string; resolved?: boolean }
  | { type: "note"; content: string }
  | {
    type: "bug";
    projectId?: string;
    symptom: string;
    rootCause: string;
    solution: string;
    learned: string;
  };
