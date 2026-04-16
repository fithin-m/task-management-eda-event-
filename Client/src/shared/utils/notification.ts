import type { Notification, NotificationType } from "@/shared/types";

export function getNotificationIcon(type: NotificationType): string {
  const icons: Record<NotificationType, string> = {
    PROJECT_CREATED:   "📁",
    PROJECT_ASSIGNED:  "📋",
    TASK_ASSIGNED:     "✅",
    TASK_UPDATED:      "✏️",
    TASK_DELETED:      "🗑️",
    CHAT_MESSAGE:      "💬",
    DEADLINE_REMINDER: "⏰",
  };
  return icons[type] ?? "🔔";
}

export function getNotificationRoute(n: Notification): string | null {
  switch (n.type) {
    case "TASK_ASSIGNED":
    case "TASK_UPDATED":
    case "TASK_DELETED":
      return n.taskId ? `/tasks` : null;
    case "PROJECT_CREATED":
    case "PROJECT_ASSIGNED":
      return n.projectId ? `/projects/${n.projectId}` : "/projects";
    case "CHAT_MESSAGE":
      return n.projectId ? `/chat?project=${n.projectId}` : "/chat";
    case "DEADLINE_REMINDER":
      return n.taskId ? `/tasks` : "/dashboard";
    default:
      return "/notifications";
  }
}

export function getNotificationLabel(type: NotificationType): string {
  const labels: Record<NotificationType, string> = {
    PROJECT_CREATED:   "New Project",
    PROJECT_ASSIGNED:  "Project Assigned",
    TASK_ASSIGNED:     "Task Assigned",
    TASK_UPDATED:      "Task Updated",
    TASK_DELETED:      "Task Deleted",
    CHAT_MESSAGE:      "New Message",
    DEADLINE_REMINDER: "⏰ Deadline Reminder",
  };
  return labels[type] ?? "Notification";
}
