import { useCallback, useMemo, useState } from "react";
import {
  addNote as addStoredNote,
  deleteNote as deleteStoredNote,
  updateNote as updateStoredNote,
} from "@/storage/notesRepository";
import { loadAppData } from "@/storage/repository";
import type {
  CreateNoteInput,
  NoteEntry,
  NoteType,
  UpdateNoteInput,
} from "@/types/notes";

export type NoteTypeFilter = "all" | NoteType;

export function useNotes() {
  const [allNotes, setAllNotes] = useState<NoteEntry[]>(() => loadAppData().notes);
  const [typeFilter, setTypeFilter] = useState<NoteTypeFilter>("all");
  const [dateFilter, setDateFilter] = useState("");

  const notes = useMemo(() => allNotes.filter((note) => (
    (typeFilter === "all" || note.type === typeFilter)
    && (!dateFilter || note.date === dateFilter)
  )), [allNotes, dateFilter, typeFilter]);

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
    updateNote,
    deleteNote,
    dateFilter,
    filterByDate: setDateFilter,
    filterByType: setTypeFilter,
    typeFilter,
  };
}
