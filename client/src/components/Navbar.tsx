import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Trophy, LayoutDashboard } from "lucide-react";
import { tournamentService } from "../services/firebaseService";
import RulesModal from "./RulesModal";

export default function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<"VSA" | "H2H" | null>(null);
  const [showRulesModal, setShowRulesModal] = useState(false);

  useEffect(() => {
    const match = pathname.match(/^\/tournaments\/([^/]+)/);
    const tournamentId = match ? match[1] : null;

    if (tournamentId) {
      const unsubscribe = tournamentService.subscribeById(tournamentId, (t) => {
        if (t) {
          if (t.logoUrl) {
            setLogoUrl(t.logoUrl);
            setFallbackMode(null);
          } else {
            setLogoUrl(null);
            setFallbackMode(t.mode);
          }
        }
      });
      return () => unsubscribe();
    } else {
      setLogoUrl(null);
      setFallbackMode(null);
    }
  }, [pathname]);

  if (pathname === "/") {
    return null;
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-orange-500/20 bg-black/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <span className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
              logoUrl || fallbackMode
                ? "bg-neutral-950/90 border border-orange-500/25 shadow-lg shadow-orange-500/5"
                : "bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] text-slate-950 shadow-lg shadow-orange-500/20"
            }`}>
              {logoUrl ? (
                <img src={logoUrl} alt="Tournament Logo" className="h-full w-full object-cover" />
              ) : fallbackMode ? (
                <img
                  src={fallbackMode === "VSA" ? "/S43_vsa.png" : "/S43_h2h.png"}
                  alt={`${fallbackMode} Mode`}
                  className="h-full w-full object-contain p-0.5"
                />
              ) : (
                <Trophy className="h-4 w-4 sm:h-5 sm:w-5 font-bold" />
              )}
            </span>
            <div>
              <span className="block text-xs sm:text-sm font-black uppercase tracking-wider text-white">S43</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1.5 sm:gap-4 text-xs sm:text-sm font-medium">
            <Link
              to="/"
              className="text-slate-300 hover:text-orange-400 transition-colors py-1.5 sm:py-2 px-2 sm:px-3 rounded hover:bg-white/5 shrink-0"
            >
              Tournaments
            </Link>
            <button
              type="button"
              onClick={() => setShowRulesModal(true)}
              className="text-slate-300 hover:text-orange-400 transition-colors py-1.5 sm:py-2 px-2 sm:px-3 rounded hover:bg-white/5 cursor-pointer shrink-0"
            >
              Rules
            </button>
            <Link
              to="/admin"
              className="flex items-center gap-1 sm:gap-1.5 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] px-2.5 sm:px-4 py-1.5 sm:py-2 font-black text-slate-950 shadow-md shadow-orange-500/10 hover:brightness-110 transition-all duration-200 active:scale-95 shrink-0"
            >
              <LayoutDashboard className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden xs:inline sm:inline">Dashboard</span>
              <span className="xs:hidden sm:hidden">Admin</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
      />
    </>
  );
}
