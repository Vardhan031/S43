"use client";

import type { Group } from "@/services/api";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

interface GroupGridProps {
  groups: Group[];
}

export default function GroupGrid({ groups }: GroupGridProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl">
        <p className="text-sm text-zinc-500">
          No group pools generated yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {groups.map((group, groupIndex) => (
        <motion.div
          key={group._id}
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.04 }}
          whileHover={{ y: -4 }}
          className="
            group relative overflow-hidden rounded-3xl
            border border-white/[0.08]
            bg-gradient-to-b from-[#060404] to-[#000000]
            p-5
            backdrop-blur-2xl
            transition-all duration-300
            hover:border-orange-500/30
            hover:shadow-[0_0_45px_rgba(212,175,55,0.12)]
          "
        >
          {/* Background Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,175,55,0.10),transparent_55%)] opacity-80" />

          {/* Left Accent */}
          <div className="absolute left-0 top-0 h-full w-[2px] bg-gradient-to-b from-[#ff4e00] via-[#ff8c00] to-transparent opacity-70" />

          <div className="relative z-10">
            {/* Header */}
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div
                    className="
                      grid h-10 w-10 place-items-center rounded-2xl
                      bg-gradient-to-br from-[#ff4e00] to-[#ff8c00]
                      text-sm font-black text-slate-950
                      shadow-[0_0_20px_rgba(212,175,55,0.25)]
                    "
                  >
                    {group.groupName.replace("Group ", "")}
                  </div>

                  <div>
                    <h3 className="text-lg font-black uppercase tracking-[0.15em] text-white">
                      {group.groupName}
                    </h3>

                    <p className="text-[9px] uppercase tracking-[0.25em] text-zinc-500">
                      Pool Stage
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="
                  flex items-center gap-1.5 rounded-full
                  border border-white/10
                  bg-white/[0.04]
                  px-2.5 py-1
                  text-[10px] font-bold uppercase tracking-wide
                  text-zinc-400
                "
              >
                <Users className="h-3 w-3" />
                {group.participants.length}
              </div>
            </div>

            {/* Players */}
            <div className="space-y-2.5">
              {group.participants.map((player, index) => (
                <motion.div
                  key={player._id}
                  whileHover={{ x: 3 }}
                  className="
                    relative overflow-hidden rounded-2xl
                    border border-white/[0.05]
                    bg-white/[0.025]
                    px-3 py-3
                    transition-all duration-300
                    hover:border-orange-500/20
                    hover:bg-orange-500/[0.04]
                  "
                >
                  {/* subtle glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/[0.03] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      {/* Seed Box */}
                      <div
                        className={`
                          grid h-8 w-8 shrink-0 place-items-center rounded-xl
                          text-[11px] font-black
                          ${index < 2
                            ? "bg-gradient-to-br from-emerald-500/25 to-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-gradient-to-br from-orange-500/20 to-[#ff8c00]/10 text-orange-400 border border-orange-500/10"
                          }
                        `}
                      >
                        {index + 1}
                      </div>

                      {/* Player Name */}
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-zinc-100">
                          {player.displayName}
                        </p>

                        <p className="text-[9px] uppercase tracking-[0.18em] text-zinc-500">
                          Competitor
                        </p>
                      </div>
                    </div>

                    {/* Seed */}
                    <div
                      className={`
                        rounded-full px-2 py-1
                        text-[9px] font-black uppercase tracking-[0.12em]
                        ${index < 2
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/15"
                          : "bg-white/[0.03] text-zinc-500 border border-white/[0.05]"
                        }
                      `}
                    >
                      #{index + 1}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
