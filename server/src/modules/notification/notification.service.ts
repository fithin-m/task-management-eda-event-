import prisma from "../../core/database/prisma";
import type { NotificationType } from "@prisma/client";

export interface CreateNotificationInput {
  userId: string;       // recipient
  type: NotificationType;
  message: string;
  taskId?: string;
  projectId?: string;
  actorId?: string;     // who triggered — used to skip self-notify
}

export class NotificationService {
  
  async create(input: CreateNotificationInput) {
    // Never notify the person who triggered the action
    if (input.actorId && input.userId === input.actorId) return null;

    return prisma.notification.create({
      data: {
        userId:    input.userId,
        type:      input.type,
        message:   input.message,
        taskId:    input.taskId    ?? null,
        projectId: input.projectId ?? null,
        actorId:   input.actorId   ?? null,
        isRead:    false,
      },
    });
  }

  async createBulk(
    userIds: string[],
    base: Omit<CreateNotificationInput, "userId">,
  ) {
    const recipients = [...new Set(userIds)].filter(
      (id) => !base.actorId || id !== base.actorId,
    );
    if (recipients.length === 0) return [];

    await prisma.notification.createMany({
      data: recipients.map((userId) => ({
        userId,
        type:      base.type,
        message:   base.message,
        taskId:    base.taskId    ?? null,
        projectId: base.projectId ?? null,
        actorId:   base.actorId   ?? null,
        isRead:    false,
      })),
      skipDuplicates: true,
    });

    // Return the created notifications for real-time emission
    return prisma.notification.findMany({
      where: {
        userId:    { in: recipients },
        type:      base.type,
        projectId: base.projectId ?? undefined,
        taskId:    base.taskId    ?? undefined,
        isRead:    false,
      },
      orderBy: { createdAt: "desc" },
      take: recipients.length,
    });
  }

  async getForUser(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async getUnreadCount(userId: string) {
    return prisma.notification.count({
      where: { userId, isRead: false },
    });
  }
}

export const notificationService = new NotificationService();
