import prisma from "../../../core/database/prisma";
import type { TaskStatus, Priority } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { notificationEmitter } from "../../notification/notification.emitter";

type PublicUser = { id: string; name: string; email: string };

type TaskDto = {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  status: TaskStatus;
  priority: Priority;
  deadline: Date | null;
  createdAt: Date;
  updatedAt: Date;
  assignedTo: PublicUser;
  assignedBy: PublicUser;
};

export class TaskService {
  private getActorId(actor: any): string {
    return String(actor?.userId ?? actor?.id ?? "");
  }

  private toTaskDto(task: any): TaskDto {
    if (!task?.assignee || !task?.creator) {
      throw new Error("Task is missing required relations (assignee/creator)");
    }
    return {
      id:          task.id,
      title:       task.title,
      description: task.description ?? null,
      projectId:   task.projectId,
      status:      task.status,
      priority:    task.priority,
      deadline:    task.deadline ?? null,
      createdAt:   task.createdAt,
      updatedAt:   task.updatedAt,
      assignedTo:  task.assignee,
      assignedBy:  task.creator,
    };
  }

  private taskInclude() {
    return {
      assignee: { select: { id: true, name: true, email: true } },
      creator:  { select: { id: true, name: true, email: true } },
    } as const;
  }

  private async requireTaskAccess(taskId: string, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw new Error("Task not found");

    if (actor.role === "ADMIN") return task;
    if (actor.role === "MANAGER" && task.project?.createdBy === actorId) return task;
    if (task.assignedTo === actorId) return task;

    throw new Error("Not authorized to access this task");
  }

  private async requireTaskManage(taskId: string, actor: any) {
    const actorId = this.getActorId(actor);
    const task = await this.requireTaskAccess(taskId, actor);

    if (actor.role === "ADMIN") return task;
    if (actor.role === "MANAGER" && task.project?.createdBy === actorId) return task;

    throw new Error("Not authorized to manage this task");
  }

  // ── CRUD ───────────────────────────────────────────────────────────────────

