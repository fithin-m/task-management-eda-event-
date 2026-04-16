"use client";
import { useState, useEffect } from "react";
import { Modal } from "@/shared/components/Modal";
import { Button } from "@/shared/components/Button";
import { Input, Textarea, Select } from "@/shared/components/Input";
import { useProjectStore } from "@/store/projectStore";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { projectService } from "@/services/project.service";
import type { Project } from "@/shared/types";
import toast from "react-hot-toast";

interface ProjectFormModalProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
}

export function ProjectFormModal({ open, onClose, project }: ProjectFormModalProps) {
  const { addProject, updateProject } = useProjectStore();
  const { managers, fetchManagers } = useUserStore();
  const { role } = useAuthStore();

  const [form, setForm] = useState({
    name: project?.name ?? "",
    description: project?.description ?? "",
    managerId: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (role === "ADMIN" && managers.length === 0) fetchManagers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name.trim()) { toast.error("Project name is required"); return; }
    setLoading(true);
    try {
      if (project) {
        const updated = await projectService.updateProject(project.id, {
          name: form.name,
          description: form.description,
        });
        updateProject(updated);
        toast.success("Project updated");
      } else {
        const created = await projectService.createProject({
          name: form.name,
          description: form.description,
          managerId: form.managerId || undefined,
        });
        addProject(created);
        toast.success("Project created");
      }
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to save project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={project ? "Edit Project" : "New Project"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Project name *" placeholder="e.g. Website Redesign" value={form.name} onChange={set("name")} />
        <Textarea label="Description" placeholder="What is this project about?" value={form.description} onChange={set("description")} rows={3} />
        {!project && role === "ADMIN" && managers.length > 0 && (
          <Select
            label="Assign Manager (optional)"
            value={form.managerId}
            onChange={set("managerId")}
            options={[
              { value: "", label: "No manager" },
              ...managers.map((m) => ({ value: m.id, label: m.name })),
            ]}
          />
        )}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" loading={loading}>{project ? "Save Changes" : "Create Project"}</Button>
        </div>
      </form>
    </Modal>
  );
}
