"use client";
import { useEffect, useMemo } from "react";
import { FolderOpen, CheckSquare, TrendingUp, Calendar, Plus } from "lucide-react";
import { MetricCard } from "@/shared/components/Card";
import { MetricCardSkeleton } from "@/shared/components/Skeleton";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge, PriorityBadge } from "@/shared/components/Badge";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { getProjectColor, getInitials, getDueSoon, isOverdue } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import Link from "next/link";

export function ManagerDashboard() {
  const { projects, loading: pLoading, error: pError, fetchProjects } = useProjectStore();
  const { tasks, loading: tLoading, error: tError, fetchTasks } = useTaskStore();
  // Manager sees only role=USER people — never admins or other managers
  const { users, fetchUsers } = useUserStore();

  useEffect(() => {
    fetchProjects();
    fetchTasks();
    fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Filter: manager only sees regular users in People section ─────────────
  const teamUsers = useMemo(() => users.filter((u) => u.role === "USER"), [users]);

  const metrics = useMemo(() => ({
    totalProjects: projects.length,
    totalTasks: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => isOverdue(t.deadline)).length,
  }), [projects, tasks]);

  const loading = pLoading || tLoading;

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
      {/* ── Metrics ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="My Projects" value={metrics.totalProjects} icon={<FolderOpen size={18} />} color="text-brand" />
            <MetricCard label="Total Tasks" value={metrics.totalTasks} icon={<CheckSquare size={18} />} color="text-blue-600" />
            <MetricCard label="Completed" value={metrics.completed} icon={<TrendingUp size={18} />} color="text-status-completed" />
            <MetricCard label="Overdue" value={metrics.overdue} icon={<Calendar size={18} />} color="text-status-overdue" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Assigned Tasks ───────────────────────────────────────────── */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Assigned Tasks</h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted">Nearest Due Date</span>
              <Link href="/tasks">
                <Button size="sm" icon={<Plus size={14} />}>New Task</Button>
              </Link>
            </div>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={32} />}
              title="No tasks yet"
              description="Create tasks and assign them to your team members."
            />
          ) : (
            <div className="p-4 space-y-2">
              {tasks.slice(0, 6).map((task) => {
                const due = getDueSoon(task.deadline);
                const overdue = isOverdue(task.deadline);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-brand/30 hover:bg-brand-light/30 transition-all group">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary group-hover:text-brand truncate">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Avatar name={task.assignedTo.name} size="xs" />
                        <span className="text-xs text-text-muted">{task.assignedTo.name}</span>
                        {due && (
                          <span className={cn("text-xs", overdue ? "text-status-overdue" : "text-text-muted")}>
                            · {due}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <StatusBadge status={task.status} />
                    </div>
                  </div>
                );
              })}
              {tasks.length > 6 && (
                <Link href="/tasks" className="block text-center text-xs text-brand hover:underline py-2">
                  Show All ({tasks.length})
                </Link>
              )}
            </div>
          )}
        </div>

        {/* ── My Projects ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">Projects</h2>
            <Link href="/projects">
              <Button size="sm" variant="ghost" icon={<Plus size={14} />}>New</Button>
            </Link>
          </div>
          <div className="p-4 space-y-2">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 bg-gray-100 rounded animate-pulse" />
              ))
            ) : projects.length === 0 ? (
              <EmptyState icon={<FolderOpen size={28} />} title="No projects" description="Create a project to get started." />
            ) : (
              projects.map((project, i) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id);
                const dueSoon = projectTasks.filter((t) => isOverdue(t.deadline)).length;
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0", getProjectColor(i))}>
                        {getInitials(project.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{project.name}</p>
                        <p className="text-xs text-text-muted">
                          {dueSoon > 0
                            ? `${dueSoon} task${dueSoon > 1 ? "s" : ""} overdue`
                            : `${projectTasks.length} task${projectTasks.length !== 1 ? "s" : ""}`}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── People — only regular users, never admins/managers ──────────── */}
      <div className="bg-white rounded-lg border border-border">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h2 className="text-sm font-semibold text-text-primary">
            Team Members ({teamUsers.length})
          </h2>
          <Link href="/users" className="text-xs text-brand hover:underline">View all</Link>
        </div>
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {teamUsers.slice(0, 12).map((u) => (
            <div key={u.id} className="flex flex-col items-center gap-2 text-center">
              <Avatar name={u.name} size="md" />
              <div>
                <p className="text-xs font-medium text-text-primary truncate max-w-[80px]">{u.name}</p>
                <p className="text-[10px] text-text-muted truncate max-w-[80px]">{u.email}</p>
              </div>
            </div>
          ))}
          {teamUsers.length === 0 && (
            <p className="text-sm text-text-muted col-span-full text-center py-4">
              No team members yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
