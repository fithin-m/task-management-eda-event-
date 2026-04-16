"use client";
import { useEffect, useMemo } from "react";
import { CheckSquare, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { MetricCard } from "@/shared/components/Card";
import { MetricCardSkeleton } from "@/shared/components/Skeleton";
import { ErrorState } from "@/shared/components/ErrorState";
import { EmptyState } from "@/shared/components/EmptyState";
import { StatusBadge, PriorityBadge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/projectStore";
import { getDueSoon, isOverdue, getProjectColor, getInitials } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import Link from "next/link";
import { taskService } from "@/services/task.service";
import toast from "react-hot-toast";

export function UserDashboard() {
  const { tasks, loading, error, fetchTasks, updateTaskStatus } = useTaskStore();
  const { projects, fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchTasks();
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = useMemo(() => ({
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "TODO").length,
    inProgress: tasks.filter((t) => t.status === "IN_PROGRESS").length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    overdue: tasks.filter((t) => isOverdue(t.deadline)).length,
  }), [tasks]);

  const handleStatusChange = async (taskId: string, status: "TODO" | "IN_PROGRESS" | "COMPLETED") => {
    try {
      await taskService.updateStatus(taskId, status);
      updateTaskStatus(taskId, status);
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to update");
    }
  };

  if (error) return <ErrorState message={error} onRetry={fetchTasks} />;

  return (
    <div className="space-y-6">
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="My Tasks" value={metrics.total} icon={<CheckSquare size={18} />} color="text-brand" />
            <MetricCard label="In Progress" value={metrics.inProgress} icon={<Clock size={18} />} color="text-status-inprogress" />
            <MetricCard label="Completed" value={metrics.completed} icon={<TrendingUp size={18} />} color="text-status-completed" />
            <MetricCard label="Overdue" value={metrics.overdue} icon={<AlertCircle size={18} />} color="text-status-overdue" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* My Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-border">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">My Tasks</h2>
            <span className="text-xs text-text-muted">{tasks.length} total</span>
          </div>
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <EmptyState
              icon={<CheckSquare size={32} />}
              title="No tasks assigned"
              description="You don't have any tasks yet. Check back later."
            />
          ) : (
            <div className="p-4 space-y-2">
              {tasks.map((task) => {
                const due = getDueSoon(task.deadline);
                const overdue = isOverdue(task.deadline);
                return (
                  <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-gray-200 transition-all">
                    <div className="flex-1 min-w-0">
                      <Link href={`/tasks/${task.id}`}>
                        <p className="text-sm font-medium text-text-primary hover:text-brand truncate">{task.title}</p>
                      </Link>
                      {due && (
                        <p className={cn("text-xs mt-0.5", overdue ? "text-status-overdue" : "text-text-muted")}>
                          {due}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <PriorityBadge priority={task.priority} />
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value as any)}
                        className="text-xs border border-border rounded-md px-2 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-brand/30"
                      >
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* My Projects */}
        <div className="bg-white rounded-lg border border-border">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-semibold text-text-primary">My Projects</h2>
          </div>
          <div className="p-4 space-y-2">
            {projects.length === 0 ? (
              <EmptyState icon={<CheckSquare size={28} />} title="No projects" description="You haven't been added to any projects yet." />
            ) : (
              projects.map((project, i) => {
                const projectTasks = tasks.filter((t) => t.projectId === project.id);
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0", getProjectColor(i))}>
                        {getInitials(project.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{project.name}</p>
                        <p className="text-xs text-text-muted">{projectTasks.length} tasks</p>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
