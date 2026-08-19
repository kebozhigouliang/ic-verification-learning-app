import { loadAppData, saveAppData } from "@/storage/repository";
import type { ProjectInput, ProjectRecord } from "@/types/projects";

function requiredText(value: string, field: string): string {
  const text = value.trim();
  if (!text) throw new Error(`${field} is required.`);
  return text;
}

function optionalText(value: string | undefined): string | undefined {
  const text = value?.trim();
  return text ? text : undefined;
}

function createProjectId(existingIds: ReadonlySet<string>): string {
  const randomPart = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().replaceAll("-", "").slice(0, 8)
    : Math.random().toString(36).slice(2, 10).padEnd(8, "0");
  let timestamp = Date.now();
  let projectId = `project-${timestamp}-${randomPart}`;
  while (existingIds.has(projectId)) {
    timestamp += 1;
    projectId = `project-${timestamp}-${randomPart}`;
  }
  return projectId;
}

function nextUpdatedAt(previousUpdatedAt?: string): string {
  const previousTime = previousUpdatedAt ? Date.parse(previousUpdatedAt) : Number.NaN;
  const timestamp = Number.isFinite(previousTime)
    ? Math.max(Date.now(), previousTime + 1)
    : Date.now();
  return new Date(timestamp).toISOString();
}

function applyOptionalFields(project: ProjectRecord, input: ProjectInput): ProjectRecord {
  const startDate = optionalText(input.startDate);
  const completedDate = optionalText(input.completedDate);
  const repositoryUrl = optionalText(input.repositoryUrl);
  const currentIssue = optionalText(input.currentIssue);

  if (startDate) project.startDate = startDate;
  if (completedDate) project.completedDate = completedDate;
  if (repositoryUrl) project.repositoryUrl = repositoryUrl;
  if (currentIssue) project.currentIssue = currentIssue;
  return project;
}

function createProject(input: ProjectInput, existingIds: ReadonlySet<string>): ProjectRecord {
  const project: ProjectRecord = {
    id: createProjectId(existingIds),
    name: requiredText(input.name, "Project name"),
    status: input.status,
    updatedAt: nextUpdatedAt(),
  };
  return applyOptionalFields(project, input);
}

function updateExistingProject(project: ProjectRecord, input: ProjectInput): ProjectRecord {
  const updated: ProjectRecord = {
    id: project.id,
    name: requiredText(input.name, "Project name"),
    status: input.status,
    updatedAt: nextUpdatedAt(project.updatedAt),
  };
  return applyOptionalFields(updated, input);
}

export function addProject(input: ProjectInput): ProjectRecord[] {
  const appData = loadAppData();
  const project = createProject(input, new Set(appData.projects.map((entry) => entry.id)));
  return saveAppData({
    ...appData,
    projects: [...appData.projects, project],
  }).projects;
}

export function updateProject(projectId: string, input: ProjectInput): ProjectRecord[] {
  const appData = loadAppData();
  const projectIndex = appData.projects.findIndex((project) => project.id === projectId);
  if (projectIndex === -1) throw new Error("Project not found.");

  const projects = [...appData.projects];
  projects[projectIndex] = updateExistingProject(projects[projectIndex], input);
  return saveAppData({ ...appData, projects }).projects;
}

export function deleteProject(projectId: string): ProjectRecord[] {
  const appData = loadAppData();
  const projects = appData.projects.filter((project) => project.id !== projectId);
  if (projects.length === appData.projects.length) throw new Error("Project not found.");
  return saveAppData({ ...appData, projects }).projects;
}
