"use client";

import { useMemo, useState } from "react";
import type { Match, StandingGroup } from "../types";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FixturesListProps {
  matches: Match[];
  groups?: StandingGroup[];
}

interface Matchup {
  id: string;
  player1Name: string;
  player2Name: string;
  leg1: Match | null;
  leg2: Match | null;
}

export default function FixturesList({ matches, groups }: FixturesListProps) {
  const [activeGroup, setActiveGroup] = useState<string | "ALL">("ALL");
  const [expandedMatchups, setExpandedMatchups] = useState<Record<string, boolean>>({});

  const toggleMatchup = (id: string) => {
    setExpandedMatchups((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Group Stage Only
  const groupMatches = useMemo(() => {
    return matches.filter((m) => !m.isKnockout);
  }, [matches]);

  // List of group IDs and names sorted
  const groupsList = useMemo(() => {
    if (groups && groups.length > 0) {
      return groups.map((g) => ({
        id: g.groupId,
        name: g.groupName
      }));
    }

    const groupIds = new Set<string>();
    groupMatches.forEach((m) => {
      if (m.groupId) groupIds.add(m.groupId);
    });

    const sortedGroupIds = Array.from(groupIds).sort();
    return sortedGroupIds.map((id, index) => ({
      id,
      name: `Group ${String.fromCharCode(65 + index)}`
    }));
  }, [groupMatches, groups]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    if (activeGroup === "ALL") {
      return groupMatches;
    }
    return groupMatches.filter((m) => m.groupId === activeGroup);
  }, [groupMatches, activeGroup]);

  // Group and Consolidate Matches into Home & Away Leg Matchups
  const matchupsByGroup = useMemo(() => {
    const map: Record<string, Matchup[]> = {};

    const groupedMatches: Record<string, Match[]> = {};
    filteredMatches.forEach((m) => {
      const gId = m.groupId || "Unknown";
      if (!groupedMatches[gId]) {
        groupedMatches[gId] = [];
      }
      groupedMatches[gId].push(m);
    });

    Object.keys(groupedMatches).forEach((gId) => {
      const gMatches = groupedMatches[gId];
      const matchupsMap: Record<string, Matchup> = {};

      gMatches.forEach((m) => {
        const p1 = m.participant1Name || "TBD";
        const p2 = m.participant2Name || "TBD";
        if (!p1 || !p2) return;

        const p1Key = m.legNumber === 1 ? p1 : p2;
        const p2Key = m.legNumber === 1 ? p2 : p1;
        const matchupKey = [p1Key, p2Key].sort().join("_vs_");

        if (!matchupsMap[matchupKey]) {
          matchupsMap[matchupKey] = {
            id: matchupKey,
            player1Name: p1Key,
            player2Name: p2Key,
            leg1: null,
            leg2: null
          };
        }

        const matchup = matchupsMap[matchupKey];

        if (m.legNumber === 1) {
          matchup.leg1 = m;
          matchup.player1Name = m.participant1Name || p1Key;
          matchup.player2Name = m.participant2Name || p2Key;
        } else if (m.legNumber === 2) {
          matchup.leg2 = m;
        }
      });

      map[gId] = Object.values(matchupsMap);
    });

    return map;
  }, [filteredMatches]);

  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(matchupsByGroup);
    return keys.sort((a, b) => {
      const idxA = groupsList.findIndex((g) => g.id === a);
      const idxB = groupsList.findIndex((g) => g.id === b);
      return idxA - idxB;
    });
  }, [matchupsByGroup, groupsList]);

  if (groupMatches.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-[#07090e] p-10 text-center">
        <p className="text-sm font-extrabold text-neutral-500 uppercase tracking-wider">
          No fixtures have been generated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Group Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveGroup("ALL")}
          className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            activeGroup === "ALL"
              ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
              : "border border-neutral-800 bg-[#0d111a] text-neutral-400 hover:text-white"
          }`}
        >
          All Groups
        </button>

        {groupsList.map((group) => (
          <button
            key={group.id}
            onClick={() => setActiveGroup(group.id)}
            className={`rounded-full px-5 py-2.5 text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
              activeGroup === group.id
                ? "bg-orange-500 text-black shadow-md shadow-orange-500/20"
                : "border border-neutral-800 bg-[#0d111a] text-neutral-400 hover:text-white"
            }`}
          >
            {group.name}
          </button>
        ))}
      </div>

      {/* Fixtures Groups List */}
      <div className="space-y-10">
        {sortedGroupKeys.map((groupKey) => {
          const groupMatchups = matchupsByGroup[groupKey] || [];
          const totalLegsCount = groupMatchups.reduce(
            (acc, m) => acc + (m.leg1 ? 1 : 0) + (m.leg2 ? 1 : 0),
            0
          );
          const groupName = groupsList.find((g) => g.id === groupKey)?.name || `Group ${groupKey}`;

          return (
            <div key={groupKey} className="space-y-6">
              {/* Group Section Header */}
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-orange-500">
                  {groupName}
                </h3>
                <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-500">
                  {groupMatchups.length} Matchups ({totalLegsCount} Legs)
                </span>
              </div>

              {/* Matchups Container */}
              <div className="max-w-3xl mx-auto space-y-6">
                {groupMatchups.map((matchup) => {
                  const isExpanded = !!expandedMatchups[matchup.id];
                  const leg1 = matchup.leg1;
                  const leg2 = matchup.leg2;

                  const p1 = matchup.player1Name;
                  const p2 = matchup.player2Name;

                  const hasCompletedLeg =
                    leg1?.status === "COMPLETED" || leg2?.status === "COMPLETED";

                  const score1 = hasCompletedLeg
                    ? (leg1?.status === "COMPLETED" ? (leg1.score1 ?? 0) : 0) +
                      (leg2?.status === "COMPLETED" ? (leg2.score2 ?? 0) : 0)
                    : null;

                  const score2 = hasCompletedLeg
                    ? (leg1?.status === "COMPLETED" ? (leg1.score2 ?? 0) : 0) +
                      (leg2?.status === "COMPLETED" ? (leg2.score1 ?? 0) : 0)
                    : null;

                  return (
                    <div key={matchup.id} className="space-y-3">
                      {/* Aggregate Score Main Card (Pressable to Pop Legs) */}
                      <div
                        onClick={() => toggleMatchup(matchup.id)}
                        className="rounded-2xl border border-neutral-800 bg-[#07090e] p-6 text-center shadow-lg relative cursor-pointer select-none hover:border-orange-500/40 transition-all group"
                      >
                        <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1 flex items-center justify-center gap-1.5">
                          <span>Aggregate Score</span>
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5 text-orange-500" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-neutral-500 group-hover:text-orange-500 transition" />
                          )}
                        </div>

                        <div className="text-3xl font-black text-orange-500 tracking-widest font-mono my-2">
                          {hasCompletedLeg ? `${score1} : ${score2}` : "- : -"}
                        </div>

                        <div className="flex items-center justify-center gap-2 text-sm font-black text-white">
                          <span className="truncate max-w-[180px] text-right">{p1}</span>
                          <span className="text-xs font-black uppercase text-orange-500 px-1">VS</span>
                          <span className="truncate max-w-[180px] text-left">{p2}</span>
                        </div>

                        <div className="mt-3 text-[10px] font-black uppercase tracking-wider text-neutral-500 group-hover:text-orange-400 transition">
                          {isExpanded ? "Click to collapse legs ▲" : "Click to view legs ▼"}
                        </div>
                      </div>

                      {/* Popped Leg 1 & Leg 2 Breakdown Boxes */}
                      {isExpanded && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 origin-top transition-all duration-300">
                          {/* Leg 1 Box */}
                          <div className="rounded-xl border border-neutral-800/80 bg-[#0d111a] p-4 text-center shadow-sm">
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                              Leg 1
                            </div>
                            <div className="text-xl font-extrabold text-orange-500 font-mono my-1">
                              {leg1?.status === "COMPLETED"
                                ? `${leg1.score1} - ${leg1.score2}`
                                : "-"}
                            </div>
                            <div className="text-xs font-black text-white truncate flex items-center justify-center gap-1.5 flex-wrap">
                              <span>{p1}</span>
                              <span className="text-orange-500 font-black uppercase text-[9px] bg-orange-500/15 border border-orange-500/40 px-1.5 py-0.5 rounded tracking-wider">HOME</span>
                              <span className="text-neutral-500 font-extrabold mx-0.5">vs</span>
                              <span>{p2}</span>
                              <span className="text-orange-500 font-black uppercase text-[9px] bg-orange-500/15 border border-orange-500/40 px-1.5 py-0.5 rounded tracking-wider">AWAY</span>
                            </div>
                          </div>

                          {/* Leg 2 Box */}
                          <div className="rounded-xl border border-neutral-800/80 bg-[#0d111a] p-4 text-center shadow-sm">
                            <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 mb-1">
                              Leg 2
                            </div>
                            <div className="text-xl font-extrabold text-orange-500 font-mono my-1">
                              {leg2?.status === "COMPLETED"
                                ? `${leg2.score2} - ${leg2.score1}`
                                : "-"}
                            </div>
                            <div className="text-xs font-black text-white truncate flex items-center justify-center gap-1.5 flex-wrap">
                              <span>{p1}</span>
                              <span className="text-orange-500 font-black uppercase text-[9px] bg-orange-500/15 border border-orange-500/40 px-1.5 py-0.5 rounded tracking-wider">AWAY</span>
                              <span className="text-neutral-500 font-extrabold mx-0.5">vs</span>
                              <span>{p2}</span>
                              <span className="text-orange-500 font-black uppercase text-[9px] bg-orange-500/15 border border-orange-500/40 px-1.5 py-0.5 rounded tracking-wider">HOME</span>
                            </div>
                          </div>
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
