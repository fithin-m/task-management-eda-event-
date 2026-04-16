/**
 * NotificationEmitter
 * -------------------
 * Single place that:
 *  1. Persists notification(s) to DB
 *  2. Emits real-time socket event to the recipient(s)
 *
 * Import `emitter` after the Socket.IO server is ready and call
 * `emitter.init(io)` once in server.ts.
 */
import { Server } from "socket.io";
import { notificationService, CreateNotificationInput } from "./notification.service";

class NotificationEmitter {
  private io: Server | null = null;

  init(io: Server) {
    this.io = io;
  }

  /** Emit to one user */
  async send(input: CreateNotificationInput) {
    const notification = await notificationService.create(input);
    if (notification && this.io) {
      this.io.to(`user:${input.userId}`).emit("notification", notification);
    }
    return notification;
  }

  /** Emit to multiple users (deduped, actor excluded) */
  async sendBulk(
    userIds: string[],
    base: Omit<CreateNotificationInput, "userId">,
  ) {
    const notifications = await notificationService.createBulk(userIds, base);
    if (this.io) {
      for (const n of notifications) {
        this.io.to(`user:${n.userId}`).emit("notification", n);
      }
    }
    return notifications;
  }
}

export const notificationEmitter = new NotificationEmitter();
