import api from "./api";
import type { ApiResponse, Task, Comment, TaskQuery, TaskStatus } from "@/shared/types";

export const taskService = {
  async getTasks(query?: TaskQuery): Promise<Task[]> {
    const { data } = await api.get<ApiResponse<Task[]>>("/tasks", {
      params: query,
    });
    return data.data ?? [];
  },

  async createTask(payload: {
    title: string;
    description?: string;
    projectId: string;
    assignedTo: string;
    priority?: string;
    deadline?: string;
  }): Promise<Task> {
    const { data } = await api.post<ApiResponse<Task>>("/tasks", payload);
    return data.data!;
  },

  async updateTask(
    taskId: string,
    payload: {
      title?: string;
      description?: string;
      priority?: string;
      deadline?: string;
    }
  ): Promise<Task> {
    const { data } = await api.patch<ApiResponse<Task>>(
      `/tasks/${taskId}`,
      payload
    );
    return data.data!;
  },

  async updateStatus(taskId: string, status: TaskStatus): Promise<Task> {
    const { data } = await api.patch<ApiResponse<Task>>(
      `/tasks/${taskId}/status`,
      { status }
    );
    return data.data!;
  },

  async assignTask(taskId: string, userId: string): Promise<Task> {
    const { data } = await api.patch<ApiResponse<Task>>(
      `/tasks/${taskId}/assign`,
      { userId }
    );
    return data.data!;
  },

  async deleteTask(taskId: string): Promise<void> {
    await api.delete(`/tasks/${taskId}`);
  },

  async getComments(taskId: string): Promise<Comment[]> {
    const { data } = await api.get<ApiResponse<Comment[]>>(
      `/tasks/${taskId}/comments`
    );
    return data.data ?? [];
  },

  async addComment(taskId: string, content: string): Promise<Comment> {
    const { data } = await api.post<ApiResponse<Comment>>(
      `/tasks/${taskId}/comments`,
      { content }
    );
    return data.data!;
  },
};
