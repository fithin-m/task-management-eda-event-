import api from "./api";
import type { LoginResponse, User } from "@/shared/types";

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  async register(
    name: string,
    email: string,
    password: string
  ): Promise<User> {
    const { data } = await api.post<User>("/auth/register", {
      name,
      email,
      password,
    });
    return data;
  },
};
