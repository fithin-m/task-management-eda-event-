"use client";
import { useState, useEffect, useRef } from "react";
import { Send, Hash } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useChatStore } from "@/store/chatStore";
import { useAuthStore } from "@/store/authStore";
import { useSocket } from "@/shared/hooks/useSocket";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { getProjectColor, getInitials, formatRelative } from "@/shared/utils/format";
import { cn } from "@/shared/utils/cn";

interface ChatPanelProps {
  defaultProjectId?: string;
}

export function ChatPanel({ defaultProjectId }: ChatPanelProps) {
  const { projects } = useProjectStore();
  const { messages, activeProjectId, setActiveProject } = useChatStore();
  const { user } = useAuthStore();
  const { joinProject, sendMessage } = useSocket();

  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const currentProjectId = activeProjectId ?? defaultProjectId ?? projects[0]?.id;
  const currentMessages = messages[currentProjectId ?? ""] ?? [];

  useEffect(() => {
    if (currentProjectId) {
      setActiveProject(currentProjectId);
      joinProject(currentProjectId);
    }
  }, [currentProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const handleSend = () => {
    if (!input.trim() || !currentProjectId) return;
    sendMessage(currentProjectId, input.trim());
    setInput("");
  };

  const currentProject = projects.find((p) => p.id === currentProjectId);

  return (
    <div className="flex h-full bg-white rounded-lg border border-border overflow-hidden">
      {/* Project list sidebar */}
      <div className="w-56 border-r border-border flex flex-col flex-shrink-0">
        <div className="px-4 py-3 border-b border-border">
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">Projects</p>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {projects.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-4">No projects</p>
          ) : (
            projects.map((project, i) => (
              <button
                key={project.id}
                onClick={() => setActiveProject(project.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-4 py-2.5 text-left transition-colors",
                  currentProjectId === project.id
                    ? "bg-brand-light text-brand"
                    : "text-text-secondary hover:bg-gray-50"
                )}
              >
                <div className={cn("w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0", getProjectColor(i))}>
                  {getInitials(project.name)}
                </div>
                <span className="text-sm truncate">{project.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Chat header */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
          <Hash size={16} className="text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">
            {currentProject?.name ?? "Select a project"}
          </span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {!currentProjectId ? (
            <EmptyState icon={<Hash size={32} />} title="Select a project" description="Choose a project from the left to start chatting." />
          ) : currentMessages.length === 0 ? (
            <EmptyState icon={<Send size={32} />} title="No messages yet" description="Be the first to send a message in this project." />
          ) : (
            currentMessages.map((msg) => {
              const isMe = msg.senderId === user?.id;
              return (
                <div key={msg.id} className={cn("flex gap-3", isMe && "flex-row-reverse")}>
                  <Avatar name={msg.sender?.name ?? "?"} size="sm" />
                  <div className={cn("max-w-[70%]", isMe && "items-end flex flex-col")}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-text-primary">{msg.sender?.name}</span>
                      <span className="text-[10px] text-text-muted">{formatRelative(msg.createdAt)}</span>
                    </div>
                    <div className={cn(
                      "px-3 py-2 rounded-lg text-sm",
                      isMe
                        ? "bg-brand text-white rounded-tr-none"
                        : "bg-gray-100 text-text-primary rounded-tl-none"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-4 border-t border-border">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={currentProject ? `Message #${currentProject.name}` : "Select a project first"}
              disabled={!currentProjectId}
              className="flex-1 h-10 px-4 rounded-lg border border-border bg-gray-50 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white disabled:opacity-50"
            />
            <Button
              size="icon"
              onClick={handleSend}
              disabled={!input.trim() || !currentProjectId}
              icon={<Send size={16} />}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
