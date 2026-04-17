"use client";
import { cn } from "@/shared/utils/cn";
import { TaskCard } from "./TaskCard";
import type { Task, TaskStatus } from "@/shared/types";

interface KanbanColumnProps {
  title: string;
  status: TaskStatus;
  tasks: Task[];
  onDragStart: (task: Task) => void;
  onDragOver: (e: React.DragEvent, status: TaskStatus) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, status: TaskStatus) => void;
  onTaskClick: (task: Task) => void;
  isDragOver: boolean;
}

const columnStyles: Record<TaskStatus, { bg: string; border: string; header: string }> = {
  TODO: {
    bg: "bg-gray-50",
    border: "border-gray-300",
    header: "bg-gray-100 text-gray-700",
  },
  IN_PROGRESS: {
    bg: "bg-blue-50",
    border: "border-blue-300",
    header: "bg-blue-100 text-blue-700",
  },
  COMPLETED: {
    bg: "bg-green-50",
    border: "border-green-300",
    header: "bg-green-100 text-green-700",
  },
};

export function KanbanColumn({
  title,
  status,
  tasks,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onTaskClick,
  isDragOver,
}: KanbanColumnProps) {
  const styles = columnStyles[status];

  return (
    <div
      className={cn(
        "flex flex-col rounded-lg border-2 transition-all",
        styles.bg,
        isDragOver ? cn(styles.border, "border-dashed shadow-lg") : "border-transparent"
      )}
      onDragOver={(e) => onDragOver(e, status)}
      onDragLeave={onDragLeave}
      onDrop={(e) => onDrop(e, status)}
    >
      {/* Column Header */}
      <div className={cn("px-4 py-3 rounded-t-lg", styles.header)}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container - Scrollable */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-text-muted text-sm">
            No tasks
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDragStart={onDragStart}
              onClick={onTaskClick}
            />
          ))
        )}
      </div>
    </div>
  );
}
