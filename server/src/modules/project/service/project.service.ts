import prisma from "../../../core/database/prisma";
import { Role } from "@prisma/client";
import { notificationEmitter } from "../../notification/notification.emitter";

export class ProjectService {
  private getActorId(actor: any): string {
    return String(actor?.userId ?? actor?.id ?? "");
  }

  async createProject(data: any, actor: any) {
    if (!data.name) throw new Error("Project name required");
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const managerId =
      actor.role === "ADMIN" && data.managerId ? String(data.managerId) : null;
    const manager =
      managerId && actor.role === "ADMIN"
        ? await prisma.user.findUnique({ where: { id: managerId } })
        : null;

    if (managerId && (!manager || manager.role !== Role.MANAGER)) {
      throw new Error("Invalid manager");
    }

    const [project] = await prisma.$transaction(async (tx) => {
      const created = await tx.project.create({
        data: {
          name:        data.name,
          description: data.description ?? null,
          createdBy:   actorId,
          deadline:    data.deadline ? new Date(data.deadline) : null,
        },
      });

      if (actor.role === "MANAGER") {
        await tx.projectMember.create({
          data: { projectId: created.id, userId: actorId, role: "MANAGER" },
        });
      }

      if (manager) {
        await tx.projectMember.create({
          data: { projectId: created.id, userId: manager.id, role: "MANAGER" },
        });
      }

      return [created] as const;
    });

    // ── Notify assigned manager (if admin created and assigned one) ────────
    if (manager) {
      await notificationEmitter.send({
        userId:    manager.id,
        type:      "PROJECT_ASSIGNED",
        message:   `Project "${project.name}" has been assigned to you by Admin`,
        projectId: project.id,
        actorId:   actorId,
      });
    }

    return project;
  }

  async getProjects(actor: any) {
    const actorId = this.getActorId(actor);

    if (actor.role === "ADMIN") {
      return prisma.project.findMany({ orderBy: { createdAt: "desc" } });
    }

    if (actor.role === "MANAGER") {
      return prisma.project.findMany({
        where: {
          OR: [
            { createdBy: actorId },
            { members: { some: { userId: actorId } } },
          ],
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return prisma.project.findMany({
      where: { members: { some: { userId: actorId } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async updateProject(projectId: string, data: any, actor: any) {
    const actorId = this.getActorId(actor);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    if (actor.role !== "ADMIN" && project.createdBy !== actorId) {
      throw new Error("Not authorized to update this project");
    }

    return prisma.project.update({
      where: { id: projectId },
      data: {
        name:        data.name        ?? undefined,
        description: data.description ?? undefined,
        deadline:    data.deadline ? new Date(data.deadline) : undefined,
      },
    });
  }

  async deleteProject(projectId: string, actor: any) {
    const actorId = this.getActorId(actor);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    if (actor.role !== "ADMIN" && project.createdBy !== actorId) {
      throw new Error("Not authorized to delete this project");
    }

    await prisma.project.delete({ where: { id: projectId } });
  }

  async addMember(projectId: string, userId: string, actor: any) {
    const actorId = this.getActorId(actor);

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");

    const isManagerOnProject =
      actor.role === "MANAGER"
        ? Boolean(
            await prisma.projectMember.findFirst({
              where: { projectId, userId: actorId, role: "MANAGER" },
            }),
          )
        : false;

    if (actor.role !== "ADMIN" && project.createdBy !== actorId && !isManagerOnProject) {
      throw new Error("Not authorized");
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("User not found");

    const existing = await prisma.projectMember.findFirst({ where: { projectId, userId } });
    if (existing) throw new Error("User already in project");

    const member = await prisma.projectMember.create({
      data: { projectId, userId, role: "MEMBER" },
    });

    // ── Notify the added user ──────────────────────────────────────────────
    await notificationEmitter.send({
      userId,
      type:      "PROJECT_ASSIGNED",
      message:   `You have been added to project "${project.name}"`,
      projectId: project.id,
      actorId:   actorId,
    });

    return member;
  }
}
