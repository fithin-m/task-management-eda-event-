"use client";
import { useEffect, useState, useMemo } from "react";
import { useProjectStore } from "@/store/projectStore";
import { useTaskStore } from "@/store/taskStore";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { projectService } from "@/services/project.service";
import { TaskList } from "@/modules/task/components/TaskList";
import { TaskFormModal } from "@/modules/task/components/TaskFormModal";
import { Button } from "@/shared/components/Button";
import { Avatar } from "@/shared/components/Avatar";
import { ErrorState } from "@/shared/components/ErrorState";
import { Plus, UserPlus, MessageSquare, AlertCircle } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { canAddMember, canCreateTask, canEditProject } from "@/shared/utils/rbac";
import { getProjectColor, getInitials } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";
import Link from "next/link";
import toast from "react-hot-toast";

interface ProjectDetailProps {
  projectId: string;
}

export function ProjectDetail({ projectId }: ProjectDetailProps) {
  const { projects, fetchProjects } = useProjectStore();
  const { fetchTasks } = useTaskStore();
  const { users, fetchUsers } = useUserStore();
  const { role, user: currentUser } = useAuthStore();

  const [showAddMember, setShowAddMember] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState("");

  const project = projects.find((p) => p.id === projectId);
  const projectIndex = projects.findIndex((p) => p.id === projectId);

  useEffect(() => {
    fetchProjects();
    fetchTasks({ projectId });
    fetchUsers();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const userId = currentUser?.id ?? "";

  // Only regular users can be added as members (not admins, not managers)
  // This prevents managers from accidentally adding admins to projects
  const addableUsers = useMemo(
    () => users.filter((u) => u.role === "USER"),
    [users]
  );

  const handleMemberSelect = (uid: string) => {
    setMemberError("");
    const selected = users.find((u) => u.id === uid);
    if (selected && selected.role !== "USER") {
      setMemberError("Only users (not admins or managers) can be added as project members.");
      return;
    }
    setSelectedUserId(uid);
  };

  const handleAddMember = async () => {
    if (!selectedUserId) return;
    if (memberError) { toast.error(memberError); return; }

    setAddingMember(true);
    try {
      await projectService.addMember(projectId, selectedUserId);
      toast.success("Member added to project");
      fetchProjects(); // refresh member list
      setShowAddMember(false);
      setSelectedUserId("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to add member");
    } finally {
      setAddingMember(false);
    }
  };

  if (!project) return <ErrorState message="Project not found" />;

  const userCanAddMember = canAddMember(role, userId, project);
  const userCanCreateTask = canCreateTask(role);

  return (
    <div className="space-y-6">
      {/* ── Project header ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg border border-border p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-base flex-shrink-0",
              getProjectColor(projectIndex)
            )}>
              {getInitials(project.name)}
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-text-primary truncate">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-text-secondary mt-0.5">{project.description}</p>
              )}
              <p className="text-xs text-text-muted mt-1">
                Created by {project.createdBy === userId ? "you" : "another manager"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <Link href={`/chat?project=${projectId}`}>
              <Button variant="outline" size="sm" icon={<MessageSquare size={14} />}>
                Chat
              </Button>
            </Link>

            {/* Add member — only if user has permission */}
            {userCanAddMember && (
              <Button
                variant="outline"
                size="sm"
                icon={<UserPlus size={14} />}
                onClick={() => setShowAddMember(true)}
              >
                Add Member
              </Button>
            )}

            {/* New task — only admin/manager */}
            {userCanCreateTask && (
              <Button
                size="sm"
                icon={<Plus size={14} />}
                onClick={() => setShowCreateTask(true)}
              >
                New Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Task list ───────────────────────────────────────────────────── */}
      <TaskList />

      {/* ── Add member modal ────────────────────────────────────────────── */}
      <Modal
        open={showAddMember}
        onClose={() => { setShowAddMember(false); setMemberError(""); setSelectedUserId(""); }}
        title="Add Member"
      >
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-primary">
              Select user
              <span className="ml-1 text-text-muted font-normal">(users only)</span>
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => handleMemberSelect(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="">Choose a user...</option>
              {addableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
            {memberError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={12} />
                {memberError}
              </div>
            )}
            {addableUsers.length === 0 && (
              <p className="text-xs text-text-muted">No users available to add.</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowAddMember(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddMember}
              loading={addingMember}
              disabled={!selectedUserId || !!memberError}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── Create task modal ───────────────────────────────────────────── */}
      {showCreateTask && (
        <TaskFormModal
          open={showCreateTask}
          onClose={() => setShowCreateTask(false)}
          defaultProjectId={projectId}
        />
      )}
    </div>
  );
}
