export type NoteType = "question" | "note" | "bug";
export type NoteCategory = "RTL" | "VERIFICATION" | "DEBUG" | "INTERVIEW";

export interface NoteMetadata {
  category: NoteCategory;
  tags: string[];
  relatedSkillIds: string[];
  relatedProjectIds: string[];
  relatedRoadmapIds: string[];
}

export interface NoteMetadataInput {
  category?: NoteCategory;
  tags?: string[];
  relatedSkillIds?: string[];
  relatedProjectIds?: string[];
  relatedRoadmapIds?: string[];
}

export interface QuestionNote extends NoteMetadata {
  id: string;
  type: "question";
  date: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NormalNote extends NoteMetadata {
  id: string;
  type: "note";
  date: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugNote extends NoteMetadata {
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

export type CreateNoteInput = NoteMetadataInput & (
  | { type: "question"; content: string }
  | { type: "note"; content: string }
  | {
    type: "bug";
    projectId?: string;
    symptom: string;
    rootCause: string;
    solution: string;
    learned: string;
  }
);

export type UpdateNoteInput = NoteMetadataInput & (
  | { type: "question"; content: string; resolved?: boolean }
  | { type: "note"; content: string }
  | {
    type: "bug";
    projectId?: string;
    symptom: string;
    rootCause: string;
    solution: string;
    learned: string;
  }
);
