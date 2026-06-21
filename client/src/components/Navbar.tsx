"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, LayoutDashboard } from "lucide-react";
import { tournamentService } from "@/services/api";

export default function Navbar() {
  const pathname = usePathname();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState<"VSA" | "H2H" | null>(null);

  useEffect(() => {
    const match = pathname.match(/^\/tournaments\/([^/]+)/);
    const tournamentId = match ? match[1] : null;

    if (tournamentId) {
      const id = tournamentId;
      let active = true;
      async function fetchLogo() {
        try {
          const t = await tournamentService.getById(id);
          if (active) {
            if (t.logoUrl) {
              setLogoUrl(t.logoUrl);
              setFallbackMode(null);
            } else {
              setLogoUrl(null);
              setFallbackMode(t.mode);
            }
          }
        } catch (e) {
          console.error("Failed to load tournament logo for Navbar", e);
        }
      }
      fetchLogo();
      return () => {
        active = false;
      };
    } else {
      setLogoUrl(null);
      setFallbackMode(null);
    }
  }, [pathname]);

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-500/20 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 ${
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
              <Trophy className="h-5 w-5 font-bold" />
            )}
          </span>
          <div>
            <span className="block text-sm font-black uppercase tracking-wider text-white">S43</span>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/"
            className="text-slate-300 hover:text-orange-400 transition-colors py-2 px-3 rounded hover:bg-white/5"
          >
            Tournaments
          </Link>
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] px-4 py-2 font-black text-slate-950 shadow-md shadow-orange-500/10 hover:brightness-110 transition-all duration-200 active:scale-95"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  );
}

