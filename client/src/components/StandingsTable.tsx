"use client";

import type { StandingGroup } from "@/services/api";
import { motion } from "framer-motion";

interface StandingsTableProps {
  group: StandingGroup;
  qualificationCount?: number;
}

export default function StandingsTable({
  group,
  qualificationCount = 2,
}: StandingsTableProps) {
  if (!group) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="
        relative overflow-hidden rounded-3xl
        border border-white/10
        bg-gradient-to-b from-[#060404] to-[#000000]
        p-4 md:p-5
        shadow-[0_0_60px_rgba(212,175,55,0.08)]
        backdrop-blur-2xl
      "
    >
      {/* Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,175,55,0.10),transparent_45%)]" />

      {/* Blend */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ff4e00]/[0.03] via-transparent to-[#ff8c00]/[0.03]" />

      {/* Header */}
      <div className="relative z-10 mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="
              grid h-11 w-11 place-items-center rounded-2xl
              bg-gradient-to-br from-[#ff4e00] to-[#ff8c00]
              text-base font-black text-slate-950
              shadow-[0_0_25px_rgba(212,175,55,0.3)]
            "
          >
            {group.groupName.replace("Group ", "")}
          </div>

          <div>
            <h3 className="text-lg font-black uppercase tracking-wide text-white md:text-2xl">
              {group.groupName}
            </h3>

            <p className="text-[9px] uppercase tracking-[0.22em] text-zinc-500 md:text-[10px]">
              Live Rankings
            </p>
          </div>
        </div>

        <div className="hidden md:block text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">
          Top {qualificationCount} Qualify
        </div>
      </div>



      {/* Table */}
      {/* Table */}
      <div className="relative z-10 overflow-hidden rounded-2xl border border-white/[0.04] bg-black/20">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left">
            <thead>
              <tr className="border-b border-white/5 text-[8px] uppercase tracking-[0.14em] text-zinc-500 md:text-[10px]">
                <th className="w-[40px] px-1 py-3 text-center">#</th>

                <th className="px-2 py-3 text-left">Player</th>

                <th className="w-[38px] px-1 py-3 text-center">P</th>
                <th className="w-[38px] px-1 py-3 text-center">W</th>
                <th className="w-[38px] px-1 py-3 text-center">D</th>
                <th className="w-[38px] px-1 py-3 text-center">L</th>
                <th className="w-[42px] px-1 py-3 text-center">GF</th>
                <th className="w-[42px] px-1 py-3 text-center">GA</th>
                <th className="w-[42px] px-1 py-3 text-center">GD</th>

                <th className="w-[50px] px-1 py-3 text-center text-[#ff8c00]">
                  PTS
                </th>
              </tr>
            </thead>

            <tbody>
              {group.standings.map((row) => {
                const isQualified =
                  row.position <= qualificationCount;

                return (
                  <motion.tr
                    key={row.participantId}
                    whileHover={{
                      backgroundColor:
                        "rgba(255,255,255,0.02)",
                    }}
                    transition={{ duration: 0.2 }}
                    className={`
                border-b border-white/[0.03]
                transition-all duration-300
                ${isQualified
                        ? "bg-emerald-500/[0.03] border-l-2 border-l-emerald-400"
                        : "bg-transparent"
                      }
              `}
                  >
                    {/* Position */}
                    <td className="px-1 py-3 text-center">
                      <div
                        className={`
                    mx-auto grid h-7 w-7 place-items-center rounded-lg
                    text-[11px] font-black transition-all duration-300
                    ${isQualified
                            ? "border border-emerald-500/20 bg-emerald-500/15 text-emerald-400 shadow-[0_0_18px_rgba(16,185,129,0.18)]"
                            : "border border-white/[0.04] bg-white/[0.03] text-zinc-500"
                          }
                  `}
                      >
                        {row.position}
                      </div>
                    </td>

                    {/* Player */}
                    <td className="min-w-0 px-2 py-3">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate text-[11px] font-semibold text-zinc-100 md:text-sm">
                          {row.displayName}
                        </span>

                        {isQualified && (
                          <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-1 py-0.5 text-[7px] font-black uppercase tracking-wide text-emerald-400">
                            Q
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Stats */}
                    <td className="px-1 py-3 text-center text-[10px] text-zinc-400 md:text-xs">
                      {row.played}
                    </td>

                    <td className="px-1 py-3 text-center text-[10px] font-semibold text-emerald-400 md:text-xs">
                      {row.wins}
                    </td>

                    <td className="px-1 py-3 text-center text-[10px] text-zinc-400 md:text-xs">
                      {row.draws}
                    </td>

                    <td className="px-1 py-3 text-center text-[10px] font-semibold text-rose-400 md:text-xs">
                      {row.losses}
                    </td>

                    <td className="px-1 py-3 text-center text-[10px] text-zinc-400 md:text-xs">
                      {row.goalsFor}
                    </td>

                    <td className="px-1 py-3 text-center text-[10px] text-zinc-400 md:text-xs">
                      {row.goalsAgainst}
                    </td>

                    <td
                      className={`px-1 py-3 text-center text-[10px] font-bold md:text-xs ${row.goalDifference > 0
                        ? "text-emerald-400"
                        : row.goalDifference < 0
                          ? "text-rose-400"
                          : "text-zinc-400"
                        }`}
                    >
                      {row.goalDifference > 0
                        ? `+${row.goalDifference}`
                        : row.goalDifference}
                    </td>

                    {/* Points */}
                    <td className="px-1 py-3 text-center text-sm font-black text-[#ff8c00] md:text-base">
                      {row.points}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
