import { Server, Socket } from "socket.io";
import { chatService } from "./chat.service";
import { AuthSocket } from "./chat.types";
import { notificationEmitter } from "../notification/notification.emitter";
import prisma from "../../core/database/prisma";

export const initChatSocket = (io: Server) => {
  io.on("connection", (rawSocket) => {
    const socket = rawSocket as AuthSocket;
    const userId = socket.user?.id;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    console.log("✅ User connected:", userId);

    // ── Join personal room for targeted notifications ──────────────────────
    socket.join(`user:${userId}`);

    // ── JOIN PROJECT ROOM ──────────────────────────────────────────────────
    socket.on("join_project", async (projectId: string, ack?: (res: any) => void) => {
      try {
        if (!projectId) {
          socket.emit("chat_error", "Project ID required");
          return ack?.({ ok: false, error: "Project ID required" });
        }

        const isMember = await chatService.isProjectMember(userId, projectId);
        if (!isMember) {
          socket.emit("chat_error", "Access denied");
          return ack?.({ ok: false, error: "Access denied" });
        }

        socket.join(projectId);
        const messages = await chatService.getProjectMessages(projectId);
        socket.emit("chat_history", messages);

        console.log(`📁 User ${userId} joined project ${projectId}`);
        return ack?.({ ok: true });
      } catch (err) {
        console.error("join_project error:", err);
        socket.emit("chat_error", "Join failed");
        return ack?.({ ok: false, error: "Join failed" });
      }
    });

    // ── SEND MESSAGE ───────────────────────────────────────────────────────
    socket.on(
      "send_message",
      async (
        { projectId, content }: { projectId: string; content: string },
        ack?: (res: any) => void,
      ) => {
        try {
          if (!projectId || !content?.trim()) {
            socket.emit("chat_error", "Invalid data");
            return ack?.({ ok: false, error: "Invalid data" });
          }

          const isMember = await chatService.isProjectMember(userId, projectId);
          if (!isMember) {
            socket.emit("chat_error", "Access denied");
            return ack?.({ ok: false, error: "Access denied" });
          }

          const message = await chatService.createMessage({
            projectId,
            senderId: userId,
            content: content.trim(),
          });

          // Broadcast message to project room
          io.to(projectId).emit("receive_message", message);

          // ── Notify all project members except sender ─────────────────────
          const members = await prisma.projectMember.findMany({
            where: { projectId },
            select: { userId: true },
          });
          // Also include project creator
          const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: { name: true, createdBy: true },
          });

          const recipientIds = [
            ...members.map((m) => m.userId),
            project?.createdBy ?? "",
          ].filter(Boolean);

          const senderName = message.sender?.name ?? "Someone";

          await notificationEmitter.sendBulk(recipientIds, {
            type: "CHAT_MESSAGE",
            message: `New message in "${project?.name ?? "project"}" from ${senderName}`,
            projectId,
            actorId: userId,
          });

          return ack?.({ ok: true, message });
        } catch (err) {
          console.error("send_message error:", err);
          socket.emit("chat_error", "Message failed");
          return ack?.({ ok: false, error: "Message failed" });
        }
      },
    );

    // ── DISCONNECT ─────────────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log("❌ User disconnected:", userId);
    });
  });
};
