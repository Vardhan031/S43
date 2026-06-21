"use client";

import type { KnockoutRound } from "@/services/api";

import {
  Crown,
  Star,
} from "lucide-react";

interface KnockoutBracketProps {
  rounds: KnockoutRound[];
}

export default function KnockoutBracket({
  rounds,
}: KnockoutBracketProps) {
  if (!rounds || rounds.length === 0) {
    return (
      <div className="esports-card rounded-3xl p-10 text-center">
        <p className="text-sm font-semibold text-slate-500">
          Knockout bracket has not been generated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="scrollbar-thin overflow-x-auto pb-6">
      <div className="flex min-w-max items-stretch gap-10 px-4 py-4">
        {rounds.map(
          (round, roundIndex) => {
            const spacingClass =
              roundIndex === 0
                ? "space-y-6"
                : roundIndex === 1
                  ? "space-y-16 py-8"
                  : "space-y-36 py-20";

            return (
              <div
                key={round._id}
                className="flex w-80 shrink-0 flex-col"
              >
                {/* Header */}
                <div className="mb-5 flex items-center justify-between border-b border-white/5 pb-3">
                  <div>
                    <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.18em] text-[#ff8c00]">
                      <Star className="h-4 w-4 text-[#ff4e00]" />
                      {round.roundName}
                    </h3>

                    <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                      Knockout Stage
                    </p>
                  </div>

                  <span className="rounded-full border border-orange-500/20 bg-orange-950/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400">
                    {round.matches.length}{" "}
                    Match
                    {round.matches.length >
                      1
                      ? "es"
                      : ""}
                  </span>
                </div>

                {/* Matches */}
                <div
                  className={`flex flex-1 flex-col justify-around ${spacingClass}`}
                >
                  {round.matches.map(
                    (m) => {
                      const complete =
                        m.status ===
                        "COMPLETED";

                      const p1Winner =
                        complete &&
                        (m.score1 ??
                          0) >
                        (m.score2 ??
                          0);

                      const p2Winner =
                        complete &&
                        (m.score2 ??
                          0) >
                        (m.score1 ??
                          0);

                      return (
                        <div
                          key={m._id}
                          className="
                            relative overflow-hidden rounded-3xl
                            border border-white/5
                            bg-gradient-to-b
                            from-[#060404]
                            to-[#000000]
                            p-5
                            shadow-[0_0_40px_rgba(212,175,55,0.04)]
                            transition-all duration-300
                            hover:border-orange-500/30
                            hover:shadow-[0_0_60px_rgba(212,175,55,0.12)]
                          "
                        >
                          {/* Glow */}
                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_60%)] opacity-70" />

                          {/* Top Accent */}
                          <div className="absolute left-0 top-0 h-[2px] w-full bg-gradient-to-r from-[#ff4e00] via-[#ff8c00] to-transparent opacity-80" />

                          <div className="relative z-10">
                            {/* Match Header */}
                            <div className="mb-4 flex items-center justify-between">
                              <span className="rounded-full border border-white/5 bg-white/[0.03] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                                {m.knockoutLabel ||
                                  "KO"}
                              </span>

                              <span
                                className={`text-[10px] font-black uppercase tracking-[0.18em] ${complete
                                    ? "text-emerald-400"
                                    : "animate-pulse text-orange-400"
                                  }`}
                              >
                                {m.status}
                              </span>
                            </div>

                            {/* Players */}
                            <div className="space-y-3">
                              {/* Player 1 */}
                              <div
                                className={`
                                  flex items-center justify-between
                                  rounded-2xl
                                  border
                                  px-3 py-3
                                  transition-all
                                  ${p1Winner
                                    ? `
                                      border-emerald-500/20
                                      bg-emerald-500/[0.05]
                                      text-emerald-400
                                    `
                                    : `
                                      border-white/[0.04]
                                      bg-white/[0.02]
                                      text-slate-300
                                    `
                                  }
                                `}
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  {p1Winner && (
                                    <Crown className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                  )}

                                  <span className="truncate text-sm font-bold">
                                    {m
                                      .participant1
                                      ?.displayName ||
                                      "TBD"}
                                  </span>
                                </div>

                                <span className="ml-3 text-lg font-black">
                                  {complete &&
                                    m.score1 !==
                                    null
                                    ? m.score1
                                    : "-"}
                                </span>
                              </div>

                              {/* Player 2 */}
                              <div
                                className={`
                                  flex items-center justify-between
                                  rounded-2xl
                                  border
                                  px-3 py-3
                                  transition-all
                                  ${p2Winner
                                    ? `
                                      border-emerald-500/20
                                      bg-emerald-500/[0.05]
                                      text-emerald-400
                                    `
                                    : `
                                      border-white/[0.04]
                                      bg-white/[0.02]
                                      text-slate-300
                                    `
                                  }
                                `}
                              >
                                <div className="flex min-w-0 items-center gap-2">
                                  {p2Winner && (
                                    <Crown className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                                  )}

                                  <span className="truncate text-sm font-bold">
                                    {m
                                      .participant2
                                      ?.displayName ||
                                      "TBD"}
                                  </span>
                                </div>

                                <span className="ml-3 text-lg font-black">
                                  {complete &&
                                    m.score2 !==
                                    null
                                    ? m.score2
                                    : "-"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}
