"use client";
import { useEffect, useState } from "react";
import { Plus, Trash2, Edit2, CheckSquare, MessageSquare } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { useAuthStore } from "@/store/authStore";
import { projectService } from "@/services/project.service";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { ProjectCardSkeleton } from "@/shared/components/Skeleton";
import { ConfirmModal } from "@/shared/components/ConfirmModal";
import { ProjectFormModal } from "./ProjectFormModal";
import { canDeleteProject, canEditProject, canCreateProject } from "@/shared/utils/rbac";
import { getProjectColor, getInitials } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import type { Project } from "@/shared/types";
import toast from "react-hot-toast";
import Link from "next/link";

export function ProjectList() {
  const { projects, loading, error, fetchProjects, removeProject } = useProjectStore();
  const { tasks } = useTaskStore();
  const { role, user } = useAuthStore();

  const [showCreate, setShowCreate] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteTarget.id);
      // Immediately remove from store — cascades tasks too
      removeProject(deleteTarget.id);
      toast.success("Project deleted");
      setDeleteTarget(null);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete project");
    } finally {
      setDeleting(false);
    }
  };

  const userId = user?.id ?? "";
  const canCreate = canCreateProject(role);

  if (error) return <ErrorState message={error} onRetry={fetchProjects} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        {canCreate && (
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            New Project
          </Button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<CheckSquare size={40} />}
          title="No projects yet"
          description={canCreate ? "Create your first project to start managing tasks." : "You haven't been added to any projects yet."}
          action={canCreate ? <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>Create Project</Button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project, i) => {
            const projectTasks = tasks.filter((t) => t.projectId === project.id);
            const completed = projectTasks.filter((t) => t.status === "COMPLETED").length;
            const progress = projectTasks.length > 0 ? Math.round((completed / projectTasks.length) * 100) : 0;

            // Per-project RBAC
            const userCanDelete = canDeleteProject(role, userId, project);
            const userCanEdit = canEditProject(role, userId, project);

            return (
              <div
                key={project.id}
                className="bg-white rounded-lg border border-border shadow-card hover:shadow-card-hover transition-all group"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm flex-shrink-0", getProjectColor(i))}>
                        {getInitials(project.name)}
                      </div>
                      <div className="min-w-0">
                        <Link href={`/projects/${project.id}`}>
                          <h3 className="text-sm font-semibold text-text-primary hover:text-brand transition-colors truncate">
                            {project.name}
                          </h3>
                        </Link>
                        {project.description && (
                          <p className="text-xs text-text-muted mt-0.5 line-clamp-1">{project.description}</p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons — RBAC gated */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-2">
                      {userCanEdit && (
                        <button
                          onClick={() => setEditProject(project)}
                          className="p-1.5 rounded hover:bg-brand-light text-text-muted hover:text-brand transition-colors"
                          title="Edit project"
                        >
                          <Edit2 size={13} />
                        </button>
                      )}
                      {userCanDelete ? (
                        <button
                          onClick={() => setDeleteTarget(project)}
                          className="p-1.5 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors"
                          title="Delete project"
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : (
                        // Show disabled delete for managers who don't own this project
                        role === "MANAGER" && (
                          <button
                            disabled
                            className="p-1.5 rounded text-text-muted/30 cursor-not-allowed"
                            title="Only the project owner or admin can delete this project"
                          >
                            <Trash2 size={13} />
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <CheckSquare size={12} />
                      {projectTasks.length} tasks
                    </span>
                    <span className="flex items-center gap-1 text-status-completed">
                      <CheckSquare size={12} />
                      {completed} done
                    </span>
                  </div>

                  {/* Progress bar */}
                  {projectTasks.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] text-text-muted">Progress</span>
                        <span className="text-[10px] font-medium text-text-primary">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-5 py-3 border-t border-border flex items-center justify-between">
                  <Link href={`/projects/${project.id}`} className="text-xs text-brand hover:underline font-medium">
                    View project →
                  </Link>
                  <Link href={`/chat?project=${project.id}`} className="flex items-center gap-1 text-xs text-text-muted hover:text-brand transition-colors">
                    <MessageSquare size={12} />
                    Chat
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modals */}
      {showCreate && <ProjectFormModal open={showCreate} onClose={() => setShowCreate(false)} />}
      {editProject && <ProjectFormModal open={!!editProject} onClose={() => setEditProject(null)} project={editProject} />}

      {/* Safe delete confirmation */}
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
