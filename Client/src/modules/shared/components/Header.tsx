"use client";
import { useState } from "react";
import { Search, Settings, HelpCircle } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { Avatar } from "@/shared/components/Avatar";
import { NotificationBell } from "@/modules/notification/components/NotificationBell";
import { useSocket } from "@/shared/hooks/useSocket";
import { cn } from "@/shared/utils/cn";

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  const { user } = useAuthStore();
  const [search, setSearch] = useState("");

  // Initialise socket connection (once per layout mount)
  useSocket();

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-border sticky top-0 z-10">
      {/* Title */}
      <div>
        <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
        {subtitle && (
          <p className="text-xs text-text-secondary mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search anything"
            className={cn(
              "h-8 pl-8 pr-10 rounded-md border border-border bg-gray-50 text-sm text-text-primary placeholder:text-text-muted",
              "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand focus:bg-white",
              "w-52 transition-all",
            )}
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-text-muted font-mono bg-gray-100 px-1 rounded">
            ⌘F
          </span>
        </div>

        {/* Notification bell with badge */}
        <NotificationBell />

        <button className="p-2 rounded-md hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors">
          <Settings size={16} />
        </button>
        <button className="p-2 rounded-md hover:bg-gray-100 text-text-muted hover:text-text-primary transition-colors">
          <HelpCircle size={16} />
        </button>

        {user && <Avatar name={user.name} size="sm" />}
      </div>
    </header>
  );
}