  async createTask(data: any, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const { title, description, projectId, assignedTo, priority, deadline } = data;

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    if (actor.role !== "ADMIN" && project.createdBy !== actorId) {
      throw new Error("Not authorized to create tasks in this project");
    }

    const assignee = await prisma.user.findUnique({ where: { id: assignedTo } });
    if (!assignee) throw new Error("Assigned user not found");

    const member = await prisma.projectMember.findFirst({
      where: { projectId, userId: assignedTo },
    });
    if (!member) throw new Error("Assigned user is not a member of this project");

    const task = await prisma.task.create({
      data: {
        title,
        description: description ?? null,
        projectId,
        assignedTo,
        createdBy:   actorId,
        status:      "TODO",
        priority:    priority ?? "MEDIUM",
        deadline:    deadline ? new Date(deadline) : null,
      },
      include: this.taskInclude(),
    });

    // ── Notify assignee ────────────────────────────────────────────────────
    const actorUser = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    });
    notificationEmitter
      .send({
        userId:    assignedTo,
        type:      "TASK_ASSIGNED",
        message:   `Task "${title}" has been assigned to you by ${actorUser?.name ?? "someone"}`,
        taskId:    task.id,
        projectId: projectId,
        actorId:   actorId,
      })
      .catch((e) => console.error("notification failed:", e));

    return this.toTaskDto(task);
  }

  async getTasks(
    actor: any,
    query?: {
      q?: string;
      status?: string;
      priority?: string;
      assignedTo?: string;
      projectId?: string;
    },
  ) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const where: Prisma.TaskWhereInput = {};

    if (actor.role === "MANAGER") {
      where.project = { createdBy: actorId };
    } else if (actor.role === "USER") {
      where.assignedTo = actorId;
    }

    if (query?.projectId) where.projectId = String(query.projectId);
    if (query?.assignedTo) where.assignedTo = String(query.assignedTo);
    if (query?.status)   where.status   = query.status   as TaskStatus;
    if (query?.priority) where.priority = query.priority as Priority;

    const q = (query?.q ?? "").trim();
    if (q) {
      where.OR = [
        { title:       { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: this.taskInclude(),
      orderBy: { createdAt: "desc" },
    });

    return tasks.map((t) => this.toTaskDto(t));
  }

  async updateStatus(taskId: string, status: TaskStatus, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");

    if (actor.role === "USER" && task.assignedTo !== actorId) {
      throw new Error("You can only update the status of tasks assigned to you");
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { status },
      include: this.taskInclude(),
    });

    return this.toTaskDto(updated);
  }

  async assignTask(taskId: string, userId: string, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new Error("Task not found");

    const project = await prisma.project.findUnique({ where: { id: task.projectId } });
    if (!project) throw new Error("Project not found");

    if (actor.role !== "ADMIN" && project.createdBy !== actorId) {
      throw new Error("Not authorized to assign tasks in this project");
    }

    const member = await prisma.projectMember.findFirst({
      where: { projectId: task.projectId, userId },
    });
    if (!member) throw new Error("User is not a member of this project");

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: { assignedTo: userId },
      include: this.taskInclude(),
    });

    // ── Notify new assignee ────────────────────────────────────────────────
    const actorUser = await prisma.user.findUnique({
      where: { id: actorId },
      select: { name: true },
    });
    notificationEmitter
      .send({
        userId:    userId,
        type:      "TASK_ASSIGNED",
        message:   `Task "${task.title}" has been assigned to you by ${actorUser?.name ?? "someone"}`,
        taskId:    task.id,
        projectId: task.projectId,
        actorId:   actorId,
      })
      .catch((e) => console.error("notification failed:", e));

    return this.toTaskDto(updated);
  }

  async deleteTask(taskId: string, actor: any) {
    const actorId = this.getActorId(actor);
    const task = await this.requireTaskManage(taskId, actor);

    // ── Notify assignee before deletion ───────────────────────────────────
    if (task.assignedTo && task.assignedTo !== actorId) {
      notificationEmitter
        .send({
          userId:    task.assignedTo,
          type:      "TASK_DELETED",
          message:   `Task "${task.title}" has been deleted`,
          projectId: task.projectId,
          actorId:   actorId,
        })
        .catch((e) => console.error("notification failed:", e));
    }

    await prisma.task.delete({ where: { id: taskId } });
  }

  async updateTask(
    taskId: string,
    data: {
      title?: unknown;
      description?: unknown;
      priority?: unknown;
      deadline?: unknown;
    },
    actor: any,
  ) {
    const actorId = this.getActorId(actor);
    const task = await this.requireTaskManage(taskId, actor);

    const patch: Prisma.TaskUpdateInput = {};
    if (data.title       !== undefined) patch.title       = String(data.title);
    if (data.description !== undefined) patch.description = data.description ? String(data.description) : null;
    if (data.priority    !== undefined) patch.priority    = data.priority as Priority;
    if (data.deadline    !== undefined) {
      patch.deadline = data.deadline ? new Date(String(data.deadline)) : null;
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: patch,
      include: this.taskInclude(),
    });

    // ── Notify assignee of update (skip if actor is the assignee) ─────────
    if (task.assignedTo && task.assignedTo !== actorId) {
      notificationEmitter
        .send({
          userId:    task.assignedTo,
          type:      "TASK_UPDATED",
          message:   `Task "${updated.title}" has been updated`,
          taskId:    task.id,
          projectId: task.projectId,
          actorId:   actorId,
        })
        .catch((e) => console.error("notification failed:", e));
    }

    return this.toTaskDto(updated);
  }

  // ── Comments ───────────────────────────────────────────────────────────────

  async getComments(taskId: string, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw new Error("Task not found");

    const isAdmin    = actor.role === "ADMIN";
    const isManager  = actor.role === "MANAGER" && task.project?.createdBy === actorId;
    const isAssignee = task.assignedTo === actorId;

    if (!isAdmin && !isManager && !isAssignee) {
      throw new Error("Not authorized to view comments on this task");
    }

    return prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true } } },
      orderBy: { createdAt: "asc" },
    });
  }

  async addComment(taskId: string, data: { content: string }, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const content = String(data?.content ?? "").trim();
    if (!content) throw new Error("Comment content cannot be empty");

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: { project: true },
    });
    if (!task) throw new Error("Task not found");

    const isAdmin    = actor.role === "ADMIN";
    const isManager  = actor.role === "MANAGER" && task.project?.createdBy === actorId;
    const isAssignee = task.assignedTo === actorId;

    if (!isAdmin && !isManager && !isAssignee) {
      throw new Error("Not authorized to comment on this task");
    }

    return prisma.comment.create({
      data: { taskId, userId: actorId, content },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
  }
}
