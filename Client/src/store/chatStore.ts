import { create } from "zustand";
import type { Message } from "@/shared/types";

interface ChatState {
  messages: Record<string, Message[]>; // projectId → messages
  activeProjectId: string | null;
  setActiveProject: (projectId: string) => void;
  setMessages: (projectId: string, messages: Message[]) => void;
  addMessage: (projectId: string, message: Message) => void;
  reset: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: {},
  activeProjectId: null,

  setActiveProject: (projectId) => set({ activeProjectId: projectId }),

  setMessages: (projectId, messages) =>
    set((s) => ({ messages: { ...s.messages, [projectId]: messages } })),

  addMessage: (projectId, message) =>
    set((s) => ({
      messages: {
        ...s.messages,
        [projectId]: [...(s.messages[projectId] ?? []), message],
      },
    })),

  reset: () => set({ messages: {}, activeProjectId: null }),
}));
