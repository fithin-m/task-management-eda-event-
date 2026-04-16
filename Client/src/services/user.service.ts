import api from "./api";
import type { ApiResponse, User } from "@/shared/types";

export const userService = {
  async getUsers(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>("/users");
    return data.data ?? [];
  },

  async getManagers(): Promise<User[]> {
    const { data } = await api.get<ApiResponse<User[]>>("/users/managers");
    return data.data ?? [];
  },

  async createManager(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    const { data } = await api.post<ApiResponse<User>>(
      "/users/create-manager",
      payload
    );
    return data.data!;
  },
};
