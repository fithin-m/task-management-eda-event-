"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { ManagerDashboard } from "@/modules/dashboard/components/ManagerDashboard";
import { UserDashboard } from "@/modules/dashboard/components/UserDashboard";
import { useProjectStore } from "@/store/projectStore";

export default function DashboardPage() {
  const { role, isAuthenticated } = useAuthStore();
  const { fetchProjects } = useProjectStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    fetchProjects();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AppLayout title="Home" subtitle="Monitor all of your projects and tasks here">
      {role === "MANAGER" ? <ManagerDashboard /> : <UserDashboard />}
    </AppLayout>
  );
}
