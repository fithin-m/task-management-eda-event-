import prisma from "../../../core/database/prisma";
import { Role } from "@prisma/client";
import { notificationEmitter } from "../../notification/notification.emitter";

export class ProjectService {
  private getActorId(actor: any): string {
    return String(actor?.userId ?? actor?.id ?? "");
  }

  async createProject(data: any, actor: any) {
    const actorId = this.getActorId(actor);
    if (!actorId) throw new Error("Unauthorized");

    const name = String(data.name || "").trim();
    if (!name) throw new Error("Project name required");

    let deadline: Date | null = null;
    if (data.deadline) {
      const d = new Date(data.deadline);
      if (isNaN(d.getTime())) throw new Error("Invalid deadline");
      deadline = d;
    }

    let managerId: string | null = null;

    if (actor.role === "ADMIN" && data.managerId) {
      const manager = await prisma.user.findUnique({
        where: { id: data.managerId },
        select: { id: true, role: true },
      });

      if (!manager || manager.role !== "MANAGER") {
        throw new Error("Invalid manager");
      }

      managerId = manager.id;
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: data.description?.trim() || null,
        createdBy: actorId,
        deadline,
      },
    });

    if (actor.role === "MANAGER") {
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: actorId, role: "MANAGER" },
      });
    }

    if (managerId) {
      await prisma.projectMember.create({
        data: { projectId: project.id, userId: managerId, role: "MANAGER" },
      });
    }

    if (managerId) {
      await notificationEmitter.send({
        userId: managerId,
        type: "PROJECT_ASSIGNED",
        message: `Project "${project.name}" assigned to you`,
        projectId: project.id,
        actorId,
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

    // 1. Check project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error("Project not found");
    }

    // 2. Authorization
    if (actor.role !== "ADMIN" && project.createdBy !== actorId) {
      throw new Error("Not authorized");
    }

    // 3. Validation
    if (data.name !== undefined && !String(data.name).trim()) {
      throw new Error("Project name cannot be empty");
    }

    if (data.deadline !== undefined && data.deadline) {
      const d = new Date(data.deadline);
      if (isNaN(d.getTime())) {
        throw new Error("Invalid deadline");
      }
    }

    // 4. Update directly
    return prisma.project.update({
      where: { id: projectId },
      data: {
        name: data.name?.trim(),
        description: data.description?.trim() || null,
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });
  }

  async deleteProject(projectId: string, actor: any) {
    const actorId = this.getActorId(actor);

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, createdBy: true }
    });

    if (!project) {
      throw new Error("Project not found");
    }

    if (actor.role !== "ADMIN" && project.createdBy !== actorId) {
      throw new Error("Not authorized");
    }

    return prisma.project.delete({
      where: { id: projectId },
    });
  }

  async addMember(projectId: string, userId: string, actor: any) {
    const actorId = this.getActorId(actor);
    const userIdTrimmed = String(userId).trim();

    if (!userIdTrimmed) throw new Error("User ID is required");

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) throw new Error("Project not found");


    if (userIdTrimmed === project.createdBy) {
      throw new Error("Project owner is already part of the project");
    }

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

    // Check if user exists before adding
    const user = await prisma.user.findUnique({ where: { id: userIdTrimmed } });
    if (!user) throw new Error("User not found");
    if (!user.isActive) throw new Error("Cannot add inactive user to project");

    try {
      const member = await prisma.projectMember.create({
        data: { projectId, userId: userIdTrimmed, role: "MEMBER" },
      });

      // ── Notify the added user ──────────────────────────────────────────────
      await notificationEmitter.send({
        userId: userIdTrimmed,
        type: "PROJECT_ASSIGNED",
        message: `You have been added to project "${project.name}"`,
        projectId: project.id,
        actorId: actorId,
      });

      return member;
    } catch (error: any) {
      // Handle unique constraint violation (Prisma error code P2002)
      if (error.code === 'P2002') {
        throw new Error("User already in project");
      }
      throw error;
    }
  }
}
