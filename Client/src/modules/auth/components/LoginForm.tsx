"use client";
import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { authService } from "@/services/auth.service";
import { Button } from "@/shared/components/Button";
import { Input } from "@/shared/components/Input";
import toast from "react-hot-toast";

export function LoginForm() {
  const { setAuth } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {}
  );

  const validate = () => {
    const e: typeof errors = {};
    if (!email) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Invalid email";
    if (!password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { token, user } = await authService.login(email, password);
      // setAuth now sets cookies + localStorage + zustand state
      setAuth(user, token);
      toast.success(`Welcome back, ${user.name}!`);

      const dest = user.role === "ADMIN" ? "/admin" : "/dashboard";
      // Use window.location for a hard navigation so middleware
      // reads the freshly-set cookies on the very next request
      window.location.href = dest;
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-app flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8 justify-center">
          <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-base">t</span>
          </div>
          <span className="font-bold text-text-primary text-xl">taskhub</span>
        </div>

        <div className="bg-white rounded-xl border border-border shadow-card p-8">
          <h2 className="text-xl font-semibold text-text-primary mb-1">
            Sign in
          </h2>
          <p className="text-sm text-text-secondary mb-6">
            Welcome back! Enter your credentials.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              icon={<Mail size={14} />}
            />

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-primary">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={14}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                />
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-white pl-9 pr-10 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
                >
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-2"
              size="md"
            >
              Sign in
            </Button>
          </form>

          <p className="text-xs text-text-secondary text-center mt-5">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-brand font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
