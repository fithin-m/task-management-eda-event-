"use client";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { UserList } from "@/modules/user/components/UserList";

export default function UsersPage() {
  return (
    <AppLayout title="People" subtitle="Team members and managers">
      <UserList />
    </AppLayout>
  );
}
