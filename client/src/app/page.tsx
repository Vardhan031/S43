"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Tournament, tournamentService, matchService, standingsService } from "@/services/api";
import { Trophy, Users, Zap, Calendar, Settings, Swords, Crosshair } from "lucide-react";


const staticParticles = [
  { size: 3, left: 12, top: 40, duration: 18, delay: -4, sway: 20 },
  { size: 4, left: 28, top: 75, duration: 22, delay: -8, sway: -15 },
  { size: 2, left: 45, top: 20, duration: 15, delay: -2, sway: 25 },
  { size: 5, left: 62, top: 60, duration: 25, delay: -12, sway: -20 },
  { size: 3, left: 78, top: 35, duration: 19, delay: -6, sway: 15 },
  { size: 4, left: 88, top: 80, duration: 21, delay: -16, sway: -10 },
  { size: 2, left: 15, top: 65, duration: 16, delay: -3, sway: 18 },
  { size: 3, left: 38, top: 15, duration: 20, delay: -10, sway: -22 },
  { size: 5, left: 52, top: 85, duration: 24, delay: -14, sway: 30 },
  { size: 2, left: 70, top: 50, duration: 17, delay: -5, sway: -12 },
  { size: 4, left: 95, top: 25, duration: 23, delay: -18, sway: 15 },
  { size: 3, left: 5, top: 90, duration: 19, delay: -7, sway: -18 },
  { size: 2, left: 50, top: 45, duration: 14, delay: -1, sway: 22 },
  { size: 4, left: 82, top: 70, duration: 20, delay: -9, sway: -25 },
  { size: 3, left: 22, top: 30, duration: 18, delay: -11, sway: 12 },
  // Extra particles for a richer animation background
  { size: 3, left: 8, top: 25, duration: 17, delay: -5, sway: 14 },
  { size: 5, left: 18, top: 55, duration: 23, delay: -13, sway: -18 },
  { size: 2, left: 32, top: 10, duration: 14, delay: -3, sway: 22 },
  { size: 4, left: 40, top: 68, duration: 21, delay: -7, sway: -16 },
  { size: 3, left: 58, top: 30, duration: 19, delay: -11, sway: 25 },
  { size: 2, left: 66, top: 82, duration: 16, delay: -4, sway: -12 },
  { size: 4, left: 74, top: 15, duration: 22, delay: -9, sway: 18 },
  { size: 3, left: 85, top: 52, duration: 18, delay: -15, sway: -20 },
  { size: 5, left: 92, top: 72, duration: 26, delay: -17, sway: 28 },
  { size: 2, left: 3, top: 48, duration: 15, delay: -2, sway: -15 },
  { size: 4, left: 14, top: 88, duration: 20, delay: -10, sway: 12 },
  { size: 3, left: 25, top: 18, duration: 19, delay: -8, sway: -24 },
  { size: 2, left: 36, top: 58, duration: 13, delay: -1, sway: 16 },
  { size: 5, left: 48, top: 38, duration: 25, delay: -12, sway: -30 },
  { size: 3, left: 55, top: 92, duration: 17, delay: -6, sway: 20 },
  { size: 4, left: 69, top: 22, duration: 21, delay: -14, sway: -18 },
  { size: 2, left: 77, top: 62, duration: 15, delay: -3, sway: 15 },
  { size: 3, left: 83, top: 8, duration: 18, delay: -7, sway: -10 },
  { size: 4, left: 96, top: 46, duration: 23, delay: -19, sway: 24 },
  { size: 2, left: 30, top: 42, duration: 16, delay: -5, sway: -14 }
];

