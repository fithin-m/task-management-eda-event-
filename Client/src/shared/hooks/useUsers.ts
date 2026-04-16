import { useEffect } from "react";
import { useUserStore } from "@/store/userStore";

export function useUsers() {
  const { users, managers, loading, error, fetchUsers, fetchManagers } =
    useUserStore();

  useEffect(() => {
    if (users.length === 0 && !loading) fetchUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { users, managers, loading, error, fetchUsers, fetchManagers };
}
