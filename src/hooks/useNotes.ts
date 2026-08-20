import { useCallback, useMemo, useState } from "react";
import {
  addNote as addStoredNote,
  deleteNote as deleteStoredNote,
  updateNote as updateStoredNote,
} from "@/storage/notesRepository";
import { loadAppData } from "@/storage/repository";
import type {
  CreateNoteInput,
  NoteCategory,
  NoteEntry,
  NoteType,
  UpdateNoteInput,
} from "@/types/notes";

export type NoteTypeFilter = "all" | NoteType;
export type NoteCategoryFilter = "all" | NoteCategory;

function searchableNoteText(note: NoteEntry): string {
  const content = note.type === "bug"
    ? [note.symptom, note.rootCause, note.solution, note.learned, note.projectId]
    : [note.content];
  return [
    note.type,
    note.category,
    ...content,
    ...note.tags,
    ...note.relatedSkillIds,
    ...note.relatedProjectIds,
    ...note.relatedRoadmapIds,
  ].filter(Boolean).join(" ").toLocaleLowerCase();
}

export function useNotes() {
  const [allNotes, setAllNotes] = useState<NoteEntry[]>(() => loadAppData().notes);
  const [typeFilter, setTypeFilter] = useState<NoteTypeFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<NoteCategoryFilter>("all");
  const [dateFilter, setDateFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const notes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
    return allNotes.filter((note) => (
      (typeFilter === "all" || note.type === typeFilter)
      && (categoryFilter === "all" || note.category === categoryFilter)
      && (!dateFilter || note.date === dateFilter)
      && (!normalizedQuery || searchableNoteText(note).includes(normalizedQuery))
    ));
  }, [allNotes, categoryFilter, dateFilter, searchQuery, typeFilter]);

  const addNote = useCallback((input: CreateNoteInput) => {
    setAllNotes(addStoredNote(input));
  }, []);

  const updateNote = useCallback((noteId: string, input: UpdateNoteInput) => {
    setAllNotes(updateStoredNote(noteId, input));
  }, []);

  const deleteNote = useCallback((noteId: string) => {
    setAllNotes(deleteStoredNote(noteId));
  }, []);

  return {
    notes,
    addNote,
    categoryFilter,
    updateNote,
    deleteNote,
    dateFilter,
    filterByDate: setDateFilter,
    filterByCategory: setCategoryFilter,
    filterByType: setTypeFilter,
    searchQuery,
    setSearchQuery,
    typeFilter,
  };
}
