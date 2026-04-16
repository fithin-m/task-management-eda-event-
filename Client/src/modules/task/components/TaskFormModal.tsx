"use client";
import { useState, useEffect, useMemo } from "react";
import { AlertCircle } from "lucide-react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { Input, Textarea, Select } from "@/shared/components/Input";
import { Avatar } from "@/shared/components/Avatar";
import { useTaskStore } from "@/store/taskStore";
import { useProjectStore } from "@/store/projectStore";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { taskService } from "@/services/task.service";
import { filterAssignableUsers } from "@/shared/utils/rbac";
import type { Task, User } from "@/shared/types";
import toast from "react-hot-toast";

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  task?: Task;
  defaultProjectId?: string;
}

export function TaskFormModal({ open, onClose, task, defaultProjectId }: TaskFormModalProps) {
  const { addTask, updateTask } = useTaskStore();
  const { projects } = useProjectStore();
  const { users, fetchUsers } = useUserStore();
  const { role, user: currentUser } = useAuthStore();

  const [form, setForm] = useState({
    title: task?.title ?? "",
    description: task?.description ?? "",
    projectId: task?.projectId ?? defaultProjectId ?? "",
    assignedTo: task?.assignedTo?.id ?? "",
    priority: task?.priority ?? "MEDIUM",
    deadline: task?.deadline ? task.deadline.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const [assigneeError, setAssigneeError] = useState("");

  useEffect(() => {
    if (users.length === 0) fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── RBAC: filter assignable users ──────────────────────────────────────────
  // Admin → all users (including self)
  // Manager → only role=USER (no admins, no other managers)
  const assignableUsers = useMemo(
    () => filterAssignableUsers(role, users),
    [role, users]
  );

  // Validate assignee on selection
  const handleAssigneeChange = (userId: string) => {
    setAssigneeError("");
    if (!userId) {
      setForm((f) => ({ ...f, assignedTo: "" }));
      return;
    }
    const selected = users.find((u) => u.id === userId);
    if (!selected) return;

    // Manager cannot assign to admin or other managers
    if (role === "MANAGER" && selected.role !== "USER") {
      setAssigneeError("Managers can only assign tasks to users (not admins or other managers).");
      return;
    }
    setForm((f) => ({ ...f, assignedTo: userId }));
  };

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.title.trim()) { toast.error("Task title is required"); return; }
    if (!task && !form.projectId) { toast.error("Please select a project"); return; }
    if (!task && !form.assignedTo) { toast.error("Please select an assignee"); return; }
    if (assigneeError) { toast.error(assigneeError); return; }

    // Final RBAC check before submit
    if (!task && role === "MANAGER") {
      const assignee = users.find((u) => u.id === form.assignedTo);
      if (assignee && assignee.role !== "USER") {
        toast.error("You can only assign tasks to users.");
        return;
      }
    }

    setLoading(true);
    try {
      if (task) {
        const updated = await taskService.updateTask(task.id, {
          title: form.title,
          description: form.description || undefined,
          priority: form.priority,
          deadline: form.deadline || undefined,
        });
        updateTask(updated);
        toast.success("Task updated");
      } else {
        const created = await taskService.createTask({
          title: form.title,
          description: form.description || undefined,
          projectId: form.projectId,
          assignedTo: form.assignedTo,
          priority: form.priority,
          deadline: form.deadline || undefined,
        });
        addTask(created);
        toast.success("Task created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? "Edit Task" : "Create Task"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title *"
          placeholder="Task title"
          value={form.title}
          onChange={set("title")}
        />
        <Textarea
          label="Description"
          placeholder="Describe the task..."
          value={form.description}
          onChange={set("description")}
          rows={3}
        />

        {/* Project selector — only on create */}
        {!task && (
          <Select
            label="Project *"
            value={form.projectId}
            onChange={set("projectId")}
            options={[
              { value: "", label: "Select project..." },
              ...projects.map((p) => ({ value: p.id, label: p.name })),
            ]}
          />
        )}

        {/* Assignee — only on create, with RBAC filtering */}
        {!task && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-text-primary">
              Assign to *
              {role === "MANAGER" && (
                <span className="ml-1 text-text-muted font-normal">(users only)</span>
              )}
            </label>
            <select
              value={form.assignedTo}
              onChange={(e) => handleAssigneeChange(e.target.value)}
              className="w-full h-9 rounded-md border border-border bg-white px-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
            >
              <option value="">Select user...</option>
              {assignableUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.email}
                </option>
              ))}
            </select>
            {assigneeError && (
              <div className="flex items-center gap-1.5 text-xs text-red-600">
                <AlertCircle size={12} />
                {assigneeError}
              </div>
            )}
            {assignableUsers.length === 0 && (
              <p className="text-xs text-text-muted">
                No assignable users found. Add users to the project first.
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Priority"
            value={form.priority}
            onChange={set("priority")}
            options={[
              { value: "LOW", label: "Low" },
              { value: "MEDIUM", label: "Medium" },
              { value: "HIGH", label: "High" },
            ]}
          />
          <Input
            label="Deadline"
            type="date"
            value={form.deadline}
            onChange={set("deadline")}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {task ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
