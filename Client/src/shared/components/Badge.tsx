import { cn } from "@/shared/utils/cn";
import type { TaskStatus, Priority } from "@/shared/types";

// ─── Status Badge ─────────────────────────────────────────────────────────────
const statusConfig: Record<
  TaskStatus,
  { label: string; dot: string; bg: string; text: string }
> = {
  TODO: {
    label: "To Do",
    dot: "bg-status-todo",
    bg: "bg-status-todo-bg",
    text: "text-status-todo",
  },
  IN_PROGRESS: {
    label: "In Progress",
    dot: "bg-status-inprogress",
    bg: "bg-status-inprogress-bg",
    text: "text-status-inprogress",
  },
  COMPLETED: {
    label: "Completed",
    dot: "bg-status-completed",
    bg: "bg-status-completed-bg",
    text: "text-status-completed",
  },
};

const priorityConfig: Record<
  Priority,
  { label: string; bg: string; text: string }
> = {
  LOW: { label: "Low", bg: "bg-priority-low-bg", text: "text-priority-low" },
  MEDIUM: {
    label: "Medium",
    bg: "bg-priority-medium-bg",
    text: "text-priority-medium",
  },
  HIGH: {
    label: "High",
    bg: "bg-priority-high-bg",
    text: "text-priority-high",
  },
};

interface StatusBadgeProps {
  status: TaskStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const cfg = statusConfig[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const cfg = priorityConfig[priority];
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}

interface RoleBadgeProps {
  role: string;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  const cfg = {
    ADMIN: { label: "Admin", bg: "bg-purple-100", text: "text-purple-700" },
    MANAGER: { label: "Manager", bg: "bg-blue-100", text: "text-blue-700" },
    USER: { label: "User", bg: "bg-gray-100", text: "text-gray-600" },
  }[role] ?? { label: role, bg: "bg-gray-100", text: "text-gray-600" };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium",
        cfg.bg,
        cfg.text,
        className
      )}
    >
      {cfg.label}
    </span>
  );
}
