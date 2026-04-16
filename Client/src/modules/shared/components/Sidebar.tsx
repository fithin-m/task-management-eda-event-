"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  CheckSquare,
  FolderOpen,
  Users,
  MessageSquare,
  Bell,
  Settings,
  LogOut,
  LayoutDashboard,
  UserCog,
} from "lucide-react";
import { cn } from "@/shared/utils/cn";
import { useAuthStore } from "@/store/authStore";
import { useProjectStore } from "@/store/projectStore";
import { getProjectColor, getInitials } from "@/shared/utils/format";
import toast from "react-hot-toast";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles?: string[];
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuthStore();
  const { projects } = useProjectStore();

  const navItems: NavItem[] = [
    {
      href: "/dashboard",
      label: "Home",
      icon: <Home size={16} />,
    },
    {
      href: "/tasks",
      label: "My Tasks",
      icon: <CheckSquare size={16} />,
    },
    {
      href: "/projects",
      label: "Projects",
      icon: <FolderOpen size={16} />,
    },
    {
      href: "/chat",
      label: "Message",
      icon: <MessageSquare size={16} />,
    },
    {
      href: "/notifications",
      label: "Inbox",
      icon: <Bell size={16} />,
    },
    {
      href: "/users",
      label: "People",
      icon: <Users size={16} />,
      roles: ["ADMIN", "MANAGER"],
    },
    {
      href: "/admin",
      label: "Admin Panel",
      icon: <LayoutDashboard size={16} />,
      roles: ["ADMIN"],
    },
    {
      href: "/admin/managers",
      label: "Managers",
      icon: <UserCog size={16} />,
      roles: ["ADMIN"],
    },
  ];

  const visibleNav = navItems.filter(
    (item) => !item.roles || item.roles.includes(role ?? "")
  );

  const handleLogout = () => {
    logout();
    toast.success("Logged out");
    router.push("/login");
  };

  return (
    <aside className="w-[220px] flex-shrink-0 bg-white border-r border-border flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">t</span>
          </div>
          <span className="font-bold text-text-primary text-base">taskhub</span>
        </div>
      </div>

      {/* Workspace selector */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-gray-50 border border-border">
          <div className="w-5 h-5 bg-brand-light rounded flex items-center justify-center">
            <span className="text-brand text-[10px] font-bold">
              {user?.name?.[0] ?? "W"}
            </span>
          </div>
          <span className="text-xs font-medium text-text-primary truncate flex-1">
            {user?.name ?? "Workspace"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {visibleNav.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors",
                active
                  ? "bg-brand-light text-brand font-medium"
                  : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}

        {/* Projects section */}
        {projects.length > 0 && (
          <div className="pt-4">
            <div className="flex items-center justify-between px-3 mb-2">
              <span className="text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                Projects
              </span>
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 7).map((project, i) => {
                const active = pathname === `/projects/${project.id}`;
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm transition-colors",
                      active
                        ? "bg-brand-light text-brand font-medium"
                        : "text-text-secondary hover:bg-gray-50 hover:text-text-primary"
                    )}
                  >
                    <div
                      className={cn(
                        "w-5 h-5 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0",
                        getProjectColor(i)
                      )}
                    >
                      {getInitials(project.name)}
                    </div>
                    <span className="truncate text-xs">{project.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-border space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-gray-50 hover:text-text-primary transition-colors"
        >
          <Settings size={16} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm text-text-secondary hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </aside>
  );
}
