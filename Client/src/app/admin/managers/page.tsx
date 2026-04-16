"use client";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { UserList } from "@/modules/user/components/UserList";

export default function ManagersPage() {
  return (
    <AppLayout title="Managers" subtitle="Create and manage team managers">
      <UserList />
    </AppLayout>
  );
}
