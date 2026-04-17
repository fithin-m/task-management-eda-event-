"use client";
import { useState, useEffect } from "react";
import { Plus, Search } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { taskService } from "@/services/task.service";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { KanbanColumn } from "./KanbanColumn";
import { canCreateTask, canUpdateStatus } from "@/shared/utils/rbac";
import type { Task, TaskStatus, Priority } from "@/shared/types";
import toast from "react-hot-toast";

export function KanbanBoard() {
  const { tasks, loading, error, fetchTasks, updateTaskStatus } = useTaskStore();
  const { projects } = useProjectStore();
  const { role, user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  useEffect(() => {
    fetchTasks({
      q: search || undefined,
      priority: (priorityFilter as Priority) || undefined,
      projectId: projectFilter || undefined,
    });
  }, [search, priorityFilter, projectFilter]); 

  // Group tasks by status
  const todoTasks = tasks.filter((t) => t.status === "TODO");
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");
  const completedTasks = tasks.filter((t) => t.status === "COMPLETED");

  const handleDragStart = (task: Task) => {
    // Check if user can update status
    if (!canUpdateStatus(role, user?.id ?? "", task)) {
      toast.error("You don't have permission to move this task");
      return;
    }
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, newStatus: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    // Optimistic update
    const oldStatus = draggedTask.status;
    updateTaskStatus(draggedTask.id, newStatus);
    setDraggedTask(null);

    try {
      await taskService.updateStatus(draggedTask.id, newStatus);
      toast.success("Task moved successfully");
    } catch (err: any) {
      // Revert on failure
      updateTaskStatus(draggedTask.id, oldStatus);
      toast.error(err?.response?.data?.message ?? "Failed to update task status");
    }
  };

  const canCreate = canCreateTask(role);

  if (error) return <ErrorState message={error} onRetry={() => fetchTasks()} />;

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/*  Toolbar  */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full h-9 pl-9 pr-3 rounded-md border border-border bg-white text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
          />
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">All Priority</option>
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">All Projects</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        {canCreate && (
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New Task
          </Button>
        )}
      </div>

      {/*  Kanban Board  */}
      {loading ? (
        <div className="grid grid-cols-3 gap-4 flex-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-4 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-32 bg-gray-200 rounded" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={<Search size={32} />}
          title="No tasks found"
          description="Try adjusting your filters or create a new task."
          action={
            canCreate ? (
              <Button size="sm" icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
                Create Task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          <KanbanColumn
            title="To Do"
            status="TODO"
            tasks={todoTasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTaskClick={setDetailTask}
            isDragOver={dragOverColumn === "TODO"}
          />
          <KanbanColumn
            title="In Progress"
            status="IN_PROGRESS"
            tasks={inProgressTasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTaskClick={setDetailTask}
            isDragOver={dragOverColumn === "IN_PROGRESS"}
          />
          <KanbanColumn
            title="Completed"
            status="COMPLETED"
            tasks={completedTasks}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onTaskClick={setDetailTask}
            isDragOver={dragOverColumn === "COMPLETED"}
          />
        </div>
      )}

      {/*  Modals ─ */}
      {showCreate && <TaskFormModal open={showCreate} onClose={() => setShowCreate(false)} />}
      {detailTask && (
        <TaskDetailModal open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} />
      )}
    </div>
  );
}
