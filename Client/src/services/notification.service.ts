import api from "./api";
import type { ApiResponse, Notification } from "@/shared/types";

export const notificationService = {
  async getAll(): Promise<Notification[]> {
    const { data } = await api.get<ApiResponse<Notification[]>>("/notifications");
    return data.data ?? [];
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<ApiResponse<{ count: number }>>("/notifications/unread");
    return data.data?.count ?? 0;
  },

  async markAsRead(id: string): Promise<void> {
    await api.patch(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.patch("/notifications/read");
  },
};
