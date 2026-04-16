// ─── Enums ────────────────────────────────────────────────────────────────────
export type Role = "ADMIN" | "MANAGER" | "USER";
export type TaskStatus = "TODO" | "IN_PROGRESS" | "COMPLETED";
export type Priority = "LOW" | "MEDIUM" | "HIGH";
export type MemberRole = "MANAGER" | "MEMBER";
export type NotificationType =
  | "PROJECT_CREATED"
  | "PROJECT_ASSIGNED"
  | "TASK_ASSIGNED"
  | "TASK_UPDATED"
  | "TASK_DELETED"
  | "CHAT_MESSAGE"
  | "DEADLINE_REMINDER";

// ─── Models ───────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  members?: ProjectMember[];
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  role: MemberRole;
  joinedAt: string;
  user?: PublicUser;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo: PublicUser;
  assignedBy: PublicUser;
}

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  content: string;
  createdAt: string;
  user: PublicUser;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  taskId?: string | null;
  projectId?: string | null;
  actorId?: string | null;
  createdAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  createdAt: string;
  sender: User;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface AuthUser {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// ─── API Response ─────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export interface DashboardMetrics {
  totalProjects: number;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  overdueTasks: number;
  totalUsers?: number;
  totalManagers?: number;
}

// ─── Query Params ─────────────────────────────────────────────────────────────
export interface TaskQuery {
  q?: string;
  status?: TaskStatus;
  priority?: Priority;
  assignedTo?: string;
  projectId?: string;
}
