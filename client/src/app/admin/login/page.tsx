"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/api";
import { Trophy, Lock, User, AlertTriangle, Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if already authenticated on mount
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await authService.verify();
          router.replace("/admin");
          return;
        } catch (err) {
          // Token invalid, clean it up
          localStorage.removeItem("token");
        }
      }
      setCheckingAuth(false);
    }
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await authService.login({
        username: username.trim(),
        password,
      });

      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        router.replace("/admin");
      } else {
        setError("Invalid response from server.");
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">
            Checking credentials...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-black px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="flex flex-col items-center text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] text-slate-950 shadow-lg shadow-orange-500/20">
            <Trophy className="h-6 w-6 font-bold" />
          </span>
          <h2 className="mt-6 text-3xl font-black tracking-tight text-white uppercase">
            Admin Access
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign in to access the Tournament Control Center
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-900 bg-slate-900/30 p-8 shadow-2xl backdrop-blur-md">
          {error && (
            <div className="mb-6 flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-xs font-semibold text-red-400">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div className="space-y-1.5">
              <label
                htmlFor="username"
                className="block text-[10px] font-black uppercase tracking-wider text-slate-500"
              >
                Username
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-4 w-4 text-slate-600" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 transition duration-200 focus:border-orange-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="block text-[10px] font-black uppercase tracking-wider text-slate-500"
              >
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-4 w-4 text-slate-600" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 py-3 pl-10 pr-10 text-sm text-slate-200 placeholder-slate-600 transition duration-200 focus:border-orange-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-600 hover:text-slate-400 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] py-3.5 text-xs font-black uppercase tracking-wider text-slate-950 shadow-md shadow-orange-500/10 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
            >
              {loading ? "Authorizing..." : "Log In"}
            </button>
          </form>
        </div>

        {/* Help Banner */}
        <p className="text-center text-[10px] text-slate-600 font-semibold uppercase tracking-wider">
          Public signups are disabled. Contact the host for access keys.
        </p>
      </div>
    </div>
  );
}

