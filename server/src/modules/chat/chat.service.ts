
import { chatRepository } from "./chat.repository";

export const chatService = {
  async isProjectMember(userId: string, projectId: string) {
    return chatRepository.checkMembership(userId, projectId);
  },

  async createMessage(data: {
    projectId: string;
    senderId: string;
    content: string;
  }) {
    return chatRepository.saveMessage(data);
  },

  async getProjectMessages(projectId: string) {
    return chatRepository.getMessages(projectId);
  },
};