import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import { projects } from "@/data/projects";
import { skills } from "@/data/skills";
import {
  useNotes,
  type NoteCategoryFilter,
  type NoteTypeFilter,
} from "@/hooks/useNotes";
import type {
  NoteCategory,
  NoteEntry,
  NoteType,
  QuestionNote,
} from "@/types/notes";

const typeFilters: NoteTypeFilter[] = ["all", "question", "note", "bug"];
const categoryFilters: NoteCategoryFilter[] = [
  "all",
  "RTL",
  "VERIFICATION",
  "DEBUG",
  "INTERVIEW",
];

const categoryExamples: Record<NoteCategory, string> = {
  RTL: "blocking vs non-blocking",
  VERIFICATION: "UVM architecture",
  DEBUG: "FIFO overflow bug",
  INTERVIEW: "coverage相关问题",
};

interface NoteDraft {
  category: NoteCategory;
  content: string;
  learned: string;
  projectId: string;
  relatedProjectIds: string;
  relatedRoadmapIds: string;
  relatedSkillIds: string;
  rootCause: string;
  solution: string;
  symptom: string;
  tags: string;
}

const emptyDraft: NoteDraft = {
  category: "INTERVIEW",
  content: "",
  learned: "",
  projectId: "",
  relatedProjectIds: "",
  relatedRoadmapIds: "",
  relatedSkillIds: "",
  rootCause: "",
  solution: "",
  symptom: "",
  tags: "",
};

function noteTypeLabel(type: NoteType | "all"): string {
  return type.toUpperCase();
}

function defaultCategory(type: NoteType): NoteCategory {
  if (type === "bug") return "DEBUG";
  if (type === "question") return "INTERVIEW";
  return "RTL";
}

function parseList(value: string): string[] {
  return [...new Set(value.split(",").map((entry) => entry.trim()).filter(Boolean))];
}

function projectLabel(projectId: string): string {
  return projects.find((project) => project.id === projectId)?.title ?? projectId;
}

function skillLabel(skillId: string): string {
  return skills.find((skill) => skill.id === skillId)?.name ?? skillId;
}

