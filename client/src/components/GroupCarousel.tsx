"use client";

import type { Group } from "@/services/api";
import { Users } from "lucide-react";

interface GroupCarouselProps {
  groups: Group[];
}

export default function GroupCarousel({ groups }: GroupCarouselProps) {
  if (groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/10">
        <p className="text-slate-500 text-sm">No group pools have been generated yet.</p>
      </div>
    );
  }

  return (
    <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {groups.map((group) => (
        <div
          key={group._id}
          className="w-[80vw] min-w-[270px] max-w-[340px] snap-center shrink-0 rounded-xl border border-slate-800 bg-slate-900/20 p-5 backdrop-blur-sm shadow-md"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-base font-black uppercase tracking-wider text-[#ff8c00]">
              {group.groupName}
            </h3>
            <span className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-500">
              <Users className="h-3.5 w-3.5" />
              {group.participants.length} Players
            </span>
          </div>

          <ol className="space-y-2">
            {group.participants.map((player, index) => (
              <li
                key={player._id}
                className="flex items-center justify-between rounded-lg bg-slate-950/60 border border-slate-800/40 px-3.5 py-2.5 text-xs text-slate-300 font-semibold"
              >
                <span className="truncate">{player.displayName}</span>
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  Seed #{index + 1}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </div>
  );
}

