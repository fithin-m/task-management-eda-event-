"use client";
import { AppLayout } from "@/modules/shared/components/AppLayout";
import { NotificationList } from "@/modules/notification/components/NotificationList";

export default function NotificationsPage() {
  return (
    <AppLayout
      title="Inbox"
      subtitle="Your notifications and updates"
    >
      <NotificationList />
    </AppLayout>
  );
}
