import { useState, type FormEvent } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageIntro } from "@/components/ui/PageIntro";
import { useProjects } from "@/hooks/useProjects";
import type { ProjectInput, ProjectRecord, ProjectStatus } from "@/types/projects";

const projectStatuses: ProjectStatus[] = [
  "not_started",
  "planning",
  "in_progress",
  "blocked",
  "completed",
];

interface ProjectDraft {
  completedDate: string;
  currentIssue: string;
  name: string;
  repositoryUrl: string;
  startDate: string;
  status: ProjectStatus;
}

const emptyDraft: ProjectDraft = {
  completedDate: "",
  currentIssue: "",
  name: "",
  repositoryUrl: "",
  startDate: "",
  status: "not_started",
};

function statusLabel(status: ProjectStatus): string {
  return status.replaceAll("_", " ").toUpperCase();
}

function draftFromProject(project: ProjectRecord): ProjectDraft {
  return {
    completedDate: project.completedDate ?? "",
    currentIssue: project.currentIssue ?? "",
    name: project.name,
    repositoryUrl: project.repositoryUrl ?? "",
    startDate: project.startDate ?? "",
    status: project.status,
  };
}

function repositoryHref(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function ProjectsPage() {
  const { addProject, deleteProject, projects, updateProject } = useProjects();
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectRecord>();
  const [draft, setDraft] = useState<ProjectDraft>(emptyDraft);
  const [message, setMessage] = useState("");

  const closeEditor = () => {
    setEditorOpen(false);
    setEditingProject(undefined);
    setDraft(emptyDraft);
    setMessage("");
  };

  const startCreate = () => {
    setEditingProject(undefined);
    setDraft(emptyDraft);
    setMessage("");
    setEditorOpen(true);
  };

  const startEdit = (project: ProjectRecord) => {
    setEditingProject(project);
    setDraft(draftFromProject(project));
    setMessage("");
    setEditorOpen(true);
  };

  const setField = <Key extends keyof ProjectDraft>(field: Key, value: ProjectDraft[Key]) => {
    setDraft((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    const input: ProjectInput = {
      name: draft.name,
      status: draft.status,
      startDate: draft.startDate,
      completedDate: draft.completedDate,
      repositoryUrl: draft.repositoryUrl,
      currentIssue: draft.currentIssue,
    };

    try {
      if (editingProject) updateProject(editingProject.id, input);
      else addProject(input);
      closeEditor();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Project could not be saved.");
    }
  };

  const handleDelete = (project: ProjectRecord) => {
    if (!window.confirm(`Delete project “${project.name}”?`)) return;
    try {
      deleteProject(project.id);
      if (editingProject?.id === project.id) closeEditor();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Project could not be deleted.");
    }
  };

  return (
    <AppShell activePage="projects">
      <PageIntro
        code="PROJECTS / LOCAL"
        title="项目"
        description="记录学习项目、验证项目、Git 仓库和当前遇到的问题。"
      />

      <section className="projects-toolbar" aria-label="Project controls">
        <div>
          <span>PROJECT COUNT</span>
          <strong>{projects.length}</strong>
        </div>
        <button onClick={startCreate} type="button">+ NEW PROJECT</button>
      </section>

      {editorOpen && (
        <section className="project-editor" aria-labelledby="project-editor-title">
          <header>
            <div>
              <p>PROJECT EDITOR</p>
              <h2 id="project-editor-title">{editingProject ? "EDIT PROJECT" : "NEW PROJECT"}</h2>
              {editingProject && <span>{editingProject.id}</span>}
            </div>
            <button aria-label="Close project editor" onClick={closeEditor} type="button">CLOSE</button>
          </header>
          <form onSubmit={handleSubmit}>
            <label className="project-field project-name-field">
              <span>PROJECT NAME</span>
              <input
                onChange={(event) => setField("name", event.target.value)}
                required
                value={draft.name}
              />
            </label>
            <label className="project-field">
              <span>STATUS</span>
              <select
                onChange={(event) => setField("status", event.target.value as ProjectStatus)}
                value={draft.status}
              >
                {projectStatuses.map((status) => (
                  <option key={status} value={status}>{statusLabel(status)}</option>
                ))}
              </select>
            </label>
            <label className="project-field">
              <span>START DATE</span>
              <input
                onChange={(event) => setField("startDate", event.target.value)}
                type="date"
                value={draft.startDate}
              />
            </label>
            <label className="project-field">
              <span>COMPLETED DATE</span>
              <input
                onChange={(event) => setField("completedDate", event.target.value)}
                type="date"
                value={draft.completedDate}
              />
            </label>
            <label className="project-field project-wide-field">
              <span>GIT REPOSITORY URL</span>
              <input
                onChange={(event) => setField("repositoryUrl", event.target.value)}
                placeholder="https://github.com/user/repository"
                type="url"
                value={draft.repositoryUrl}
              />
            </label>
            <label className="project-field project-wide-field">
              <span>CURRENT ISSUE</span>
              <textarea
                onChange={(event) => setField("currentIssue", event.target.value)}
                rows={4}
                value={draft.currentIssue}
              />
            </label>
            {message && <p className="project-form-error" role="alert">{message}</p>}
            <div className="project-form-actions">
              <button onClick={closeEditor} type="button">CANCEL</button>
              <button className="primary" type="submit">
                {editingProject ? "SAVE CHANGES" : "SAVE PROJECT"}
              </button>
            </div>
          </form>
        </section>
      )}

      {message && !editorOpen && <p className="project-page-message" role="alert">{message}</p>}

      <section className="projects-list" aria-label="Projects">
        {projects.length === 0 ? (
          <div className="projects-empty">
            <span>NO PROJECTS</span>
            <h2>还没有项目记录</h2>
            <p>新建一个项目，记录状态、仓库链接和当前问题。</p>
          </div>
        ) : projects.map((project) => {
          const link = repositoryHref(project.repositoryUrl);
          return (
            <article className="project-card" key={project.id}>
              <header>
                <div>
                  <span className={`project-status status-${project.status}`}>
                    {statusLabel(project.status)}
                  </span>
                  <h2>{project.name}</h2>
                  <code>{project.id}</code>
                </div>
                <div className="project-card-actions">
                  <button onClick={() => startEdit(project)} type="button">EDIT</button>
                  <button className="delete" onClick={() => handleDelete(project)} type="button">DELETE</button>
                </div>
              </header>
              <dl className="project-details">
                <div>
                  <dt>START DATE</dt>
                  <dd>{project.startDate ?? "NOT SET"}</dd>
                </div>
                <div>
                  <dt>COMPLETED DATE</dt>
                  <dd>{project.completedDate ?? "NOT SET"}</dd>
                </div>
                <div className="project-detail-wide">
                  <dt>GIT REPOSITORY</dt>
                  <dd>
                    {link
                      ? <a href={link} rel="noreferrer" target="_blank">{project.repositoryUrl}</a>
                      : (project.repositoryUrl ?? "NOT SET")}
                  </dd>
                </div>
                <div className="project-detail-wide current-issue-detail">
                  <dt>CURRENT ISSUE</dt>
                  <dd>{project.currentIssue ?? "NONE RECORDED"}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
