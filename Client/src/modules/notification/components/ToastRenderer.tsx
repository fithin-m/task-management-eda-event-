"use client";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { NotificationToast } from "./NotificationToast";
import type { Notification } from "@/shared/types";

/**
 * Mounts once in AppLayout.
 * Listens for the custom "taskhub:notification" window event
 * (dispatched by useSocket.ts) and renders a bottom-right toast.
 */
export function ToastRenderer() {
  useEffect(() => {
    const handler = (e: Event) => {
      const notification = (e as CustomEvent<Notification>).detail;
      if (!notification) return;

      toast.custom(
        (t) => (
          <NotificationToast
            notification={notification}
            onDismiss={() => toast.dismiss(t.id)}
          />
        ),
        {
          duration: 5000,
          position: "bottom-right",
        },
      );
    };

    window.addEventListener("taskhub:notification", handler);
    return () => window.removeEventListener("taskhub:notification", handler);
  }, []);

  return null;
}
