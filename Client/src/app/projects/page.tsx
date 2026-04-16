"use client";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { ProjectList } from "@/modules/project/components/ProjectList";

export default function ProjectsPage() {
  return (
    <AppLayout title="Projects" subtitle="All your projects in one place">
      <ProjectList />
    </AppLayout>
  );
}
