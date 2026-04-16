"use client";
import { use } from "react";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { ProjectDetail } from "@/modules/project/components/ProjectDetail";

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <AppLayout title="Project" subtitle="Manage tasks and team members">
      <ProjectDetail projectId={id} />
    </AppLayout>
  );
}
