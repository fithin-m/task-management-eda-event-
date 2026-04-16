"use client";
import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useNotificationStore } from "@/store/notificationStore";
import { useAuthStore } from "@/store/authStore";
import { formatRelative } from "@/shared/utils/format";
import { getNotificationIcon, getNotificationRoute, getNotificationLabel } from "@/shared/utils/notification";
import { cn } from "@/shared/utils/cn";
import type { Notification } from "@/shared/types";

export function NotificationBell() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { notifications, unreadCount, fetchNotifications, markAsRead, markAllAsRead } =
    useNotificationStore();

  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Fetch on mount
  useEffect(() => {
    if (isAuthenticated) fetchNotifications();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleClick = async (n: Notification) => {
    if (!n.isRead) await markAsRead(n.id);
    const route = getNotificationRoute(n);
    if (route) router.push(route);
    setOpen(false);
  };

  const preview = notifications.slice(0, 6);

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-md hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 leading-none">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-border shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-text-muted" />
              <span className="text-sm font-semibold text-text-primary">Notifications</span>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllAsRead()}
                  className="flex items-center gap-1 text-[11px] text-brand hover:underline"
                  title="Mark all as read"
                >
                  <CheckCheck size={12} />
                  All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100 text-text-muted ml-1"
              >
                <X size={13} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {preview.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Bell size={24} className="text-text-muted mb-2 opacity-40" />
                <p className="text-xs text-text-muted">No notifications yet</p>
              </div>
            ) : (
              preview.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className={cn(
                    "w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors",
                    !n.isRead && "bg-brand-light/40",
                  )}
                >
                  <span className="text-base flex-shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-text-primary">
                      {getNotificationLabel(n.type)}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5 line-clamp-2">
                      {n.message}
                    </p>
                    <p className="text-[10px] text-text-muted mt-1">
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="w-2 h-2 rounded-full bg-brand flex-shrink-0 mt-1.5" />
                  )}
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-border bg-gray-50">
            <button
              onClick={() => { router.push("/notifications"); setOpen(false); }}
              className="text-xs text-brand hover:underline font-medium w-full text-center"
            >
              View all notifications →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
