"use client";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { TaskList } from "@/modules/task/components/TaskList";
import { useProjectStore } from "@/store/projectStore";
import { useEffect } from "react";

export default function TasksPage() {
  const { fetchProjects } = useProjectStore();

  useEffect(() => {
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AppLayout title="My Tasks" subtitle="All tasks assigned to you">
      <TaskList />
    </AppLayout>
  );
}
