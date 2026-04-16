import prisma from "../../../core/database/prisma";

export class TaskRepository {
  async createTask(data: any) {
    return prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        assignedTo: data.assignedTo,
        createdBy: data.createdBy,
        priority: data.priority,
        deadline: data.deadline,
        status: "TODO"
      }
    });
  }
}