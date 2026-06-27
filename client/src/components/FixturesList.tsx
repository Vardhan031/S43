"use client";

import type { Match } from "@/services/api";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

interface FixturesListProps {
  matches: Match[];
}

interface Matchup {
  id: string;
  player1: Match["participant1"];
  player2: Match["participant2"];
  leg1: Match | null;
  leg2: Match | null;
}

export default function FixturesList({
  matches,
}: FixturesListProps) {
  const [activeGroup, setActiveGroup] =
    useState<string | "ALL">(
      "ALL"
    );

  const [expandedMatchups, setExpandedMatchups] =
    useState<Record<string, boolean>>({});

  const toggleMatchup = (id: string) => {
    setExpandedMatchups((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Group Stage Only
  const groupMatches =
    useMemo(() => {
      return matches.filter(
        (m) => !m.isKnockout
      );
    }, [matches]);

  // Unique Groups
  const groups = useMemo(() => {
    const groupIds =
      new Set<string>(
        groupMatches
          .map((m) => m.groupId)
          .filter(
            (
              id
            ): id is string =>
              Boolean(id)
          )
      );

    return Array.from(groupIds);
  }, [groupMatches]);

  // Filtered Matches
  const filteredMatches =
    useMemo(() => {
      if (activeGroup === "ALL") {
        return groupMatches;
      }

      return groupMatches.filter(
        (m) =>
          m.groupId ===
          activeGroup
      );
    }, [
      groupMatches,
      activeGroup,
    ]);

  // Group and Consolidate Matches by opponent matchup
  const matchupsByGroup = useMemo(() => {
    const map: Record<string, Matchup[]> = {};

    // First group the individual matches by groupId
    const groupedMatches: Record<string, Match[]> = {};
    filteredMatches.forEach((m) => {
      const gId = m.groupId || "Unknown";
      if (!groupedMatches[gId]) {
        groupedMatches[gId] = [];
      }
      groupedMatches[gId].push(m);
    });

    // For each group, consolidate the matches into Matchups
    Object.keys(groupedMatches).forEach((gId) => {
      const groupMatches = groupedMatches[gId];
      const matchupsMap: Record<string, Matchup> = {};

      groupMatches.forEach((m) => {
        const p1Id = m.participant1?._id;
        const p2Id = m.participant2?._id;
        if (!p1Id || !p2Id) return; // Skip invalid match

        const matchupKey = [p1Id, p2Id].sort().join("_");

        if (!matchupsMap[matchupKey]) {
          matchupsMap[matchupKey] = {
            id: matchupKey,
            player1: null,
            player2: null,
            leg1: null,
            leg2: null,
          };
        }

        const matchup = matchupsMap[matchupKey];

        if (m.legNumber === 1) {
          matchup.leg1 = m;
          matchup.player1 = m.participant1;
          matchup.player2 = m.participant2;
        } else if (m.legNumber === 2) {
          matchup.leg2 = m;
        }
      });

      // Post-process matchups to fill in fallback player1 and player2 if leg 1 is missing
      const consolidatedList: Matchup[] = [];
      Object.keys(matchupsMap).forEach((mKey) => {
        const matchup = matchupsMap[mKey];
        if (!matchup.player1 && matchup.leg2) {
          matchup.player1 = matchup.leg2.participant2;
          matchup.player2 = matchup.leg2.participant1;
        }
        consolidatedList.push(matchup);
      });

      map[gId] = consolidatedList;
    });

    return map;
  }, [filteredMatches]);

  if (groupMatches.length === 0) {
    return (
      <div className="esports-card rounded-3xl p-10 text-center">
        <p className="text-sm font-semibold text-slate-500">
          No fixtures have been generated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="flex flex-wrap gap-1.5 pb-2">
        <button
          onClick={() =>
            setActiveGroup("ALL")
          }
          className={`
            whitespace-nowrap rounded-xl md:rounded-2xl
            border px-3 md:px-5 py-1.5 md:py-2.5
            text-[10px] md:text-xs font-black uppercase tracking-wider
            transition-all duration-300
            ${activeGroup === "ALL"
            ? `
                border-orange-500/20
                bg-gradient-to-r
                from-[#ff4e00]
                to-[#ff8c00]
                text-slate-950
                font-black
                shadow-[0_0_25px_rgba(212,175,55,0.25)]
              `
            : `
                border-white/5
                bg-[#050505]
                text-slate-400
                hover:border-orange-500/10
                hover:text-white
              `
          }
          `}
        >
          All Groups
        </button>

        {groups.map(
          (groupId, index) => (
            <button
              key={groupId}
              onClick={() =>
                setActiveGroup(
                  groupId
                )
              }
              className={`
                whitespace-nowrap rounded-xl md:rounded-2xl
                border px-3 md:px-5 py-1.5 md:py-2.5
                text-[10px] md:text-xs font-black uppercase tracking-wider
                transition-all duration-300
                ${activeGroup ===
                  groupId
                  ? `
                      border-orange-500/20
                      bg-gradient-to-r
                      from-[#ff4e00]
                      to-[#ff8c00]
                      text-slate-950
                      font-black
                      shadow-[0_0_25px_rgba(212,175,55,0.25)]
                    `
                  : `
                      border-white/5
                      bg-[#050505]
                      text-slate-400
                      hover:border-orange-500/10
                      hover:text-white
                    `
                }
              `}
            >
              Group{" "}
              {String.fromCharCode(
                65 + index
              )}
            </button>
          )
        )}
      </div>

      {/* Fixtures */}
      <div className="space-y-10">
        {Object.keys(
          matchupsByGroup
        ).map((groupKey, index) => {
          const groupMatchups =
            matchupsByGroup[
            groupKey
            ] || [];

          const totalMatchesCount = groupMatchups.reduce(
            (acc, m) => acc + (m.leg1 ? 1 : 0) + (m.leg2 ? 1 : 0),
            0
          );

          return (
            <div
              key={groupKey}
              className="space-y-5"
            >
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-white/5 pb-3">
                <h3 className="text-lg font-black uppercase tracking-wide text-[#ff8c00]">
                  Group{" "}
                  {String.fromCharCode(
                    65 + index
                  )}
                </h3>

                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {groupMatchups.length} Matchups ({totalMatchesCount} Legs)
                </span>
              </div>

              {/* Cards */}
              <div className="max-w-3xl mx-auto space-y-4">
                {groupMatchups.map((matchup) => {
                  const isExpanded = !!expandedMatchups[matchup.id];
                  const leg1 = matchup.leg1;
                  const leg2 = matchup.leg2;

                  const hasCompletedLeg =
                    (leg1?.status === "COMPLETED") ||
                    (leg2?.status === "COMPLETED");

                  const score1 = hasCompletedLeg
                    ? (leg1?.status === "COMPLETED" ? (leg1.score1 ?? 0) : 0) +
                      (leg2?.status === "COMPLETED" ? (leg2.score2 ?? 0) : 0)
                    : "-";

                  const score2 = hasCompletedLeg
                    ? (leg1?.status === "COMPLETED" ? (leg1.score2 ?? 0) : 0) +
                      (leg2?.status === "COMPLETED" ? (leg2.score1 ?? 0) : 0)
                    : "-";

                  const player1Name = matchup.player1?.displayName || "TBD";
                  const player2Name = matchup.player2?.displayName || "TBD";

                  return (
                    <div key={matchup.id} className="space-y-3">
                      {/* Aggregate Score Card */}
                      <div
                        onClick={() => toggleMatchup(matchup.id)}
                        className="
                          relative overflow-hidden rounded-2xl
                          border border-orange-500/10
                          bg-[#050505]
                          p-5 text-center
                          shadow-[0_0_30px_rgba(212,175,55,0.02)]
                          transition-all duration-300
                          hover:border-orange-500/30 hover:shadow-[0_0_40px_rgba(212,175,55,0.08)]
                          cursor-pointer
                          select-none
                        "
                      >
                        {/* Glow */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.06),transparent_60%)] opacity-70" />

                        {/* Accent border top */}
                        <div className="absolute left-0 top-0 h-[1.5px] w-full bg-gradient-to-r from-transparent via-[#ff4e00]/60 to-transparent opacity-80" />

                        <div className="relative z-10 space-y-1">
                          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            Aggregate Score
                          </div>
                          <div className="text-3xl font-black bg-gradient-to-r from-[#ff4e00] to-[#ff8c00] bg-clip-text text-transparent font-mono tracking-wider">
                            {score1} : {score2}
                          </div>
                          <div className="flex items-center justify-center gap-3 text-sm font-bold text-slate-200 mt-2">
                            <span className="truncate max-w-[150px] text-right flex-1">{player1Name}</span>
                            <span className="text-xs font-black uppercase tracking-widest text-[#ff4e00]/80">vs</span>
                            <span className="truncate max-w-[150px] text-left flex-1">{player2Name}</span>
                          </div>
                        </div>
                      </div>

                      {/* Legs Details */}
                      {isExpanded && (
                        <div className="grid gap-3 grid-cols-2">
                          {/* Leg 1 Box */}
                          {leg1 && (
                            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214] p-4 text-center shadow-md">
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Leg 1</div>
                              <div className="my-2 text-xl font-extrabold text-[#ff8c00] font-mono">
                                {leg1.status === "COMPLETED"
                                  ? `${leg1.score1} - ${leg1.score2}`
                                  : "vs"}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                <span className="font-bold text-slate-300">{player1Name} Home</span>
                                <span className="text-slate-600 mx-1">vs</span>
                                <span className="font-bold text-slate-300">{player2Name} Away</span>
                              </div>
                            </div>
                          )}

                          {/* Leg 2 Box */}
                          {leg2 && (
                            <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#121214] p-4 text-center shadow-md">
                              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Leg 2</div>
                              <div className="my-2 text-xl font-extrabold text-[#ff8c00] font-mono">
                                {leg2.status === "COMPLETED"
                                  ? `${leg2.score2} - ${leg2.score1}`
                                  : "vs"}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                <span className="font-bold text-slate-300">{player1Name} Away</span>
                                <span className="text-slate-600 mx-1">vs</span>
                                <span className="font-bold text-slate-300">{player2Name} Home</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