export default function Home() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"VSA" | "H2H">("VSA");

  useEffect(() => {
    async function loadTournaments() {
      try {
        setLoading(true);
        const data = await tournamentService.getAll();
        setTournaments(data);
        const vsa = data.filter((t) => t.mode === "VSA");
        const h2h = data.filter((t) => t.mode === "H2H");
        if (vsa.length === 0 && h2h.length > 0) setActiveTab("H2H");
        else setActiveTab("VSA");
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load tournaments list from database.");
      } finally {
        setLoading(false);
      }
    }
    loadTournaments();
  }, []);

  const currentModeTournaments = tournaments.filter((t) => t.mode === activeTab);
  const dbOngoingTournaments = currentModeTournaments.filter((t) => t.status !== "COMPLETED");
  const dbCompletedTournaments = currentModeTournaments.filter((t) => t.status === "COMPLETED");

  const formatDate = (dateString?: string) => {
    if (!dateString) return "TBD";
    return new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  };

  if (loading) {
    return (
      <div style={{ background: "#050505" }} className="flex min-h-screen items-center justify-center relative overflow-hidden">
        <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.02]" style={{ backgroundImage: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.85) 100%)" }} />
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center h-24 w-24 mb-6">
            <div className="absolute inset-0 rounded-full loader-ring-outer" />
            <div className="absolute h-20 w-20 rounded-full loader-ring-inner" />
            <div className="absolute flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-900 border border-orange-500/30 shadow-lg shadow-orange-500/10 loader-icon-pulse">
              <Trophy className="h-7 w-7 text-orange-500" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 loader-text-shimmer">
            Loading Tournament Platform...
          </p>
        </div>
      </div>
    );
  }

  if (error && tournaments.length === 0) {
    return (
      <div style={{ background: "#050505" }} className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8 max-w-md">
          <Trophy className="mx-auto h-12 w-12 text-red-500/50 mb-4 animate-pulse" />
          <h3 className="font-kanit font-black italic text-2xl text-white uppercase tracking-wide">
            Connection Problem
          </h3>
          <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
            {error}
          </p>
          <p className="mt-2 text-xs text-neutral-500 leading-relaxed">
            The server may be waking up from sleep mode (Render free tier). Please try again.
          </p>
          <button
            onClick={() => {
              window.location.reload();
            }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 hover:bg-orange-600 px-5 py-2.5 text-sm font-black uppercase text-black transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#050505" }} className="min-h-screen text-slate-100 font-sans selection:bg-orange-500 selection:text-black relative overflow-x-hidden">

      {/* ── GLOBAL BG LAYERS ── */}
      {/* Geometric diamond pattern */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          opacity: 0.035,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpolygon points='40,4 76,40 40,76 4,40' fill='none' stroke='%23ff6a00' stroke-width='0.6'/%3E%3Cpolygon points='40,18 62,40 40,62 18,40' fill='none' stroke='%23ff6a00' stroke-width='0.35'/%3E%3C/svg%3E")`,
          backgroundSize: "80px 80px",
        }}
      />
      {/* Vignette */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.75) 100%)" }}
      />

      {/* ── HERO SECTION ── */}
      <div className="relative" style={{ minHeight: "82vh" }}>
        {/* Ambient glow blob — centre */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "-80px", left: "50%", transform: "translateX(-50%)",
            width: "900px", height: "600px",
            background: "radial-gradient(ellipse, rgba(255,106,0,0.10) 0%, transparent 68%)",
            filter: "blur(50px)",
          }}
        />
        {/* Left orange glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "60px", left: "-80px",
            width: "500px", height: "450px",
            background: "radial-gradient(ellipse, rgba(255,78,0,0.07) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
        {/* Glowing floating background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {staticParticles.map((p, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.left}%`,
                top: `${p.top}%`,
                background: "radial-gradient(circle, #ff8c00 0%, #ff4e00 100%)",
                boxShadow: "0 0 8px rgba(255,106,0,0.8), 0 0 16px rgba(255,78,0,0.4)",
                opacity: 0,
                animation: `floatParticle ${p.duration}s ease-in-out infinite`,
                animationDelay: `${p.delay}s`,
                ...({ "--sway": `${p.sway}px` } as React.CSSProperties),
              }}
            />
          ))}
        </div>
        {/* Bottom fade to page bg */}
        <div
          className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none z-[2]"
          style={{ background: "linear-gradient(to bottom, transparent, #050505)" }}
        />

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12" style={{ minHeight: "82vh", display: "flex", flexDirection: "column" }}>

          {/* Error banner */}
          {error && (
            <div className="mt-4 rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-center">
              <p className="text-sm font-semibold text-red-400">{error}</p>
            </div>
          )}

          {/* ── NAV PILL ── */}
          <div className="flex justify-center pt-6 pb-4">
            <div
              className="flex items-center gap-1 rounded-full p-1.5"
              style={{
                background: "rgba(10,8,6,0.88)",
                border: "1px solid rgba(255,106,0,0.18)",
                backdropFilter: "blur(20px)",
                boxShadow: "0 4px 30px rgba(0,0,0,0.6), 0 0 40px rgba(255,106,0,0.06), inset 0 1px 0 rgba(255,255,255,0.03)",
              }}
            >
              {/* VSA */}
              <button
                onClick={() => setActiveTab("VSA")}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all duration-300 active:scale-95 cursor-pointer"
                style={
                  activeTab === "VSA"
                    ? {
                      background: "linear-gradient(135deg,#ff4e00,#ff8c00,#ff6a00)",
                      color: "#050505",
                      boxShadow: "0 0 18px rgba(255,106,0,0.45), 0 0 50px rgba(255,106,0,0.14)",
                    }
                    : { color: "rgba(255,255,255,0.35)" }
                }
              >
                <Crosshair className="h-3.5 w-3.5" />
                VSA
              </button>
              {/* H2H */}
              <button
                onClick={() => setActiveTab("H2H")}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all duration-300 active:scale-95 cursor-pointer"
                style={
                  activeTab === "H2H"
                    ? {
                      background: "linear-gradient(135deg,#ff4e00,#ff8c00,#ff6a00)",
                      color: "#050505",
                      boxShadow: "0 0 18px rgba(255,106,0,0.45), 0 0 50px rgba(255,106,0,0.14)",
                    }
                    : { color: "rgba(255,255,255,0.35)" }
                }
              >
                <Swords className="h-3.5 w-3.5" />
                H2H
              </button>
              {/* Admin */}
              <Link
                href="/admin"
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[11px] font-black uppercase tracking-[0.14em] transition-all duration-300 active:scale-95"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <Settings className="h-3.5 w-3.5" />
                Admin
              </Link>
            </div>
          </div>

          {/* ── HERO BODY — split left logo / right headline ── */}
          <div className="flex-grow flex items-center">
            <div className="w-full grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-10 lg:gap-16 items-center pb-20 pt-8">

              {/* LEFT — Logo */}
              <div className="flex justify-center lg:justify-start">
                <div className="relative flex items-center justify-center" style={{ width: 300, height: 300 }}>
                  {/* Glow behind logo */}
                  <div
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse, rgba(255,106,0,0.22) 0%, transparent 68%)",
                      filter: "blur(28px)",
                      animation: "logoPulse 4s ease-in-out infinite",
                    }}
                  />
                  {/* VSA logo (pointing to h2h-logo.png artwork) */}
                  <img
                    src="/S43_vsa.png"
                    alt="VSA"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-700"
                    style={{
                      opacity: activeTab === "VSA" ? 1 : 0,
                      transform: activeTab === "VSA" ? "scale(1)" : "scale(0.88)",
                      filter: "drop-shadow(0 0 30px rgba(255,106,0,0.38)) drop-shadow(0 6px 20px rgba(0,0,0,0.9))",
                    }}
                  />
                  {/* H2H logo (pointing to vsa-logo.png artwork) */}
                  <img
                    src="/S43_h2h.png"
                    alt="H2H"
                    className="absolute inset-0 w-full h-full object-contain transition-all duration-700"
                    style={{
                      opacity: activeTab === "H2H" ? 1 : 0,
                      transform: activeTab === "H2H" ? "scale(1)" : "scale(0.88)",
                      filter: "drop-shadow(0 0 30px rgba(255,106,0,0.38)) drop-shadow(0 6px 20px rgba(0,0,0,0.9))",
                    }}
                  />
                </div>
              </div>

              {/* RIGHT — Headline + subtitle */}
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left min-w-0">
                {/* Label */}
                <div className="flex items-center gap-2.5 mb-5">
                  <span
                    className="h-2 w-2 rounded-full bg-orange-500"
                    style={{ boxShadow: "0 0 8px rgba(255,106,0,0.8)" }}
                  />
                  <span className="text-[10px] sm:text-[11px] font-black tracking-[0.32em] text-neutral-400 uppercase">
                    EA Sports FC Mobile
                  </span>
                </div>

                {/* Headline — contained, never clips */}
                <h1
                  className="font-kanit font-black italic uppercase leading-[0.88] tracking-tight w-full pl-[0.08em]"
                  style={{
                    fontSize: "clamp(2.5rem, 6.2vw, 6.2rem)",
                    background: "linear-gradient(175deg, #ffad4d 0%, #ff6a00 35%, #e04800 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "none",
                    filter: "drop-shadow(0 0 35px rgba(255,106,0,0.25))",
                  }}
                >
                  League<br />Tournaments
                </h1>

                {/* Subtitle */}
                <p className="mt-6 text-sm sm:text-base text-neutral-500 font-medium leading-relaxed max-w-[480px]">
                  The official S43 tournament platform
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT SECTIONS ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pb-24">

        {/* Section divider glow */}
        <div
          className="mb-16 h-px"
          style={{
            background: "linear-gradient(to right, transparent, rgba(255,106,0,0.25) 30%, rgba(255,106,0,0.4) 50%, rgba(255,106,0,0.25) 70%, transparent)",
          }}
        />

        {/* ── ONGOING TOURNAMENTS ── */}
        <section className="mb-20">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span
                className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"
                style={{ boxShadow: "0 0 10px #10b981" }}
              />
              <h2 className="font-kanit font-black italic text-lg sm:text-xl text-white uppercase tracking-wider">
                Ongoing Tournaments
              </h2>
            </div>
            <span className="text-[10px] font-black tracking-[0.22em] text-neutral-600 uppercase">
              {activeTab} Bracket
            </span>
          </div>

          {dbOngoingTournaments.length === 0 ? (
            <div
              className="rounded-2xl p-12 sm:p-16 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(15,11,8,0.92) 0%, rgba(8,5,3,0.97) 100%)",
                border: "1px solid rgba(255,106,0,0.14)",
                boxShadow: "0 0 60px rgba(255,78,0,0.04), 0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02)",
              }}
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{ background: "linear-gradient(to right, transparent, rgba(255,106,0,0.35), transparent)" }}
              />
              {/* Trophy */}
              <div
                className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
                style={{
                  background: "rgba(12,8,5,0.92)",
                  border: "2px solid rgba(255,106,0,0.35)",
                  boxShadow: "0 0 25px rgba(255,106,0,0.12), inset 0 0 15px rgba(255,106,0,0.05)",
                  animation: "glowPulse 3s ease-in-out infinite",
                }}
              >
                <Trophy className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="mt-8 font-kanit font-black italic text-2xl sm:text-3xl text-white uppercase tracking-wide">
                No Active Tournaments
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm text-neutral-600 font-medium leading-relaxed">
                No active tournaments currently ongoing. Check back soon — the next showdown is on its way.
              </p>
              <div className="flex items-center justify-center gap-4 mt-10">
                <span className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(255,106,0,0.4))" }} />
                <span className="text-[10px] font-black tracking-[0.28em] text-orange-500/70 uppercase">Stay Tuned</span>
                <span className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(255,106,0,0.4))" }} />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {dbOngoingTournaments.map((t) => (
                <Link
                  key={t._id}
                  href={`/tournaments/${t._id}`}
                  className="group flex flex-col justify-between rounded-2xl p-8 relative overflow-hidden animated-card-ongoing min-h-[220px]"
                >
                  {/* Parallax Logo Background */}
                  <div className="absolute top-0 right-0 bottom-0 w-[45%] pointer-events-none overflow-hidden select-none z-0">
                    {/* Ambient Back Glow */}
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-[#ff6a00]/12 filter blur-2xl group-hover:bg-[#ff6a00]/22 transition-all duration-500" />
                    
                    {/* Parallax Logo Image */}
                    <div 
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-28 h-28 opacity-20 group-hover:opacity-40 group-hover:scale-112 group-hover:-translate-x-2 group-hover:-translate-y-[45%] transition-all duration-500 ease-out"
                    >
                      {t.logoUrl ? (
                        <img 
                          src={t.logoUrl} 
                          alt="" 
                          className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(255,106,0,0.2)]" 
                        />
                      ) : (
                        <Trophy className="w-full h-full text-[#ff6a00]/40 filter drop-shadow-[0_0_15px_rgba(255,106,0,0.1)]" />
                      )}
                    </div>
                  </div>

                  {/* Main Content (z-10) */}
                  <div className="relative z-10 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-2 max-w-[65%]">
                        <span className="inline-flex w-fit items-center gap-1 rounded bg-orange-950/40 border border-orange-500/20 px-2 py-0.5 text-[8px] font-black tracking-wider text-orange-400 uppercase">
                          <span className="h-1 w-1 rounded-full bg-orange-400 animate-pulse" />
                          {t.status === "DRAFT" ? "DRAFTING" : "LIVE"}
                        </span>
                        <h4 className="font-kanit font-black italic text-lg sm:text-xl text-white uppercase tracking-wide leading-tight group-hover:text-orange-400 transition-colors break-words">
                          {t.name}
                        </h4>
                      </div>

                      <div className="mt-6 space-y-2.5 max-w-[65%]">
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-400">
                          <Zap className="h-4 w-4 text-orange-500/60" />
                          <span>{t.totalGroups > 1 ? `Two Stage ${t.mode}` : `${t.mode} Format`}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-400">
                          <Users className="h-4 w-4 text-orange-500/60" />
                          <span>{t.totalGroups > 1 ? `${t.totalGroups} Groups` : `${t.totalPlayers} Teams`}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 flex items-center justify-between text-xs font-black uppercase text-orange-500 group-hover:text-orange-400 transition-colors" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span>View Tournament</span>
                      <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── PAST TOURNAMENTS ── */}
        <section>
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="h-2.5 w-2.5 rounded-full bg-neutral-700" style={{ boxShadow: "0 0 6px rgba(255,255,255,0.05)" }} />
              <h2 className="font-kanit font-black italic text-lg sm:text-xl text-white uppercase tracking-wider">
                Past Tournaments
              </h2>
            </div>
            <span className="text-[10px] font-black tracking-[0.22em] text-neutral-600 uppercase">Archive</span>
          </div>

          {dbCompletedTournaments.length === 0 ? (
            <div
              className="rounded-2xl p-12 sm:p-16 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(180deg, rgba(12,9,8,0.9), rgba(6,4,3,0.96))",
                border: "1px solid rgba(255,255,255,0.05)",
                boxShadow: "0 12px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.01)",
              }}
            >
              <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent)" }} />
              <div
                className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-2xl"
                style={{ background: "rgba(12,8,5,0.9)", border: "2px solid rgba(255,255,255,0.07)" }}
              >
                <Trophy className="h-8 w-8 text-neutral-600" />
              </div>
              <h3 className="mt-8 font-kanit font-black italic text-2xl sm:text-3xl text-neutral-500 uppercase tracking-wide">
                No Completed Tournaments
              </h3>
              <p className="mx-auto mt-4 max-w-md text-sm text-neutral-700 font-medium leading-relaxed">
                No completed leagues or tournaments recorded yet. Active tournaments will appear here once finalized.
              </p>
              <div className="flex items-center justify-center gap-4 mt-10">
                <span className="h-px w-12" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.12))" }} />
                <span className="text-[10px] font-black tracking-[0.28em] text-neutral-600 uppercase">Coming Soon</span>
                <span className="h-px w-12" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.12))" }} />
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {dbCompletedTournaments.map((t) => (
                <Link
                  key={t._id}
                  href={`/tournaments/${t._id}`}
                  className="group flex flex-col justify-between rounded-2xl p-8 relative overflow-hidden animated-card-completed min-h-[220px]"
                >
                  {/* Parallax Logo Background */}
                  <div className="absolute top-0 right-0 bottom-0 w-[45%] pointer-events-none overflow-hidden select-none z-0">
                    {/* Ambient Back Glow */}
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-white/5 filter blur-2xl group-hover:bg-white/10 transition-all duration-500" />
                    
                    {/* Parallax Logo Image */}
                    <div 
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-28 h-28 opacity-15 group-hover:opacity-35 group-hover:scale-112 group-hover:-translate-x-2 group-hover:-translate-y-[45%] transition-all duration-500 ease-out"
                    >
                      {t.logoUrl ? (
                        <img 
                          src={t.logoUrl} 
                          alt="" 
                          className="w-full h-full object-contain filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-500" 
                        />
                      ) : (
                        <Trophy className="w-full h-full text-white/30" />
                      )}
                    </div>
                  </div>

                  {/* Main Content (z-10) */}
                  <div className="relative z-10 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col gap-2 max-w-[65%]">
                        <span className="inline-flex w-fit items-center gap-1 rounded bg-emerald-950/20 border border-emerald-500/20 px-2 py-0.5 text-[8px] font-black tracking-wider text-emerald-400 uppercase">
                          COMPLETED
                        </span>
                        <h4 className="font-kanit font-black italic text-lg sm:text-xl text-white uppercase tracking-wide leading-tight group-hover:text-orange-400 transition-colors break-words">
                          {t.name}
                        </h4>
                      </div>

                      <div className="mt-6 space-y-2.5 max-w-[65%]">
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-500">
                          <Zap className="h-4 w-4 text-orange-500/40" />
                          <span>{t.totalGroups > 1 ? `Two Stage ${t.mode}` : `${t.mode} Format`}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-500">
                          <Users className="h-4 w-4 text-orange-500/40" />
                          <span>{t.totalGroups > 1 ? `${t.totalGroups} Groups` : `${t.totalPlayers} Teams`}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-xs font-semibold text-neutral-500">
                          <Calendar className="h-4 w-4 text-orange-500/40" />
                          <span>{formatDate(t.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                      <span className="text-[10px] font-black tracking-wider text-neutral-600 uppercase">CHAMPION</span>
                      <span
                        className="text-sm font-black uppercase font-kanit italic"
                        style={{
                          background: "linear-gradient(135deg,#ff6a00,#ff8c1a)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                        }}
                      >
                        {t.champion || "TBD"}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Keyframe animations (inline style tag) */}
      <style>{`
        @keyframes logoPulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50%       { opacity: 1;    transform: scale(1.06); }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,106,0,0.28), 0 0 50px rgba(255,106,0,0.09); }
          50%       { box-shadow: 0 0 30px rgba(255,106,0,0.5),  0 0 70px rgba(255,106,0,0.15); }
        }
        @keyframes floatParticle {
          0% {
            transform: translateY(120px) translateX(0px);
            opacity: 0;
          }
          15% {
            opacity: 0.6;
          }
          85% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-220px) translateX(var(--sway));
            opacity: 0;
          }
        }
        .animated-card-ongoing {
          background: linear-gradient(160deg, rgba(15,11,8,0.95), rgba(8,5,3,0.98));
          border: 1px solid rgba(255, 106, 0, 0.15);
          box-shadow: 0 8px 30px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.02);
          animation: cardBorderPulseOngoing 4s infinite ease-in-out;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animated-card-ongoing:hover {
          animation: cardBorderActiveOngoing 1.5s infinite alternate ease-in-out;
          border-color: rgba(255, 106, 0, 0.55) !important;
          transform: translateY(-5px);
        }
        @keyframes cardBorderPulseOngoing {
          0%, 100% {
            border-color: rgba(255, 106, 0, 0.12);
            box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 12px rgba(255,106,0,0.04), inset 0 1px 0 rgba(255,255,255,0.02);
          }
          50% {
            border-color: rgba(255, 106, 0, 0.35);
            box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 24px rgba(255,106,0,0.2), inset 0 1px 0 rgba(255,255,255,0.02);
          }
        }
        @keyframes cardBorderActiveOngoing {
          0% {
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 15px rgba(255, 106, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.03);
          }
          100% {
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 35px rgba(255, 106, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.03);
          }
        }
        .animated-card-completed {
          background: linear-gradient(160deg, rgba(12,9,8,0.95), rgba(6,4,3,0.98));
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 30px rgba(0,0,0,0.5);
          animation: cardBorderPulseCompleted 6s infinite ease-in-out;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .animated-card-completed:hover {
          animation: cardBorderActiveCompleted 1.5s infinite alternate ease-in-out;
          border-color: rgba(255, 106, 0, 0.35) !important;
          transform: translateY(-5px);
        }
        @keyframes cardBorderPulseCompleted {
          0%, 100% {
            border-color: rgba(255, 255, 255, 0.04);
            box-shadow: 0 8px 30px rgba(0,0,0,0.5);
          }
          50% {
            border-color: rgba(255, 255, 255, 0.12);
            box-shadow: 0 8px 30px rgba(0,0,0,0.5), 0 0 18px rgba(255,255,255,0.03);
          }
        }
        @keyframes cardBorderActiveCompleted {
          0% {
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 12px rgba(255, 106, 0, 0.12);
          }
          100% {
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6), 0 0 28px rgba(255, 106, 0, 0.35);
          }
        }
      `}</style>
    </div>
  );
}
