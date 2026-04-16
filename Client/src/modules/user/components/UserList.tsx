"use client";
import { useEffect, useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/user.service";
import { Avatar } from "@/shared/components/Avatar";
import { RoleBadge } from "@/shared/components/Badge";
import { Button } from "@/shared/components/Button";
import { Modal } from "@/shared/components/Modal";
import { Input } from "@/shared/components/Input";
import { EmptyState } from "@/shared/components/EmptyState";
import { ErrorState } from "@/shared/components/ErrorState";
import { formatDate } from "@/shared/utils/format";
import toast from "react-hot-toast";

export function UserList() {
  const { users, managers, loading, error, fetchUsers, fetchManagers, addManager } = useUserStore();
  const { role } = useAuthStore();
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchUsers();
    if (role === "ADMIN") fetchManagers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreateManager = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("All fields required");
      return;
    }
    setCreating(true);
    try {
      const manager = await userService.createManager(form);
      addManager(manager);
      toast.success("Manager created");
      setShowCreate(false);
      setForm({ name: "", email: "", password: "" });
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to create manager");
    } finally {
      setCreating(false);
    }
  };

  if (error) return <ErrorState message={error} onRetry={fetchUsers} />;

  const allUsers = [...managers, ...users.filter((u) => u.role === "USER")];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-secondary">{allUsers.length} people</p>
        {role === "ADMIN" && (
          <Button icon={<Plus size={14} />} onClick={() => setShowCreate(true)}>
            Create Manager
          </Button>
        )}
      </div>

      <div className="bg-white rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-0 text-xs font-semibold text-text-muted uppercase tracking-wide px-5 py-3 border-b border-border bg-gray-50">
          <span className="w-10">Avatar</span>
          <span>Name / Email</span>
          <span className="w-24 text-center">Role</span>
          <span className="w-28 text-center">Joined</span>
        </div>

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
                <div className="flex-1 space-y-1">
                  <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : allUsers.length === 0 ? (
          <EmptyState icon={<UserCog size={32} />} title="No users found" />
        ) : (
          <div className="divide-y divide-border">
            {allUsers.map((user) => (
              <div key={user.id} className="grid grid-cols-[auto_1fr_auto_auto] gap-0 items-center px-5 py-3 hover:bg-gray-50">
                <div className="w-10">
                  <Avatar name={user.name} size="sm" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">{user.name}</p>
                  <p className="text-xs text-text-muted">{user.email}</p>
                </div>
                <div className="w-24 flex justify-center">
                  <RoleBadge role={user.role} />
                </div>
                <div className="w-28 text-center">
                  <span className="text-xs text-text-muted">{formatDate(user.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Manager">
        <form onSubmit={handleCreateManager} className="space-y-4">
          <Input label="Full name *" placeholder="Jane Smith" value={form.name} onChange={set("name")} />
          <Input label="Email *" type="email" placeholder="jane@example.com" value={form.email} onChange={set("email")} />
          <Input label="Password *" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={creating}>Create Manager</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
