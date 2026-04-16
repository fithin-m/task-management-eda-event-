import { create } from "zustand";
import type { Task, TaskQuery, TaskStatus } from "@/shared/types";
import { taskService } from "@/services/task.service";

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  fetchTasks: (query?: TaskQuery) => Promise<void>;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  updateTaskStatus: (taskId: string, status: TaskStatus) => void;
  removeTask: (id: string) => void;
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  loading: false,
  error: null,

  fetchTasks: async (query) => {
    set({ loading: true, error: null });
    try {
      const tasks = await taskService.getTasks(query);
      set({ tasks, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message ?? "Failed to load tasks",
        loading: false,
      });
    }
  },

  addTask: (task) => set((s) => ({ tasks: [task, ...s.tasks] })),

  updateTask: (task) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === task.id ? task : t)),
    })),

  updateTaskStatus: (taskId, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  removeTask: (id) =>
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

  reset: () => set({ tasks: [], loading: false, error: null }),
}));
