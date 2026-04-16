import api from "./api";
import type { ApiResponse, Project } from "@/shared/types";

export const projectService = {
  async getProjects(): Promise<Project[]> {
    const { data } = await api.get<ApiResponse<Project[]>>("/projects");
    return data.data ?? [];
  },

  async createProject(payload: {
    name: string;
    description?: string;
    managerId?: string;
  }): Promise<Project> {
    const { data } = await api.post<ApiResponse<Project>>("/projects", payload);
    return data.data!;
  },

  async updateProject(
    projectId: string,
    payload: { name?: string; description?: string }
  ): Promise<Project> {
    const { data } = await api.put<ApiResponse<Project>>(
      `/projects/${projectId}`,
      payload
    );
    return data.data!;
  },

  async deleteProject(projectId: string): Promise<void> {
    await api.delete(`/projects/${projectId}`);
  },

  async addMember(projectId: string, userId: string): Promise<void> {
    await api.post(`/projects/${projectId}/members`, { userId });
  },
};
