import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Tournament, Match, StandingGroup, KnockoutRound } from "../types";
import {
  tournamentService,
  matchService,
  standingsService,
  knockoutService
} from "../services/firebaseService";

import StandingsTable from "../components/StandingsTable";
import FixturesList from "../components/FixturesList";
import KnockoutBracket from "../components/KnockoutBracket";

import {
  ArrowLeft,
  Calendar,
  Trophy,
  Crown,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TournamentDetails() {
  const { id } = useParams<{ id: string }>();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [standings, setStandings] = useState<StandingGroup[]>([]);
  const [knockoutRounds, setKnockoutRounds] = useState<KnockoutRound[]>([]);

  const [activeTab, setActiveTab] = useState<"standings" | "fixtures" | "knockout">("standings");
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>("ALL");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);

    const unsubTourney = tournamentService.subscribeById(id, (t) => {
      setTournament(t);
      if (!t) setError("Tournament not found");
      setLoading(false);
      clearTimeout(timer);
    });

    const unsubMatches = matchService.subscribeByTournament(id, async (mList) => {
      setMatches(mList);

      try {
        const sList = await standingsService.calculateStandings(id);
        setStandings(sList);
      } catch (err) {
        console.error("Error calculating standings:", err);
      }

      try {
        const kRounds = await knockoutService.getKnockoutRounds(id);
        setKnockoutRounds(kRounds);
      } catch (err) {
        console.error("Error getting knockout rounds:", err);
      }
    });

    return () => {
      unsubTourney();
      unsubMatches();
      clearTimeout(timer);
    };
  }, [id]);

  // Compute displayed standings based on group filter
  const displayedStandings = standings.filter(
    (g) => selectedGroupFilter === "ALL" || g.groupId === selectedGroupFilter
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050505] text-[#ffd700] relative overflow-hidden">
        <div className="relative z-10 flex flex-col items-center">
          <div className="relative flex items-center justify-center h-20 w-20 mb-4">
            <div className="absolute inset-0 rounded-full border-2 border-[#ffd700]/30 animate-ping" />
            <div className="absolute flex h-14 w-14 items-center justify-center rounded-2xl bg-[#0d1017] border border-[#ffd700] shadow-[0_0_30px_rgba(255,215,0,0.3)]">
              <Trophy className="h-7 w-7 text-[#ffd700]" />
            </div>
          </div>
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#ffd700]">
            Loading Tournament Broadcast...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#040507] px-4">
        <div className="rounded-3xl border border-[#ffd700]/30 bg-[#0d1017] p-8 text-center max-w-md shadow-2xl">
          <ShieldAlert className="h-10 w-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-black uppercase text-white mb-2">Tournament Not Found</h2>
          <p className="text-xs text-slate-400 font-medium mb-6">
            The requested tournament ID may have been deleted or reset.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-2.5 text-xs font-black uppercase text-black hover:brightness-110 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-slate-100 selection:bg-orange-500 selection:text-black pb-24 relative overflow-x-hidden">
      {/* Background Ambient Radial Glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px]"
          style={{
            background: "radial-gradient(ellipse at top, rgba(255,106,0,0.10) 0%, transparent 70%)",
            filter: "blur(60px)"
          }}
        />
      </div>

      {/* =========================================================================
         FOREGROUND UI COMPONENTS
         ========================================================================= */}

      {/* Sleek Top Header Bar */}
      <header className="relative z-20 border-b border-[#ffd700]/20 bg-[#07090e]/90 backdrop-blur-md py-4 px-4 sm:px-8 shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[#ffd700]/40 bg-[#121722] px-3.5 py-2 text-xs font-black uppercase tracking-wider text-[#ffd700] hover:text-white hover:border-[#ffd700] hover:scale-105 transition duration-200 shadow-md"
            >
              <ArrowLeft className="h-4 w-4 text-[#ffd700]" />
              Back
            </Link>

            <div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#ff8c00]">
                <Sparkles className="h-3 w-3 text-[#ffd700]" />
                Tournament Details
              </div>
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white drop-shadow-md">
                {tournament.name}
              </h1>
            </div>
          </div>

          {/* Right Header Actions: Winner Badge */}
          {tournament.champion && (
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-xl border border-[#ffd700] bg-emerald-950/60 px-3.5 py-2 text-xs font-black uppercase tracking-wider text-emerald-400 shadow-lg">
                <Crown className="h-4 w-4 text-emerald-400" />
                Winner: {tournament.champion}
              </span>
            </div>
          )}

        </div>
      </header>

      {/* Navigation Tabs Header & Interactive Filter Bar */}
      <div className="relative z-10 border-b border-[#ffd700]/20 bg-[#06080e]/95 backdrop-blur-md py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {[
              { id: "standings" as const, label: "1. Standings", icon: Trophy, count: standings.length },
              { id: "fixtures" as const, label: "2. Fixtures", icon: Calendar, count: matches.length },
              { id: "knockout" as const, label: "3. Knockouts", icon: Crown, count: knockoutRounds.length }
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider transition-colors duration-200 shrink-0 cursor-pointer select-none ${
                    isActive ? "text-black font-black" : "text-slate-400 hover:text-white"
                  }`}
                >
                  {/* Smooth Sliding Active Pill Background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeTournamentTabPill"
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 shadow-[0_0_20px_rgba(255,120,0,0.35)] z-0"
                      transition={{ type: "spring", bounce: 0.15, duration: 0.35 }}
                    />
                  )}

                  {/* Inactive Tab Border & Background */}
                  {!isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-[#0f131d]/90 border border-[#ffd700]/20 hover:border-[#ffd700]/50 -z-10 transition-colors" />
                  )}

                  <span className="relative z-10 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                    {tab.count > 0 && (
                      <span
                        className={`ml-1 rounded-full px-2 py-0.5 text-[10px] font-black transition-colors ${
                          isActive ? "bg-black/20 text-black" : "bg-[#ffd700]/10 text-[#ffd700]"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Group Filter Pills (Active when Standings tab is open) */}
          {activeTab === "standings" && standings.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#ffd700]/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mr-1 hidden md:inline">
                Filter:
              </span>
              <button
                onClick={() => setSelectedGroupFilter("ALL")}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                  selectedGroupFilter === "ALL"
                    ? "bg-[#ff5500] text-black shadow-md shadow-orange-500/30"
                    : "bg-[#0d1017] border border-[#ffd700]/20 text-slate-400 hover:text-white"
                }`}
              >
                All Groups
              </button>
              {standings.map((g) => (
                <button
                  key={g.groupId}
                  onClick={() => setSelectedGroupFilter(g.groupId)}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition cursor-pointer ${
                    selectedGroupFilter === g.groupId
                      ? "bg-[#ff5500] text-black shadow-md shadow-orange-500/30"
                      : "bg-[#0d1017] border border-[#ffd700]/20 text-slate-400 hover:text-white"
                  }`}
                >
                  {g.groupName.replace("Group ", "G-")}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Tab Content Display with Animated Transitions */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab + selectedGroupFilter}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {activeTab === "fixtures" && (
              <FixturesList
                matches={matches}
                groups={standings}
              />
            )}

            {activeTab === "standings" && (
              <div className="space-y-6">
                {displayedStandings.length === 0 ? (
                  <div className="rounded-3xl border border-[#ffd700]/30 bg-[#090d16]/90 p-12 text-center shadow-2xl backdrop-blur-xl">
                    <Trophy className="h-10 w-10 text-[#ffd700]/60 mx-auto mb-3" />
                    <h3 className="text-base font-black uppercase text-white mb-1">
                      No Standings Available
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">
                      Groups have not been generated yet for this tournament.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
                    {displayedStandings.map((groupStanding) => (
                      <StandingsTable
                        key={groupStanding.groupId}
                        group={groupStanding}
                        qualificationCount={tournament.qualificationCount}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "knockout" && <KnockoutBracket rounds={knockoutRounds} />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
