import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/firebaseService";
import { useAlert } from "../context/AlertContext";
import { Trophy, Lock, User as UserIcon, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { success: alertSuccess, error: alertError } = useAlert();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const email = username.includes("@") ? username : `${username}@s43.com`;
      await authService.login(email, password);
      localStorage.setItem("admin_authenticated", "true");
      alertSuccess("Admin gateway unlocked.", "Access Granted");
      navigate("/admin");
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Invalid credentials. Access denied.";
      setError(msg);
      alertError(msg, "Authentication Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md">
        <div className="mb-6 flex justify-start">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-500 hover:text-orange-500 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Public View
          </Link>
        </div>

        <div className="rounded-3xl border border-orange-500/20 bg-neutral-950 p-8 shadow-2xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-orange-500/30 mb-4">
              <Trophy className="h-8 w-8 text-orange-500" />
            </div>
            <h1 className="font-extrabold text-2xl uppercase tracking-wide text-white">
              Admin Gateway
            </h1>
            <p className="mt-1 text-xs text-neutral-500 font-medium">
              S43 Esports Tournament Control Panel
            </p>
          </div>

          {error && (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center">
              <p className="text-xs font-semibold text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Username / Email
              </label>
              <div className="relative flex items-center">
                <UserIcon className="absolute left-3.5 h-4 w-4 text-neutral-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username or email"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pl-10 pr-4 text-sm font-semibold text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-neutral-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-neutral-800 bg-neutral-900/60 py-3 pl-10 pr-4 text-sm font-semibold text-white placeholder-neutral-600 focus:border-orange-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-3 text-sm font-extrabold uppercase text-black hover:brightness-110 active:scale-[0.99] transition"
            >
              {loading ? "Authenticating..." : "Sign In to Admin Dashboard"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
