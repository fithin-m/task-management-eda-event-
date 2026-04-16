import { useEffect } from "react";
import { useProjectStore } from "@/store/projectStore";

export function useProjects() {
  const { projects, loading, error, fetchProjects } = useProjectStore();

  useEffect(() => {
    if (projects.length === 0 && !loading) {
      fetchProjects();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { projects, loading, error, refetch: fetchProjects };
}
