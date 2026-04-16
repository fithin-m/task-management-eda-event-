"use client";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { AdminDashboard } from "@/modules/dashboard/components/AdminDashboard";

export default function AdminPage() {
  const { role } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-bg-app flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Client-side role guard
  if (role !== "ADMIN") {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  return (
    <AppLayout title="Admin Dashboard" subtitle="System-wide overview of all projects, tasks and users">
      <AdminDashboard />
    </AppLayout>
  );
}
