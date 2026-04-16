"use client";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Notification, NotificationType } from "@/shared/types";
import { getNotificationIcon, getNotificationRoute } from "@/shared/utils/notification";

const typeLabel: Record<NotificationType, string> = {
  PROJECT_CREATED:   "New Project",
  PROJECT_ASSIGNED:  "Project Assigned",
  TASK_ASSIGNED:     "Task Assigned",
  TASK_UPDATED:      "Task Updated",
  TASK_DELETED:      "Task Deleted",
  CHAT_MESSAGE:      "New Message",
  DEADLINE_REMINDER: "⏰ Deadline Reminder",
};

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function NotificationToast({ notification, onDismiss }: NotificationToastProps) {
  const router = useRouter();
  const route = getNotificationRoute(notification);

  const handleClick = () => {
    if (route) router.push(route);
    onDismiss();
  };

  return (
    <div
      className="flex items-start gap-3 bg-white border border-border rounded-xl shadow-lg px-4 py-3 w-80 cursor-pointer hover:shadow-xl transition-shadow"
      onClick={handleClick}
    >
      <span className="text-xl flex-shrink-0 mt-0.5">
        {getNotificationIcon(notification.type)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-text-primary">
          {typeLabel[notification.type] ?? "Notification"}
        </p>
        <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
          {notification.message}
        </p>
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onDismiss(); }}
        className="flex-shrink-0 text-text-muted hover:text-text-primary transition-colors mt-0.5"
      >
        <X size={14} />
      </button>
    </div>
  );
}
