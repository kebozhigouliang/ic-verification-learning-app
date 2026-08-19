import { useCallback, useState } from "react";
import {
  addProject as addStoredProject,
  deleteProject as deleteStoredProject,
  updateProject as updateStoredProject,
} from "@/storage/projectsRepository";
import { loadAppData } from "@/storage/repository";
import type { ProjectInput, ProjectRecord } from "@/types/projects";

export function useProjects() {
  const [projects, setProjects] = useState<ProjectRecord[]>(() => loadAppData().projects);

  const addProject = useCallback((input: ProjectInput) => {
    setProjects(addStoredProject(input));
  }, []);

  const updateProject = useCallback((projectId: string, input: ProjectInput) => {
    setProjects(updateStoredProject(projectId, input));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(deleteStoredProject(projectId));
  }, []);

  return {
    projects,
    addProject,
    updateProject,
    deleteProject,
  };
}
