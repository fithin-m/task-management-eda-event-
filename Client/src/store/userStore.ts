import { create } from "zustand";
import type { User } from "@/shared/types";
import { userService } from "@/services/user.service";

interface UserState {
  users: User[];
  managers: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  fetchManagers: () => Promise<void>;
  addManager: (user: User) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  managers: [],
  loading: false,
  error: null,

  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await userService.getUsers();
      set({ users, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message ?? "Failed to load users",
        loading: false,
      });
    }
  },

  fetchManagers: async () => {
    set({ loading: true, error: null });
    try {
      const managers = await userService.getManagers();
      set({ managers, loading: false });
    } catch (err: any) {
      set({
        error: err?.response?.data?.message ?? "Failed to load managers",
        loading: false,
      });
    }
  },

  addManager: (user) => set((s) => ({ managers: [user, ...s.managers] })),

  reset: () => set({ users: [], managers: [], loading: false, error: null }),
}));
