import { useEffect } from "react";
import { useTaskStore } from "@/store/taskStore";
import type { TaskQuery } from "@/shared/types";

export function useTasks(query?: TaskQuery) {
  const { tasks, loading, error, fetchTasks } = useTaskStore();

  useEffect(() => {
    fetchTasks(query);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { tasks, loading, error, refetch: () => fetchTasks(query) };
}
