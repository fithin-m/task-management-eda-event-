"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";

export default function RootPage() {
  const router = useRouter();
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    // Small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      if (isAuthenticated && role) {
        const dest = role === "ADMIN" ? "/admin" : "/dashboard";
        window.location.href = dest;
      } else {
        router.replace("/login");
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-3 border-brand border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}
