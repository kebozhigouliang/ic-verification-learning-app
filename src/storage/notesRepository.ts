import { loadAppData, saveAppData } from "@/storage/repository";
import type {
  BugNote,
  CreateNoteInput,
  NormalNote,
  NoteEntry,
  QuestionNote,
  UpdateNoteInput,
} from "@/types/notes";

function requiredText(value: string, field: string): string {
  const text = value.trim();
  if (!text) throw new Error(`${field} is required.`);
  return text;
}

function optionalText(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function createNoteId(date: Date, existingIds: ReadonlySet<string>): string {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 8)
    : Math.random().toString(36).slice(2, 10).padEnd(8, "0");
  let timestamp = date.getTime();
  let noteId = `note-${timestamp}-${randomPart}`;
  while (existingIds.has(noteId)) {
    timestamp += 1;
    noteId = `note-${timestamp}-${randomPart}`;
  }
  return noteId;
}

function nextUpdatedAt(previousUpdatedAt: string): string {
  const previousTime = Date.parse(previousUpdatedAt);
  const timestamp = Number.isFinite(previousTime)
    ? Math.max(Date.now(), previousTime + 1)
    : Date.now();
  return new Date(timestamp).toISOString();
}

function createNote(input: CreateNoteInput, existingIds: ReadonlySet<string>): NoteEntry {
  const now = new Date();
  const base = {
    id: createNoteId(now, existingIds),
    date: formatLocalDate(now),
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (input.type === "question") {
    return {
      ...base,
      type: "question",
      content: requiredText(input.content, "Question"),
      resolved: false,
    };
  }

  if (input.type === "note") {
    return {
      ...base,
      type: "note",
      content: requiredText(input.content, "Note"),
    };
  }

  const note: BugNote = {
    ...base,
    type: "bug",
    symptom: requiredText(input.symptom, "Symptom"),
    rootCause: requiredText(input.rootCause, "Root Cause"),
    solution: requiredText(input.solution, "Solution"),
    learned: requiredText(input.learned, "Learned"),
  };
  const projectId = optionalText(input.projectId);
  if (projectId) note.projectId = projectId;
  return note;
}

function updateExistingNote(note: NoteEntry, input: UpdateNoteInput): NoteEntry {
  if (note.type !== input.type) {
    throw new Error("A note type cannot be changed after creation.");
  }

  const updatedAt = nextUpdatedAt(note.updatedAt);

  if (note.type === "question" && input.type === "question") {
    const updated: QuestionNote = {
      ...note,
      content: requiredText(input.content, "Question"),
      resolved: input.resolved ?? note.resolved,
      updatedAt,
    };
    return updated;
  }

  if (note.type === "note" && input.type === "note") {
    const updated: NormalNote = {
      ...note,
      content: requiredText(input.content, "Note"),
      updatedAt,
    };
    return updated;
  }

  if (note.type === "bug" && input.type === "bug") {
    const updated: BugNote = {
      ...note,
      symptom: requiredText(input.symptom, "Symptom"),
      rootCause: requiredText(input.rootCause, "Root Cause"),
      solution: requiredText(input.solution, "Solution"),
      learned: requiredText(input.learned, "Learned"),
      updatedAt,
    };
    const projectId = optionalText(input.projectId);
    if (projectId) updated.projectId = projectId;
    else delete updated.projectId;
    return updated;
  }

  throw new Error("Unsupported note update.");
}

export function addNote(input: CreateNoteInput): NoteEntry[] {
  const appData = loadAppData();
  const note = createNote(input, new Set(appData.notes.map((entry) => entry.id)));
  return saveAppData({
    ...appData,
    notes: [note, ...appData.notes],
  }).notes;
}

export function updateNote(noteId: string, input: UpdateNoteInput): NoteEntry[] {
  const appData = loadAppData();
  const noteIndex = appData.notes.findIndex((note) => note.id === noteId);
  if (noteIndex === -1) throw new Error("Note not found.");

  const notes = [...appData.notes];
  notes[noteIndex] = updateExistingNote(notes[noteIndex], input);
  return saveAppData({ ...appData, notes }).notes;
}

export function deleteNote(noteId: string): NoteEntry[] {
  const appData = loadAppData();
  const notes = appData.notes.filter((note) => note.id !== noteId);
  if (notes.length === appData.notes.length) throw new Error("Note not found.");
  return saveAppData({ ...appData, notes }).notes;
}
