import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Tournament } from "../types";
import { tournamentService } from "../services/firebaseService";
import { Trophy, Settings, Swords, Crosshair } from "lucide-react";
import InteractiveTournamentCard from "../components/InteractiveTournamentCard";

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
  { size: 3, left: 22, top: 30, duration: 18, delay: -11, sway: 12 }
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
                background: "radial-gradient(circle, #ff8c00 0%, #ff4e00 100%)",
                boxShadow: "0 0 10px rgba(255,106,0,0.9), 0 0 20px rgba(255,78,0,0.5)",
                animationDuration: `${p.duration}s`,
                animationDelay: `${p.delay}s`
              } as React.CSSProperties}
            />
          ))}
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 lg:px-12" style={{ minHeight: "82vh", display: "flex", flexDirection: "column" }}>
          {/* NAV PILL */}
          <div className="flex justify-center pt-6 pb-4">
            <div className="flex items-center gap-1 rounded-full p-1.5" style={{ background: "rgba(10,8,6,0.88)", border: "1px solid rgba(255,106,0,0.22)", backdropFilter: "blur(20px)" }}>
              <button
                onClick={() => setActiveTab("VSA")}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer"
                style={activeTab === "VSA" ? { background: "linear-gradient(135deg,#ff4e00,#ff8c00,#ff6a00)", color: "#050505", boxShadow: "0 0 18px rgba(255,106,0,0.45)" } : { color: "rgba(255,255,255,0.35)" }}
              >
                <Crosshair className="h-3.5 w-3.5" />
                VSA
              </button>
              <button
                onClick={() => setActiveTab("H2H")}
                className="flex items-center gap-2 rounded-full px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300 cursor-pointer"
                style={activeTab === "H2H" ? { background: "linear-gradient(135deg,#ff4e00,#ff8c00,#ff6a00)", color: "#050505", boxShadow: "0 0 18px rgba(255,106,0,0.45)" } : { color: "rgba(255,255,255,0.35)" }}
              >
                <Swords className="h-3.5 w-3.5" />
                H2H
              </button>
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.14em] transition-all duration-300"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                <Settings className="h-3.5 w-3.5" />
                Admin
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
                <p className="mt-6 text-sm sm:text-base text-neutral-400 font-bold uppercase tracking-wider max-w-[480px]">
                  The official S43 tournament platform
                </p>
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
