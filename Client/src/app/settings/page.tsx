"use client";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/shared/components/Avatar";
import { RoleBadge } from "@/shared/components/Badge";

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <AppLayout title="Settings" subtitle="Your account settings">
      <div className="max-w-lg">
        <div className="bg-white rounded-lg border border-border p-6 space-y-4">
          <h2 className="text-sm font-semibold text-text-primary">Profile</h2>
          {user && (
            <div className="flex items-center gap-4">
              <Avatar name={user.name} size="lg" />
              <div>
                <p className="text-base font-semibold text-text-primary">{user.name}</p>
                <p className="text-sm text-text-secondary">{user.email}</p>
                <div className="mt-1">
                  <RoleBadge role={user.role} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
