import type { Role, User, Project, Task } from "@/shared/types";

// ─── Can delete a project ─────────────────────────────────────────────────────
// Admin: can delete ANY project
// Manager: can delete ONLY projects they created
// User: never
export function canDeleteProject(role: Role | null, userId: string, project: Project): boolean {
  if (role === "ADMIN") return true;
  if (role === "MANAGER") return project.createdBy === userId;
  return false;
}

// ─── Can delete a task ────────────────────────────────────────────────────────
// Admin: can delete ANY task
// Manager: can delete tasks in their projects only
// User: never
export function canDeleteTask(role: Role | null, userId: string, task: Task, projects: Project[]): boolean {
  if (role === "ADMIN") return true;
  if (role === "MANAGER") {
    const project = projects.find((p) => p.id === task.projectId);
    return project?.createdBy === userId;
  }
  return false;
}

// ─── Can manage (create/edit) tasks in a project ─────────────────────────────
export function canManageTasksInProject(role: Role | null, userId: string, project: Project): boolean {
  if (role === "ADMIN") return true;
  if (role === "MANAGER") return project.createdBy === userId;
  return false;
}

// ─── Filter assignable users for task assignment ──────────────────────────────
// Admin: can assign to anyone (including self)
// Manager: can assign ONLY to users with role=USER (NOT admin, NOT managers)
export function filterAssignableUsers(role: Role | null, users: User[]): User[] {
  if (role === "ADMIN") return users; // admin sees all
  if (role === "MANAGER") return users.filter((u) => u.role === "USER");
  return [];
}

// ─── Can update task status ───────────────────────────────────────────────────
// Only the assigned user can update status
// Admin/Manager can also update status
export function canUpdateStatus(role: Role | null, userId: string, task: Task): boolean {
  if (role === "ADMIN" || role === "MANAGER") return true;
  return task.assignedTo.id === userId;
}

// ─── Can edit a project ───────────────────────────────────────────────────────
export function canEditProject(role: Role | null, userId: string, project: Project): boolean {
  if (role === "ADMIN") return true;
  if (role === "MANAGER") return project.createdBy === userId;
  return false;
}

// ─── Can add members to a project ────────────────────────────────────────────
export function canAddMember(role: Role | null, userId: string, project: Project): boolean {
  if (role === "ADMIN") return true;
  if (role === "MANAGER") return project.createdBy === userId;
  return false;
}

// ─── Can create tasks ─────────────────────────────────────────────────────────
export function canCreateTask(role: Role | null): boolean {
  return role === "ADMIN" || role === "MANAGER";
}

// ─── Can create projects ──────────────────────────────────────────────────────
export function canCreateProject(role: Role | null): boolean {
  return role === "ADMIN" || role === "MANAGER";
}
