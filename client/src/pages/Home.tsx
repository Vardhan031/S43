import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tournament } from "../types";
import { tournamentService } from "../services/firebaseService";
import { Trophy, Settings, Swords, Crosshair } from "lucide-react";
import { motion } from "framer-motion";
import InteractiveTournamentCard from "../components/InteractiveTournamentCard";

const staticParticles = [
  // Left Zone (0% - 33%)
  { size: 3, left: 4, top: 22, duration: 18, delay: -4, color: "radial-gradient(circle, #ff9e00 0%, #ff5500 100%)", glow: "0 0 10px rgba(255,158,0,0.9), 0 0 20px rgba(255,85,0,0.5)" },
  { size: 2, left: 8, top: 58, duration: 14, delay: -9, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 8px rgba(255,208,0,0.8)" },
  { size: 4.5, left: 12, top: 38, duration: 22, delay: -2, color: "radial-gradient(circle, #ff7b00 0%, #ff3700 100%)", glow: "0 0 12px rgba(255,123,0,0.9), 0 0 24px rgba(255,55,0,0.6)" },
  { size: 2, left: 15, top: 78, duration: 16, delay: -12, color: "radial-gradient(circle, #ff9e00 0%, #ff5500 100%)", glow: "0 0 8px rgba(255,158,0,0.75)" },
  { size: 3.5, left: 18, top: 18, duration: 20, delay: -7, color: "radial-gradient(circle, #ffd000 0%, #ff7b00 100%)", glow: "0 0 10px rgba(255,208,0,0.85), 0 0 20px rgba(255,123,0,0.4)" },
  { size: 2.5, left: 22, top: 88, duration: 15, delay: -15, color: "radial-gradient(circle, #ff6a00 0%, #d83a00 100%)", glow: "0 0 8px rgba(255,106,0,0.8)" },
  { size: 5, left: 25, top: 48, duration: 24, delay: -5, color: "radial-gradient(circle, #ffaa00 0%, #ff4d00 100%)", glow: "0 0 14px rgba(255,170,0,0.95), 0 0 26px rgba(255,77,0,0.6)" },
  { size: 2, left: 28, top: 28, duration: 13, delay: -11, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 6px rgba(255,208,0,0.7)" },
  { size: 3, left: 31, top: 68, duration: 19, delay: -1, color: "radial-gradient(circle, #ff8c00 0%, #ff4400 100%)", glow: "0 0 9px rgba(255,140,0,0.85)" },
  { size: 4, left: 33, top: 12, duration: 21, delay: -17, color: "radial-gradient(circle, #ff9e00 0%, #e63900 100%)", glow: "0 0 11px rgba(255,158,0,0.9), 0 0 22px rgba(230,57,0,0.5)" },
  { size: 1.5, left: 10, top: 85, duration: 12, delay: -6, color: "radial-gradient(circle, #ffd700 0%, #ff9e00 100%)", glow: "0 0 6px rgba(255,215,0,0.7)" },
  { size: 2.5, left: 6, top: 44, duration: 17, delay: -14, color: "radial-gradient(circle, #ff6a00 0%, #d83a00 100%)", glow: "0 0 8px rgba(255,106,0,0.8)" },
  { size: 3.5, left: 27, top: 74, duration: 20, delay: -8, color: "radial-gradient(circle, #ffaa00 0%, #ff4d00 100%)", glow: "0 0 10px rgba(255,170,0,0.85)" },

  // Center Zone (34% - 66%)
  { size: 2, left: 36, top: 82, duration: 15, delay: -3, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 8px rgba(255,208,0,0.8)" },
  { size: 4, left: 39, top: 32, duration: 23, delay: -10, color: "radial-gradient(circle, #ff8c00 0%, #ff3c00 100%)", glow: "0 0 12px rgba(255,140,0,0.9), 0 0 22px rgba(255,60,0,0.5)" },
  { size: 2.5, left: 42, top: 62, duration: 16, delay: -18, color: "radial-gradient(circle, #ffaa00 0%, #ff5500 100%)", glow: "0 0 9px rgba(255,170,0,0.85)" },
  { size: 5.5, left: 45, top: 16, duration: 26, delay: -6, color: "radial-gradient(circle, #ffd700 0%, #ff6600 100%)", glow: "0 0 16px rgba(255,215,0,0.95), 0 0 30px rgba(255,102,0,0.6)" },
  { size: 2, left: 48, top: 92, duration: 14, delay: -13, color: "radial-gradient(circle, #ff7b00 0%, #d83a00 100%)", glow: "0 0 7px rgba(255,123,0,0.75)" },
  { size: 3, left: 51, top: 46, duration: 18, delay: -2, color: "radial-gradient(circle, #ff9e00 0%, #ff4d00 100%)", glow: "0 0 10px rgba(255,158,0,0.85)" },
  { size: 4.5, left: 54, top: 76, duration: 22, delay: -16, color: "radial-gradient(circle, #ffd000 0%, #ff6a00 100%)", glow: "0 0 13px rgba(255,208,0,0.9), 0 0 25px rgba(255,106,0,0.5)" },
  { size: 2, left: 57, top: 26, duration: 15, delay: -8, color: "radial-gradient(circle, #ffaa00 0%, #ff5500 100%)", glow: "0 0 7px rgba(255,170,0,0.8)" },
  { size: 3.5, left: 60, top: 56, duration: 19, delay: -19, color: "radial-gradient(circle, #ff8c00 0%, #ff3c00 100%)", glow: "0 0 11px rgba(255,140,0,0.85)" },
  { size: 5, left: 63, top: 86, duration: 25, delay: -4, color: "radial-gradient(circle, #ffd700 0%, #ff5500 100%)", glow: "0 0 15px rgba(255,215,0,0.95), 0 0 28px rgba(255,85,0,0.6)" },
  { size: 1.5, left: 40, top: 70, duration: 11, delay: -9, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 6px rgba(255,208,0,0.7)" },
  { size: 3, left: 47, top: 52, duration: 17, delay: -12, color: "radial-gradient(circle, #ff8c00 0%, #ff4400 100%)", glow: "0 0 9px rgba(255,140,0,0.85)" },
  { size: 2.5, left: 59, top: 38, duration: 16, delay: -5, color: "radial-gradient(circle, #ffd700 0%, #ff7b00 100%)", glow: "0 0 8px rgba(255,215,0,0.8)" },
  { size: 4, left: 65, top: 22, duration: 21, delay: -14, color: "radial-gradient(circle, #ff9e00 0%, #e63900 100%)", glow: "0 0 12px rgba(255,158,0,0.9)" },

  // Right Zone (67% - 100%)
  { size: 2.5, left: 68, top: 42, duration: 17, delay: -1, color: "radial-gradient(circle, #ff9e00 0%, #ff5500 100%)", glow: "0 0 9px rgba(255,158,0,0.85)" },
  { size: 4.5, left: 71, top: 72, duration: 23, delay: -15, color: "radial-gradient(circle, #ff7b00 0%, #ff3700 100%)", glow: "0 0 13px rgba(255,123,0,0.9), 0 0 25px rgba(255,55,0,0.55)" },
  { size: 2, left: 74, top: 14, duration: 14, delay: -7, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 7px rgba(255,208,0,0.75)" },
  { size: 3.5, left: 77, top: 50, duration: 19, delay: -11, color: "radial-gradient(circle, #ffaa00 0%, #ff4d00 100%)", glow: "0 0 10px rgba(255,170,0,0.85)" },
  { size: 2, left: 80, top: 90, duration: 16, delay: -3, color: "radial-gradient(circle, #ff6a00 0%, #d83a00 100%)", glow: "0 0 7px rgba(255,106,0,0.75)" },
  { size: 5, left: 83, top: 34, duration: 24, delay: -17, color: "radial-gradient(circle, #ffd700 0%, #ff6600 100%)", glow: "0 0 15px rgba(255,215,0,0.95), 0 0 28px rgba(255,102,0,0.6)" },
  { size: 2.5, left: 86, top: 64, duration: 18, delay: -6, color: "radial-gradient(circle, #ff8c00 0%, #ff4400 100%)", glow: "0 0 9px rgba(255,140,0,0.85)" },
  { size: 4, left: 89, top: 20, duration: 20, delay: -13, color: "radial-gradient(circle, #ffd000 0%, #ff7b00 100%)", glow: "0 0 12px rgba(255,208,0,0.9), 0 0 22px rgba(255,123,0,0.5)" },
  { size: 2, left: 92, top: 80, duration: 13, delay: -5, color: "radial-gradient(circle, #ff9e00 0%, #ff5500 100%)", glow: "0 0 8px rgba(255,158,0,0.75)" },
  { size: 3.5, left: 95, top: 45, duration: 21, delay: -18, color: "radial-gradient(circle, #ff7b00 0%, #d83a00 100%)", glow: "0 0 11px rgba(255,123,0,0.85)" },
  { size: 2, left: 98, top: 15, duration: 15, delay: -2, color: "radial-gradient(circle, #ffd700 0%, #ff8c00 100%)", glow: "0 0 7px rgba(255,215,0,0.75)" },
  { size: 1.5, left: 73, top: 30, duration: 12, delay: -10, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 6px rgba(255,208,0,0.7)" },
  { size: 3, left: 81, top: 18, duration: 17, delay: -8, color: "radial-gradient(circle, #ffaa00 0%, #ff5500 100%)", glow: "0 0 9px rgba(255,170,0,0.85)" },
  { size: 2.5, left: 91, top: 55, duration: 16, delay: -14, color: "radial-gradient(circle, #ff8c00 0%, #ff3c00 100%)", glow: "0 0 8px rgba(255,140,0,0.8)" },
  { size: 4, left: 96, top: 72, duration: 22, delay: -9, color: "radial-gradient(circle, #ffd700 0%, #ff6600 100%)", glow: "0 0 12px rgba(255,215,0,0.9)" },

  // Ambient Drifters (Deep background layering)
  { size: 2, left: 2, top: 10, duration: 19, delay: -16, color: "radial-gradient(circle, #ffd700 0%, #ff8c00 100%)", glow: "0 0 7px rgba(255,215,0,0.7)" },
  { size: 3, left: 16, top: 5, duration: 21, delay: -3, color: "radial-gradient(circle, #ffaa00 0%, #ff4d00 100%)", glow: "0 0 9px rgba(255,170,0,0.8)" },
  { size: 2.5, left: 35, top: 5, duration: 16, delay: -11, color: "radial-gradient(circle, #ffd000 0%, #ff7b00 100%)", glow: "0 0 8px rgba(255,208,0,0.75)" },
  { size: 2, left: 50, top: 8, duration: 14, delay: -5, color: "radial-gradient(circle, #ff9e00 0%, #ff5500 100%)", glow: "0 0 7px rgba(255,158,0,0.75)" },
  { size: 3.5, left: 67, top: 6, duration: 20, delay: -13, color: "radial-gradient(circle, #ffd700 0%, #ff6600 100%)", glow: "0 0 11px rgba(255,215,0,0.85)" },
  { size: 2, left: 85, top: 8, duration: 15, delay: -4, color: "radial-gradient(circle, #ff8c00 0%, #ff3c00 100%)", glow: "0 0 7px rgba(255,140,0,0.75)" },
  { size: 2.5, left: 94, top: 92, duration: 17, delay: -12, color: "radial-gradient(circle, #ffd000 0%, #ff8c00 100%)", glow: "0 0 8px rgba(255,208,0,0.8)" },
  { size: 1.5, left: 20, top: 94, duration: 13, delay: -7, color: "radial-gradient(circle, #ffaa00 0%, #ff5500 100%)", glow: "0 0 6px rgba(255,170,0,0.7)" },
  { size: 3, left: 75, top: 94, duration: 18, delay: -15, color: "radial-gradient(circle, #ffd700 0%, #ff7b00 100%)", glow: "0 0 10px rgba(255,215,0,0.85)" }
];

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"VSA" | "H2H">("VSA");

  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const timer = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1000);

    const unsubscribe = tournamentService.subscribeAll((data) => {
      if (mounted) {
        setTournaments(data);
        const vsa = data.filter((t) => t.mode === "VSA");
        const h2h = data.filter((t) => t.mode === "H2H");
        if (vsa.length === 0 && h2h.length > 0) setActiveTab("H2H");
        setLoading(false);
        clearTimeout(timer);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  const currentModeTournaments = tournaments.filter((t) => t.mode === activeTab);
  const dbOngoingTournaments = currentModeTournaments.filter((t) => t.status !== "COMPLETED");
  const dbCompletedTournaments = currentModeTournaments.filter((t) => t.status === "COMPLETED");

  if (loading) {
    return (
      <div style={{ background: "#050505" }} className="flex min-h-screen items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center h-24 w-24 mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-orange-500/20 animate-ping" />
            <div className="absolute flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-900 border border-orange-500/30">
              <Trophy className="h-7 w-7 text-orange-500" />
            </div>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
            Loading Tournament Platform...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#050505" }} className="min-h-screen text-slate-100 font-sans selection:bg-orange-500 selection:text-black relative overflow-x-hidden">
      {/* Global Vignette */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }} />

      {/* Hero Section */}
      <div className="relative" style={{ minHeight: "82vh" }}>
        {/* Glow */}
        <div className="absolute pointer-events-none" style={{ top: "-60px", left: "50%", transform: "translateX(-50%)", width: "1100px", height: "700px", background: "radial-gradient(ellipse at center, rgba(255,106,0,0.22) 0%, rgba(255,70,0,0.08) 50%, transparent 75%)", filter: "blur(45px)" }} />

        {/* Diamond Grid Mesh Pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0 L40 20 L20 40 L0 20 Z' fill='none' stroke='%23ff8c00' stroke-width='0.8' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px"
          }}
        />

        {/* Floating Animated Ember Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {staticParticles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full animate-ember"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: p.color || "radial-gradient(circle, #ff8c00 0%, #ff4e00 100%)",
                boxShadow: p.glow || "0 0 10px rgba(255,106,0,0.9), 0 0 20px rgba(255,78,0,0.5)",
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12" style={{ minHeight: "82vh", display: "flex", flexDirection: "column" }}>
          {/* NAV PILL */}
          <div className="flex justify-center pt-6 pb-4">
            <div className="relative flex items-center gap-1.5 rounded-full p-1.5 bg-neutral-950/90 border border-orange-500/25 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.8),0_0_20px_rgba(255,106,0,0.1)]">
              {/* VSA Button */}
              <button
                onClick={() => setActiveTab("VSA")}
                className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer select-none ${
                  activeTab === "VSA" ? "text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                {activeTab === "VSA" && (
                  <motion.div
                    layoutId="activeHomeModePill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_20px_rgba(255,106,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] z-0"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Crosshair className={`h-3.5 w-3.5 transition-transform duration-300 ${activeTab === "VSA" ? "text-black scale-110" : "text-amber-500/80"}`} />
                  <span>VSA</span>
                </span>
              </button>

              {/* H2H Button */}
              <button
                onClick={() => setActiveTab("H2H")}
                className={`relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition-colors duration-300 cursor-pointer select-none ${
                  activeTab === "H2H" ? "text-black" : "text-neutral-400 hover:text-white"
                }`}
              >
                {activeTab === "H2H" && (
                  <motion.div
                    layoutId="activeHomeModePill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 shadow-[0_0_20px_rgba(255,106,0,0.5),inset_0_1px_0_rgba(255,255,255,0.4)] z-0"
                    transition={{ type: "spring", bounce: 0.18, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Swords className={`h-3.5 w-3.5 transition-transform duration-300 ${activeTab === "H2H" ? "text-black scale-110" : "text-amber-500/80"}`} />
                  <span>H2H</span>
                </span>
              </button>

              {/* Admin Link */}
              <Link
                to="/admin"
                className="group relative flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] text-neutral-400 hover:text-white transition-colors duration-300"
              >
                <div className="absolute inset-0 rounded-full bg-neutral-900/40 border border-neutral-800/60 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
                <Settings className="h-3.5 w-3.5 text-neutral-500 group-hover:text-amber-400 group-hover:rotate-45 transition-all duration-300" />
                <span>Admin</span>
              </Link>
            </div>
          </div>

          {/* HERO BODY */}
          <div className="flex-grow flex items-center">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-center pb-20 pt-8">
              {/* Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
                  <img
                    src="/S43_vsa.png"
                    alt="VSA"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-700"
                    style={{ opacity: activeTab === "VSA" ? 1 : 0, transform: activeTab === "VSA" ? "scale(1)" : "scale(0.88)" }}
                  />
                  <img
                    src="/S43_h2h.png"
                    alt="H2H"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-700"
                    style={{ opacity: activeTab === "H2H" ? 1 : 0, transform: activeTab === "H2H" ? "scale(1)" : "scale(0.88)" }}
                  />
                </div>
              </div>

              {/* Headline & Subtitle */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left min-w-0">
                <div className="flex items-center gap-2.5 mb-4">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#ff5500] shadow-[0_0_12px_#ff5500]" />
                  <span className="text-xs sm:text-sm font-black tracking-[0.25em] text-slate-200 uppercase">
                    EA SPORTS FC MOBILE
                  </span>
                </div>
                <h1
                  className="font-black italic uppercase leading-[0.82] tracking-tight w-full text-[#ff5500]"
                  style={{
                    fontFamily: "'Kanit', 'Plus Jakarta Sans', sans-serif",
                    fontWeight: 900,
                    fontSize: "clamp(3.2rem, 7.5vw, 7.5rem)",
                    filter: "drop-shadow(0 0 25px rgba(255, 85, 0, 0.4)) drop-shadow(0 4px 16px rgba(0,0,0,0.95))"
                  }}
                >
                  LEAGUE<br />TOURNAMENTS
                </h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Sections */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pb-24">
        {/* Ongoing Tournaments */}
        <section className="mb-20">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="font-extrabold text-lg sm:text-xl text-white uppercase tracking-wider">
                Ongoing Tournaments
              </h2>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
              {activeTab} Bracket
            </span>
          </div>

          {dbOngoingTournaments.length === 0 ? (
            <div className="rounded-2xl p-12 sm:p-16 text-center border border-orange-500/10 bg-neutral-950/60">
              <Trophy className="mx-auto h-8 w-8 text-orange-500" />
              <h3 className="mt-4 font-extrabold text-2xl text-white uppercase">
                No Active Tournaments
              </h3>
              <p className="mt-2 text-sm text-neutral-500 font-medium">
                Check back soon — the next showdown is on its way.
              </p>
            </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {dbOngoingTournaments.map((t) => (
                <InteractiveTournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          )}
        </section>

        {/* Completed Tournaments */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" />
              <h2 className="font-extrabold text-lg sm:text-xl text-white uppercase tracking-wider">
                Past Tournaments
              </h2>
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">Archive</span>
          </div>

          {dbCompletedTournaments.length === 0 ? (
            <div className="rounded-2xl p-12 text-center border border-white/5 bg-neutral-950/40">
              <h3 className="font-extrabold text-xl text-neutral-500 uppercase">
                No Completed Tournaments
              </h3>
            </div>
          ) : (
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
              {dbCompletedTournaments.map((t) => (
                <InteractiveTournamentCard key={t.id} tournament={t} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
