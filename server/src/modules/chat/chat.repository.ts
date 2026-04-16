import prisma from "../../core/database/prisma";

export const chatRepository = {
  async checkMembership(userId: string, projectId: string) {
    const member = await prisma.projectMember.findFirst({
      where: { userId, projectId },
    });

    if (member) return true;

    const created = await prisma.project.findFirst({
      where: { id: projectId, createdBy: userId },
      select: { id: true },
    });

    return Boolean(created);
  },

  async saveMessage({
    projectId,
    senderId,
    content,
  }: {
    projectId: string;
    senderId: string;
    content: string;
  }) {
    return prisma.message.create({
      data: {
        projectId,
        senderId,
        content,
      },
      include: {
        sender: true,
      },
    });
  },

  async getMessages(projectId: string) {
    return prisma.message.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      include: { sender: true },
    });
  },
};