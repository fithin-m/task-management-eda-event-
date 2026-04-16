"use client";
import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import { useChatStore } from "@/store/chatStore";
import { useNotificationStore } from "@/store/notificationStore";
import type { Message, Notification } from "@/shared/types";

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// Module-level singleton — one socket per browser session
let socketInstance: Socket | null = null;

export function useSocket() {
  const { token } = useAuthStore();
  const { addMessage, setMessages } = useChatStore();
  const { addNotification } = useNotificationStore();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    socketRef.current = socketInstance;

    // ── Chat events ──────────────────────────────────────────────────────
    const onMessage = (message: Message) => {
      addMessage(message.projectId, message);
    };

    const onHistory = (messages: Message[]) => {
      if (messages.length > 0) {
        setMessages(messages[0].projectId, messages);
      }
    };

    // ── Notification event ───────────────────────────────────────────────
    const onNotification = (notification: Notification) => {
      // 1. Push into Zustand store (updates bell badge + notification page)
      addNotification(notification);

      // 2. Show bottom-right toast — rendered by the global ToastRenderer
      //    We use a custom event so the TSX component can handle the render
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("taskhub:notification", { detail: notification }),
        );
      }
    };

    socketInstance.on("receive_message", onMessage);
    socketInstance.on("chat_history", onHistory);
    socketInstance.on("notification", onNotification);

    return () => {
      socketInstance?.off("receive_message", onMessage);
      socketInstance?.off("chat_history", onHistory);
      socketInstance?.off("notification", onNotification);
    };
  }, [token, addMessage, setMessages, addNotification]);

  const joinProject = (projectId: string) => {
    socketRef.current?.emit("join_project", projectId);
  };

  const sendMessage = (projectId: string, content: string) => {
    socketRef.current?.emit("send_message", { projectId, content });
  };

  return { joinProject, sendMessage, socket: socketRef.current };
}
