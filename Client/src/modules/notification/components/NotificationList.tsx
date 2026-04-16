"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Filter } from "lucide-react";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/shared/components/Avatar";
import { Button } from "@/shared/components/Button";
import { EmptyState } from "@/shared/components/EmptyState";
import { formatRelative } from "@/shared/utils/format";
import { getNotificationIcon, getNotificationRoute, getNotificationLabel } from "@/shared/utils/notification";
import { cn } from "@/shared/utils/cn";
import type { Notification } from "@/shared/types";

type Filter = "all" | "unread" | "read";

export function NotificationList() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { notifications, unreadCount, loading, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read")   return n.isRead;
    return true;
  });

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markAsRead(n.id);
    const route = getNotificationRoute(n);
    if (route) router.push(route);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "unread", "read"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize",
                filter === f
                  ? "bg-brand text-white"
                  : "bg-white border border-border text-text-secondary hover:bg-gray-50",
              )}
            >
              {f}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 bg-red-100 text-red-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            icon={<CheckCheck size={13} />}
            onClick={() => markAllAsRead()}
          >
            Mark all read
          </Button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-lg border border-border overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-64 bg-gray-100 rounded animate-pulse" />
                  <div className="h-2 w-20 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Bell size={32} />}
            title={filter === "unread" ? "No unread notifications" : "No notifications"}
            description={
              filter === "unread"
                ? "You're all caught up!"
                : "Notifications appear here when tasks are assigned, projects are updated, or messages arrive."
            }
          />
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((n) => (
              <button
                key={n.id}
                onClick={() => handleClick(n)}
                className={cn(
                  "w-full flex items-start gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors",
                  !n.isRead && "bg-brand-light/30",
                )}
              >
                {/* Icon */}
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-base">
                  {getNotificationIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-text-primary">
                      {getNotificationLabel(n.type)}
                    </span>
                    {!n.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-brand flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary line-clamp-2">{n.message}</p>
                  <p className="text-[11px] text-text-muted mt-1">
                    {formatRelative(n.createdAt)}
                  </p>
                </div>

                {/* Unread dot */}
                {!n.isRead && (
                  <div className="flex-shrink-0 mt-1.5">
                    <div className="w-2 h-2 rounded-full bg-brand" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
