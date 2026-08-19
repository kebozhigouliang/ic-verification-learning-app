interface BaseNote { id: string; date: string; createdAt: string; updatedAt: string; }
export type NoteEntry =
  | (BaseNote & { type: "question"; content: string; resolved: boolean })
  | (BaseNote & { type: "note"; content: string })
  | (BaseNote & { type: "bug"; projectId?: string; symptom: string; rootCause: string; solution: string; learned: string });
