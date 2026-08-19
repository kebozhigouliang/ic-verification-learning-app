import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import { useNotes, type NoteTypeFilter } from "@/hooks/useNotes";
import type { NoteEntry, NoteType, QuestionNote } from "@/types/notes";

const typeFilters: NoteTypeFilter[] = ["all", "question", "note", "bug"];

interface NoteDraft {
  content: string;
  learned: string;
  projectId: string;
  rootCause: string;
  solution: string;
  symptom: string;
}

const emptyDraft: NoteDraft = {
  content: "",
  learned: "",
  projectId: "",
  rootCause: "",
  solution: "",
  symptom: "",
};

function noteTypeLabel(type: NoteType | "all"): string {
  return type.toUpperCase();
}

function draftFromNote(note: NoteEntry): NoteDraft {
  if (note.type === "bug") {
    return {
      content: "",
      learned: note.learned,
      projectId: note.projectId ?? "",
      rootCause: note.rootCause,
      solution: note.solution,
      symptom: note.symptom,
    };
  }
  return { ...emptyDraft, content: note.content };
}

export function NotesPage() {
  const {
    addNote,
    dateFilter,
    deleteNote,
    filterByDate,
    filterByType,
    notes,
    typeFilter,
    updateNote,
  } = useNotes();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteEntry>();
  const [noteType, setNoteType] = useState<NoteType>("question");
  const [draft, setDraft] = useState<NoteDraft>(emptyDraft);
  const [message, setMessage] = useState("");

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingNote(undefined);
    setDraft(emptyDraft);
    setMessage("");
  };

  const startCreate = () => {
    setEditingNote(undefined);
    setNoteType("question");
    setDraft(emptyDraft);
    setMessage("");
    setEditorOpen(true);
  };

  const startEdit = (note: NoteEntry) => {
    setEditingNote(note);
    setNoteType(note.type);
    setDraft(draftFromNote(note));
    setMessage("");
    setEditorOpen(true);
  };

  const setField = (field: keyof NoteDraft, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    try {
      if (noteType === "question") {
        const input = {
          type: "question" as const,
          content: draft.content,
          ...(editingNote?.type === "question" ? { resolved: editingNote.resolved } : {}),
        };
        if (editingNote) updateNote(editingNote.id, input);
        else addNote(input);
      } else if (noteType === "note") {
        const input = { type: "note" as const, content: draft.content };
        if (editingNote) updateNote(editingNote.id, input);
        else addNote(input);
      } else {
        const input = {
          type: "bug" as const,
          projectId: draft.projectId,
          symptom: draft.symptom,
          rootCause: draft.rootCause,
          solution: draft.solution,
          learned: draft.learned,
        };
        if (editingNote) updateNote(editingNote.id, input);
        else addNote(input);
      }
      closeEditor();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Note could not be saved.");
    }
  };

  const handleDelete = (note: NoteEntry) => {
    if (!window.confirm(`Delete this ${note.type.toUpperCase()} entry?`)) return;
    try {
      deleteNote(note.id);
      if (editingNote?.id === note.id) closeEditor();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Note could not be deleted.");
    }
  };

  const toggleResolved = (note: QuestionNote) => {
    try {
      const resolved = !note.resolved;
      updateNote(note.id, {
        type: "question",
        content: note.content,
        resolved,
      });
      if (editingNote?.id === note.id && editingNote.type === "question") {
        setEditingNote({ ...editingNote, resolved });
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Question could not be updated.");
    }
  };

  return (
    <AppShell activePage="notes">
      <PageIntro
        code="NOTES / DAILY"
        title="学习记录"
        description="记录学习疑问、普通笔记与调试过程。所有记录只保存在当前设备。"
      />

      <section className="notes-toolbar" aria-label="Notes controls">
        <div className="note-type-filters" aria-label="Filter notes by type">
          {typeFilters.map((filter) => (
            <button
              aria-pressed={typeFilter === filter}
              className={typeFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => filterByType(filter)}
              type="button"
            >
              {noteTypeLabel(filter)}
            </button>
          ))}
        </div>
        <label className="note-date-filter">
          <span>DATE</span>
          <input
            aria-label="Filter notes by date"
            onChange={(event) => filterByDate(event.target.value)}
            type="date"
            value={dateFilter}
          />
        </label>
        <button className="add-note-button" onClick={startCreate} type="button">
          + NEW ENTRY
        </button>
      </section>

      {editorOpen && (
        <section className="note-editor" aria-labelledby="note-editor-title">
          <header>
            <div>
              <p>ENTRY EDITOR</p>
              <h2 id="note-editor-title">{editingNote ? "EDIT ENTRY" : "NEW ENTRY"}</h2>
            </div>
            <button aria-label="Close note editor" onClick={closeEditor} type="button">CLOSE</button>
          </header>
          <form onSubmit={handleSubmit}>
            <label className="note-field">
              <span>TYPE</span>
              <select
                disabled={editingNote !== undefined}
                onChange={(event) => {
                  setNoteType(event.target.value as NoteType);
                  setDraft(emptyDraft);
                }}
                value={noteType}
              >
                <option value="question">QUESTION</option>
                <option value="note">NOTE</option>
                <option value="bug">BUG</option>
              </select>
            </label>

            {noteType === "bug" ? (
              <div className="bug-note-fields">
                <label className="note-field">
                  <span>PROJECT ID <small>OPTIONAL</small></span>
                  <input onChange={(event) => setField("projectId", event.target.value)} value={draft.projectId} />
                </label>
                <label className="note-field">
                  <span>SYMPTOM</span>
                  <textarea required onChange={(event) => setField("symptom", event.target.value)} rows={3} value={draft.symptom} />
                </label>
                <label className="note-field">
                  <span>ROOT CAUSE</span>
                  <textarea required onChange={(event) => setField("rootCause", event.target.value)} rows={3} value={draft.rootCause} />
                </label>
                <label className="note-field">
                  <span>SOLUTION</span>
                  <textarea required onChange={(event) => setField("solution", event.target.value)} rows={3} value={draft.solution} />
                </label>
                <label className="note-field">
                  <span>LEARNED</span>
                  <textarea required onChange={(event) => setField("learned", event.target.value)} rows={3} value={draft.learned} />
                </label>
              </div>
            ) : (
              <label className="note-field">
                <span>{noteType === "question" ? "QUESTION" : "CONTENT"}</span>
                <textarea required onChange={(event) => setField("content", event.target.value)} rows={6} value={draft.content} />
              </label>
            )}

            {message && <p className="note-form-error" role="alert">{message}</p>}
            <div className="note-form-actions">
              <button onClick={closeEditor} type="button">CANCEL</button>
              <button className="primary" type="submit">{editingNote ? "SAVE CHANGES" : "SAVE ENTRY"}</button>
            </div>
          </form>
        </section>
      )}

      {message && !editorOpen && <p className="note-page-message" role="alert">{message}</p>}

      <section className="notes-list" aria-label="Learning notes">
        {notes.length === 0 ? (
          <div className="notes-empty">
            <span>NO ENTRIES</span>
            <h2>没有符合条件的学习记录</h2>
            <p>创建 QUESTION、NOTE 或 BUG，记录今天的学习过程。</p>
          </div>
        ) : notes.map((note) => (
          <article className={`note-card note-${note.type}`} key={note.id}>
            <header>
              <div>
                <span className="note-type">{noteTypeLabel(note.type)}</span>
                <time dateTime={note.date}>{note.date}</time>
              </div>
              <div className="note-card-actions">
                <button onClick={() => startEdit(note)} type="button">EDIT</button>
                <button className="delete" onClick={() => handleDelete(note)} type="button">DELETE</button>
              </div>
            </header>

            {note.type === "question" && (
              <>
                <p className="note-content">{note.content}</p>
                <button
                  aria-pressed={note.resolved}
                  className={`question-status${note.resolved ? " resolved" : ""}`}
                  onClick={() => toggleResolved(note)}
                  type="button"
                >
                  {note.resolved ? "RESOLVED" : "UNRESOLVED"}
                </button>
              </>
            )}

            {note.type === "note" && <p className="note-content">{note.content}</p>}

            {note.type === "bug" && (
              <dl className="bug-note-details">
                {note.projectId && <><dt>PROJECT ID</dt><dd>{note.projectId}</dd></>}
                <dt>SYMPTOM</dt><dd>{note.symptom}</dd>
                <dt>ROOT CAUSE</dt><dd>{note.rootCause}</dd>
                <dt>SOLUTION</dt><dd>{note.solution}</dd>
                <dt>LEARNED</dt><dd>{note.learned}</dd>
              </dl>
            )}
          </article>
        ))}
      </section>
    </AppShell>
  );
}