function NoteRelations({ note }: { note: NoteEntry }) {
  const hasMetadata = note.tags.length > 0
    || note.relatedSkillIds.length > 0
    || note.relatedProjectIds.length > 0
    || note.relatedRoadmapIds.length > 0;
  if (!hasMetadata) return null;

  return (
    <dl className="note-relations">
      {note.tags.length > 0 && (
        <div>
          <dt>TAGS</dt>
          <dd className="note-tags">
            {note.tags.map((tag) => <span key={tag}>#{tag}</span>)}
          </dd>
        </div>
      )}
      {note.relatedSkillIds.length > 0 && (
        <div>
          <dt>SKILLS</dt>
          <dd>{note.relatedSkillIds.map(skillLabel).join(" / ")}</dd>
        </div>
      )}
      {note.relatedProjectIds.length > 0 && (
        <div>
          <dt>PROJECTS</dt>
          <dd>{note.relatedProjectIds.map(projectLabel).join(" / ")}</dd>
        </div>
      )}
      {note.relatedRoadmapIds.length > 0 && (
        <div>
          <dt>ROADMAP</dt>
          <dd>{note.relatedRoadmapIds.join(" / ")}</dd>
        </div>
      )}
    </dl>
  );
}

function draftFromNote(note: NoteEntry): NoteDraft {
  const metadata = {
    category: note.category,
    relatedProjectIds: note.relatedProjectIds.join(", "),
    relatedRoadmapIds: note.relatedRoadmapIds.join(", "),
    relatedSkillIds: note.relatedSkillIds.join(", "),
    tags: note.tags.join(", "),
  };
  if (note.type === "bug") {
    return {
      ...metadata,
      content: "",
      learned: note.learned,
      projectId: note.projectId ?? "",
      rootCause: note.rootCause,
      solution: note.solution,
      symptom: note.symptom,
    };
  }
  return { ...emptyDraft, ...metadata, content: note.content };
}

export function NotesPage() {
  const {
    addNote,
    categoryFilter,
    dateFilter,
    deleteNote,
    filterByCategory,
    filterByDate,
    filterByType,
    notes,
    searchQuery,
    setSearchQuery,
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
    setDraft({ ...emptyDraft });
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

  const setField = <Key extends keyof NoteDraft>(field: Key, value: NoteDraft[Key]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const metadata = {
      category: draft.category,
      tags: parseList(draft.tags),
      relatedSkillIds: parseList(draft.relatedSkillIds),
      relatedProjectIds: parseList(draft.relatedProjectIds),
      relatedRoadmapIds: parseList(draft.relatedRoadmapIds),
    };

    try {
      if (noteType === "question") {
        const input = {
          ...metadata,
          type: "question" as const,
          content: draft.content,
          ...(editingNote?.type === "question" ? { resolved: editingNote.resolved } : {}),
        };
        if (editingNote) updateNote(editingNote.id, input);
        else addNote(input);
      } else if (noteType === "note") {
        const input = { ...metadata, type: "note" as const, content: draft.content };
        if (editingNote) updateNote(editingNote.id, input);
        else addNote(input);
      } else {
        const input = {
          ...metadata,
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
        code="ENGINEER NOTEBOOK / LOCAL"
        title="工程笔记"
        description="整理 RTL、Verification、Debug 与 Interview 知识，并关联技能、项目和学习路线。"
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
        <div className="note-category-filters" aria-label="Filter notes by category">
          {categoryFilters.map((filter) => (
            <button
              aria-pressed={categoryFilter === filter}
              className={categoryFilter === filter ? "active" : ""}
              key={filter}
              onClick={() => filterByCategory(filter)}
              type="button"
            >
              {filter.toUpperCase()}
            </button>
          ))}
        </div>
        <label className="note-search-filter">
          <span>SEARCH</span>
          <input
            aria-label="Search engineering notes"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="CONTENT / TAG / SKILL / PROJECT"
            type="search"
            value={searchQuery}
          />
        </label>
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
                  const nextType = event.target.value as NoteType;
                  setNoteType(nextType);
                  setDraft({ ...emptyDraft, category: defaultCategory(nextType) });
                }}
                value={noteType}
              >
                <option value="question">QUESTION</option>
                <option value="note">NOTE</option>
                <option value="bug">BUG</option>
              </select>
            </label>

            <label className="note-field">
              <span>CATEGORY</span>
              <select
                onChange={(event) => setField("category", event.target.value as NoteCategory)}
                value={draft.category}
              >
                {categoryFilters.slice(1).map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <small className="note-category-example">
                EXAMPLE / {categoryExamples[draft.category]}
              </small>
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
                <textarea
                  placeholder={categoryExamples[draft.category]}
                  required
                  onChange={(event) => setField("content", event.target.value)}
                  rows={6}
                  value={draft.content}
                />
              </label>
            )}

            <div className="note-metadata-fields">
              <label className="note-field">
                <span>TAGS <small>COMMA SEPARATED</small></span>
                <input
                  onChange={(event) => setField("tags", event.target.value)}
                  placeholder="verilog, fifo, waveform"
                  value={draft.tags}
                />
              </label>
              <label className="note-field">
                <span>SKILL IDS <small>COMMA SEPARATED</small></span>
                <input
                  onChange={(event) => setField("relatedSkillIds", event.target.value)}
                  placeholder="skill-verilog, skill-debug"
                  value={draft.relatedSkillIds}
                />
              </label>
              <label className="note-field">
                <span>RELATED PROJECT IDS <small>COMMA SEPARATED</small></span>
                <input
                  onChange={(event) => setField("relatedProjectIds", event.target.value)}
                  placeholder="project-fifo-verification"
                  value={draft.relatedProjectIds}
                />
              </label>
              <label className="note-field">
                <span>ROADMAP IDS <small>COMMA SEPARATED</small></span>
                <input
                  onChange={(event) => setField("relatedRoadmapIds", event.target.value)}
                  placeholder="w01d06, roadmap-week04-plan"
                  value={draft.relatedRoadmapIds}
                />
              </label>
            </div>

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
                <span className="note-category">{note.category}</span>
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

            <NoteRelations note={note} />
          </article>
        ))}
      </section>
    </AppShell>
  );
}
