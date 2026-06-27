"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Tournament,
  Match,
  StandingGroup,
  KnockoutRound,

  tournamentService,
  matchService,
  standingsService,
  knockoutService,
} from "@/services/api";

import StandingsTable from "@/components/StandingsTable";
import FixturesList from "@/components/FixturesList";
import KnockoutBracket from "@/components/KnockoutBracket";

import {
  ArrowLeft,
  Calendar,
  Trophy,
  Users,
  Award,
  Star,
} from "lucide-react";

interface Props {
  params: Promise<{
    id: string;
  }>;
}

export default function TournamentDetailsPage({
  params,
}: Props) {
  const { id } = use(params);

  const [tournament, setTournament] =
    useState<Tournament | null>(null);

  const [matches, setMatches] =
    useState<Match[]>([]);

  const [standings, setStandings] =
    useState<StandingGroup[]>([]);

  const [knockoutRounds, setKnockoutRounds] =
    useState<KnockoutRound[]>([]);

  const [activeTab, setActiveTab] =
    useState<
      "fixtures" | "standings" | "knockout"
    >("standings");

  const [selectedStandingsGroup, setSelectedStandingsGroup] =
    useState<string>("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const tourney =
          await tournamentService.getById(
            id
          );

        setTournament(tourney);

        const [
          matchesData,
          standingsData,
          knockoutData,
        ] = await Promise.allSettled([
          matchService.getByTournament(id),

          standingsService.getByTournament(
            id
          ),

          knockoutService.getByTournament(
            id
          ),
        ]);

        if (
          matchesData.status ===
          "fulfilled"
        ) {
          setMatches(matchesData.value);
        }

        if (
          standingsData.status ===
          "fulfilled"
        ) {
          setStandings(
            standingsData.value
          );
        }

        if (
          knockoutData.status ===
          "fulfilled"
        ) {
          setKnockoutRounds(
            knockoutData.value
          );
        }

        setError(null);
      } catch (err) {
        console.error(err);

        setError(
          "Failed to load tournament."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id]);

  useEffect(() => {
    if (standings.length > 0 && !selectedStandingsGroup) {
      setSelectedStandingsGroup(standings[0].groupId);
    }
  }, [standings, selectedStandingsGroup]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black relative overflow-hidden">
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
            Loading Tournament Details...
          </p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 text-center">
          <p className="text-sm font-semibold text-red-400">
            {error ||
              "Tournament not found"}
          </p>

          <Link
            href="/"
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>
    );
  }

  const getStatusLabel = (
    status: Tournament["status"]
  ) => {
    switch (status) {
      case "DRAFT":
        return "Draft";

      case "GROUPS_GENERATED":
        return "Groups Ready";

      case "FIXTURES_ACTIVE":
        return "League Stage";

      case "KNOCKOUTS_ACTIVE":
        return "Knockouts";

      case "COMPLETED":
        return "Completed";

      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-black pb-20">
      {/* Header */}
      <div className="border-b border-slate-900 bg-black/85 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:text-orange-400"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-lg border border-orange-500/20 bg-orange-950/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#ff4e00]">
                  {tournament.mode}
                </span>

                <span className="rounded-lg border border-slate-800 bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {getStatusLabel(
                    tournament.status
                  )}
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-black tracking-tight text-white font-kanit italic uppercase">
                {tournament.name}
              </h1>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Players
                </div>

                <div className="mt-1 flex items-center gap-2 text-lg font-black text-white">
                  <Users className="h-5 w-5 text-[#ff4e00]" />
                  {tournament.totalPlayers}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Groups
                </div>

                <div className="mt-1 flex items-center gap-2 text-lg font-black text-white">
                  <Award className="h-5 w-5 text-[#ff4e00]" />
                  {tournament.totalGroups}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Qualifiers
                </div>

                <div className="mt-1 flex items-center gap-2 text-lg font-black text-white">
                  <Trophy className="h-5 w-5 text-[#ff4e00]" />
                  Top{" "}
                  {
                    tournament.qualificationCount
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 grid grid-cols-3 gap-1.5 sm:flex sm:gap-2 w-full sm:w-auto">
            {[
              {
                key: "standings",
                label: "Standings",
                icon: Trophy,
              },

              {
                key: "fixtures",
                label: "Fixtures",
                icon: Calendar,
              },

              {
                key: "knockout",
                label: "Knockouts",
                icon: Star,
              },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  onClick={() =>
                    setActiveTab(
                      tab.key as
                      | "fixtures"
                      | "standings"
                      | "knockout"
                    )
                  }
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border px-2 sm:px-4 py-2 text-[11px] sm:text-sm font-black uppercase tracking-wider transition ${activeTab === tab.key
                    ? "border-orange-500 text-orange-400 bg-orange-950/20"
                    : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:text-white"
                    }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {activeTab ===
          "fixtures" && (
            <FixturesList
              matches={matches}
            />
          )}

        {activeTab ===
          "standings" && (
            <div className="space-y-6">
              {standings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/20 p-10 text-center">
                  <p className="text-sm text-slate-500">
                    No standings yet.
                  </p>
                </div>
              ) : (
                <>
                  {/* Standings Group Selector for Mobile */}
                  <div className="flex md:hidden flex-wrap gap-1.5 pb-2">
                    {standings.map((g) => (
                      <button
                        key={g.groupId}
                        onClick={() => setSelectedStandingsGroup(g.groupId)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition ${
                          selectedStandingsGroup === g.groupId
                            ? "bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] text-slate-950 font-black shadow-lg shadow-[0_0_15px_rgba(212,175,55,0.25)]"
                            : "border border-slate-800 bg-[#050505] text-slate-400 hover:text-white"
                        }`}
                      >
                        {g.groupName}
                      </button>
                    ))}
                  </div>

                  {/* Desktop Grid Layout */}
                  <div className="hidden md:grid gap-6 md:grid-cols-2">
                    {standings.map((groupStanding) => (
                      <StandingsTable
                        key={groupStanding.groupId}
                        group={groupStanding}
                        qualificationCount={tournament.qualificationCount}
                      />
                    ))}
                  </div>

                  {/* Mobile Selected Group Layout */}
                  <div className="block md:hidden">
                    {standings
                      .filter((gs) => gs.groupId === selectedStandingsGroup)
                      .map((groupStanding) => (
                        <StandingsTable
                          key={groupStanding.groupId}
                          group={groupStanding}
                          qualificationCount={tournament.qualificationCount}
                        />
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

        {activeTab ===
          "knockout" && (
            <KnockoutBracket
              rounds={knockoutRounds}
            />
          )}
      </div>
    </div>
  );
}