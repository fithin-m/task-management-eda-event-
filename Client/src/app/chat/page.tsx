"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { ChatPanel } from "@/modules/chat/components/ChatPanel";
import { useProjectStore } from "@/store/projectStore";
import { useEffect } from "react";

function ChatContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project") ?? undefined;
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatPanel defaultProjectId={projectId} />
    </div>
  );
}

export default function ChatPage() {
  return (
    <AppLayout title="Message" subtitle="Real-time project chat">
      <Suspense fallback={<div className="h-96 bg-white rounded-lg border border-border animate-pulse" />}>
        <ChatContent />
      </Suspense>
    </AppLayout>
  );
}
