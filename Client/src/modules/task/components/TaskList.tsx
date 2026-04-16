"use client";
import { useState, useEffect } from "react";
import { Plus, Search, Trash2, Edit2, Eye } from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/projectStore";
import { useAuthStore } from "@/store/authStore";
import { taskService } from "@/services/task.service";
import { StatusBadge, PriorityBadge } from "@/shared/components/Badge";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { TaskRowSkeleton } from "@/shared/components/Skeleton";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { TaskFormModal } from "./TaskFormModal";
import { TaskDetailModal } from "./TaskDetailModal";
import { getDueSoon, isOverdue, formatDate } from "@/shared/utils/format";
import { canDeleteTask, canCreateTask } from "@/shared/utils/rbac";
import { cn } from "@/shared/utils/cn";
import type { Task, TaskStatus, Priority } from "@/shared/types";
import toast from "react-hot-toast";

export function TaskList() {
  const { tasks, loading, error, fetchTasks, removeTask, updateTaskStatus } = useTaskStore();
  const { projects } = useProjectStore();
  const { role, user } = useAuthStore();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [detailTask, setDetailTask] = useState<Task | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchTasks({
      q: search || undefined,
      status: (statusFilter as TaskStatus) || undefined,
      priority: (priorityFilter as Priority) || undefined,
      projectId: projectFilter || undefined,
    });
  }, [search, statusFilter, priorityFilter, projectFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      // Immediately update store — no refetch needed
      removeTask(deleteTarget.id);
      toast.success("Task deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete task");
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (task: Task, status: TaskStatus) => {
    // Only assigned user can update status (USER role)
    // Admin/Manager can also update
    if (role === "USER" && task.assignedTo.id !== user?.id) {
      toast.error("You can only update status for tasks assigned to you.");
      return;
    }
    try {
      await taskService.updateStatus(task.id, status);
      updateTaskStatus(task.id, status);
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update status");
    }
  };

  const canCreate = canCreateTask(role);

  if (error) return <ErrorState message={error} onRetry={() => fetchTasks()} />;

  return (
    <div className="space-y-4">
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
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
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-border bg-white text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30"
        >
          <option value="">All Status</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

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
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Only admin/manager see New Task button */}
        {canCreate && (
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New Task
          </Button>
        )}
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_120px_140px_120px_80px] text-xs font-semibold text-text-muted uppercase tracking-wide px-5 py-3 border-b border-border bg-gray-50">
          <span>Task</span>
          <span className="text-center">Priority</span>
          <span className="text-center">Status</span>
          <span className="text-center">Due Date</span>
          <span className="text-center">Actions</span>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, i) => <TaskRowSkeleton key={i} />)}
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
          <div className="divide-y divide-border">
            {tasks.map((task) => {
              const due = getDueSoon(task.deadline);
              const overdue = isOverdue(task.deadline);

              // Per-task RBAC
              const userCanDelete = canDeleteTask(role, user?.id ?? "", task, projects);
              const userCanEdit = role === "ADMIN" || role === "MANAGER";
              // User can only change status of their own tasks
              const userCanChangeStatus =
                role === "ADMIN" ||
                role === "MANAGER" ||
                task.assignedTo.id === user?.id;

              return (
                <div
                  key={task.id}
                  className="grid grid-cols-[1fr_120px_140px_120px_80px] items-center px-5 py-3 hover:bg-gray-50 group transition-colors"
                >
                  {/* Task info */}
                  <div className="min-w-0 pr-4">
                    <button
                      onClick={() => setDetailTask(task)}
                      className="text-sm font-medium text-text-primary hover:text-brand text-left truncate block w-full"
                    >
                      {task.title}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Avatar name={task.assignedTo.name} size="xs" />
                      <span className="text-xs text-text-muted">{task.assignedTo.name}</span>
                    </div>
                  </div>

                  {/* Priority */}
                  <div className="flex justify-center">
                    <PriorityBadge priority={task.priority} />
                  </div>

                  {/* Status — editable only if allowed */}
                  <div className="flex justify-center">
                    {userCanChangeStatus ? (
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task, e.target.value as TaskStatus)}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand/30 cursor-pointer"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    ) : (
                      <StatusBadge status={task.status} />
                    )}
                  </div>

                  {/* Due date */}
                  <div className="text-center">
                    {task.deadline ? (
                      <span className={cn("text-xs", overdue ? "text-status-overdue font-medium" : "text-text-muted")}>
                        {due ?? formatDate(task.deadline)}
                      </span>
                    ) : (
                      <span className="text-xs text-text-muted">—</span>
                    )}
                  </div>

                  {/* Actions — RBAC gated */}
                  <div className="flex items-center justify-center gap-1">
                    {/* View detail — everyone */}
                    <button
                      onClick={() => setDetailTask(task)}
                      className="p-1.5 rounded hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
                      title="View details"
                    >
                      <Eye size={13} />
                    </button>

                    {/* Edit — admin or manager only */}
                    {userCanEdit && (
                      <button
                        onClick={() => setEditTask(task)}
                        className="p-1.5 rounded hover:bg-brand-light text-text-muted hover:text-brand transition-colors"
                        title="Edit task"
                      >
                        <Edit2 size={13} />
                      </button>
                    )}

                    {/* Delete — RBAC: admin always, manager only own-project tasks */}
                    {userCanDelete ? (
                      <button
                        onClick={() => setDeleteTarget(task)}
                        className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={13} />
                      </button>
                    ) : (
                      // Show disabled delete for visual consistency (hidden for users)
                      role !== "USER" && (
                        <button
                          disabled
                          className="p-1.5 rounded text-text-muted/30 cursor-not-allowed"
                          title="You don't have permission to delete this task"
                        >
                          <Trash2 size={13} />
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showCreate && (
        <TaskFormModal open={showCreate} onClose={() => setShowCreate(false)} />
      )}
      {editTask && (
        <TaskFormModal open={!!editTask} onClose={() => setEditTask(null)} task={editTask} />
      )}
      {detailTask && (
        <TaskDetailModal open={!!detailTask} onClose={() => setDetailTask(null)} task={detailTask} />
      )}

      {/* Safe delete confirmation */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Task"
        description={`This will permanently remove "${deleteTarget?.title}" and all its comments. This action cannot be undone.`}
        confirmLabel="Delete Task"
      />
    </div>
  );
}
