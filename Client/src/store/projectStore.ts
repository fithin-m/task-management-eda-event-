import { create } from "zustand";
import type { Project } from "@/shared/types";
import { projectService } from "@/services/project.service";

interface ProjectState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  removeProject: (id: string) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  loading: false,
  error: null,

  fetchProjects: async () => {
    set({ loading: true, error: null });
    try {
      const projects = await projectService.getProjects();
      set({ projects, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message ?? "Failed to load projects",
        loading: false,
      });
    }
  },

  addProject: (project) =>
    set((s) => ({ projects: [project, ...s.projects] })),

  updateProject: (project) =>
    set((s) => ({
      projects: s.projects.map((p) => (p.id === project.id ? project : p)),
    })),

  removeProject: (id) =>
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

  reset: () => set({ projects: [], loading: false, error: null }),
}));
