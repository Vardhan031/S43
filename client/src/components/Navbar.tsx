"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Trophy, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  if (pathname === "/") {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-orange-500/20 bg-black/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-[#ff4e00] to-[#ff8c00] text-slate-950 shadow-lg shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
            <Trophy className="h-5 w-5 font-bold" />
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

