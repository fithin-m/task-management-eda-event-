"use client";
import { Calendar, GripVertical } from "lucide-react";
import { useState } from "react";
import { Avatar } from "@/shared/components/Avatar";
import { PriorityBadge } from "@/shared/components/Badge";
import { getDueSoon, isOverdue, formatDate } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import type { Task } from "@/shared/types";

interface TaskCardProps {
  task: Task;
  onDragStart: (task: Task) => void;
  onClick: (task: Task) => void;
}

export function TaskCard({ task, onDragStart, onClick }: TaskCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const due = getDueSoon(task.deadline);
  const overdue = isOverdue(task.deadline);

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    onDragStart(task);
    // Set drag image
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onClick={() => onClick(task)}
      className={cn(
        "bg-white rounded-lg border border-border p-3 cursor-pointer hover:shadow-md transition-all group",
        isDragging && "opacity-50 scale-95"
      )}
    >
      {/* Drag Handle */}
      <div className="flex items-start gap-2">
        <GripVertical
          size={16}
          className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5 cursor-grab active:cursor-grabbing"
        />
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h4 className="font-medium text-sm text-text-primary mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Priority Badge */}
          <div className="mb-3">
            <PriorityBadge priority={task.priority} />
          </div>

          {/* Footer: Assignee + Due Date */}
          <div className="flex items-center justify-between gap-2">
            {/* Assignee */}
            <div className="flex items-center gap-1.5">
              <Avatar name={task.assignedTo.name} size="xs" />
              <span className="text-xs text-text-muted truncate max-w-[100px]">
                {task.assignedTo.name}
              </span>
            </div>

            {/* Due Date */}
            {task.deadline && (
              <div
                className={cn(
                  "flex items-center gap-1 text-xs",
                  overdue ? "text-status-overdue font-medium" : "text-text-muted"
                )}
              >
                <Calendar size={12} />
                <span>{due ?? formatDate(task.deadline)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
