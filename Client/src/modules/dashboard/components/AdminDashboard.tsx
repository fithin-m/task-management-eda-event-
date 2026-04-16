"use client";
import { useEffect, useMemo, useState } from "react";
import { FolderOpen, CheckSquare, Users, UserCog, TrendingUp, Plus, Trash2 } from "lucide-react";
import { MetricCard } from "@/shared/components/Card";
import { MetricCardSkeleton } from "@/shared/components/Skeleton";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge, PriorityBadge } from "@/shared/components/Badge";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { getProjectColor, getInitials, formatDate, isOverdue } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import Link from "next/link";
import { projectService } from "@/services/project.service";
import toast from "react-hot-toast";

export function AdminDashboard() {
  const { projects, loading: pLoading, error: pError, fetchProjects, removeProject } = useProjectStore();
  const { tasks, loading: tLoading, error: tError, fetchTasks, removeTask } = useTaskStore();
  const { users, managers, loading: uLoading, fetchUsers, fetchManagers } = useUserStore();

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchUsers();
    fetchManagers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Live metrics — recomputed whenever store changes ──────────────────────
  const metrics = useMemo(() => ({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => isOverdue(t.deadline)).length,
    totalUsers: users.filter((u) => u.role === "USER").length,
    totalManagers: managers.length,
    activeUsers: users.filter((u) => u.isActive).length,
  }), [projects, tasks, users, managers]);

  const loading = pLoading || tLoading || uLoading;

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteTarget.id);
      // Remove project from store — metrics auto-update via useMemo
      removeProject(deleteTarget.id);
      // Also remove all tasks belonging to this project from store
      tasks
        .filter((t) => t.projectId === deleteTarget.id)
        .forEach((t) => removeTask(t.id));
      toast.success("Project deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  if (pError || tError) {
    return (
      <ErrorState
        message={pError ?? tError ?? undefined}
        onRetry={() => { fetchProjects(); fetchTasks(); }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Metrics row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Total Projects" value={metrics.totalProjects} icon={<FolderOpen size={18} />} color="text-brand" />
            <MetricCard label="Total Tasks" value={metrics.totalTasks} icon={<CheckSquare size={18} />} color="text-blue-600" />
            <MetricCard label="Completed" value={metrics.completed} icon={<TrendingUp size={18} />} color="text-status-completed" />
            <MetricCard label="Total Users" value={metrics.totalUsers} icon={<Users size={18} />} color="text-purple-600" />
            <MetricCard label="Managers" value={metrics.totalManagers} icon={<UserCog size={18} />} color="text-orange-500" />
          </>
        )}
      </div>

      {/* ── Task status breakdown ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-secondary mb-1">To Do</p>
          <p className="text-2xl font-bold text-status-todo">{metrics.todo}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-secondary mb-1">In Progress</p>
          <p className="text-2xl font-bold text-status-inprogress">{metrics.inProgress}</p>
        </div>
        <div className="bg-white rounded-lg border border-border p-4">
          <p className="text-xs text-text-secondary mb-1">Overdue</p>
          <p className="text-2xl font-bold text-status-overdue">{metrics.overdue}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── All Projects (admin can delete any) ─────────────────────── */}
        <div className="bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">All Projects</h2>
            <Link href="/projects">
              <Button size="sm" icon={<Plus size={14} />}>New Project</Button>
            </Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <EmptyState icon={<FolderOpen size={32} />} title="No projects yet" />
          ) : (
            <div className="divide-y divide-border">
              {projects.map((project, i) => (
                <div key={project.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                  <div className={cn("w-7 h-7 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0", getProjectColor(i))}>
                    {getInitials(project.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/projects/${project.id}`} className="text-sm font-medium text-text-primary hover:text-brand truncate block">
                      {project.name}
                    </Link>
                    <p className="text-xs text-text-muted">{formatDate(project.createdAt)}</p>
                  </div>
                  {/* Admin can delete ANY project */}
                  <button
                    onClick={() => setDeleteTarget({ id: project.id, name: project.name })}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition-all"
                    title="Delete project"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Recent Tasks ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Recent Tasks</h2>
            <Link href="/tasks" className="text-xs text-brand hover:underline">View all</Link>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState icon={<CheckSquare size={32} />} title="No tasks yet" />
          ) : (
            <div className="divide-y divide-border">
              {tasks.slice(0, 8).map((task) => (
                <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{task.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Avatar name={task.assignedTo.name} size="xs" />
                      <span className="text-xs text-text-muted">{task.assignedTo.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <PriorityBadge priority={task.priority} />
                    <StatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Active Users ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">
            Active Users ({metrics.activeUsers})
          </h2>
          <Link href="/users" className="text-xs text-brand hover:underline">Manage</Link>
        </div>
        <div className="p-5 flex flex-wrap gap-3">
          {users.slice(0, 12).map((u) => (
            <div key={u.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
              <Avatar name={u.name} size="xs" />
              <div>
                <p className="text-xs font-medium text-text-primary">{u.name}</p>
                <p className="text-[10px] text-text-muted">{u.role}</p>
              </div>
            </div>
          ))}
          {users.length === 0 && !uLoading && (
            <p className="text-sm text-text-muted">No users found</p>
          )}
        </div>
      </div>

      {/* ── Safe delete confirmation ─────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
        title="Delete Project"
        description={`This will permanently remove "${deleteTarget?.name}" along with ALL its tasks, chat messages, and member assignments. This action cannot be undone.`}
        confirmLabel="Delete Project"
      />
    </div>
  );
}
