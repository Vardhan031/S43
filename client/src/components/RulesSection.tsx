import React from "react";
import {
  BookOpen,
  Users,
  Trophy,
  Scale,
  ShieldAlert,
  CheckCircle2,
  Sparkles
} from "lucide-react";

export default function RulesSection() {
  return (
    <section id="rules" className="mb-20 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400">
            <BookOpen className="h-3.5 w-3.5" />
          </span>
          <h2 className="font-extrabold text-lg sm:text-xl text-white uppercase tracking-wider">
            Tournament Rules
          </h2>
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-neutral-500 uppercase">
          Official H2H Guidelines
        </span>
      </div>

      {/* Main Container Card */}
      <div className="relative rounded-3xl bg-neutral-950/70 border border-orange-500/20 p-6 sm:p-8 lg:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

        {/* Welcome Intro */}
        <div className="mb-8 rounded-2xl p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
          <p className="text-sm sm:text-base font-semibold text-neutral-200 leading-relaxed">
            Welcome to <span className="text-orange-400 font-black">S43 H2H tournament</span>. You're already familiar with some of the rules, but let me briefly review them here.
          </p>
        </div>

        {/* 2-Column Grid of Rules */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Card 1: Group System */}
          <div className="rounded-2xl p-6 bg-neutral-900/50 border border-neutral-800/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/15 text-orange-400">
                  <Users className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-base uppercase tracking-wider text-white">
                  Group System & Format
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                First and foremost, we've decided to work with a group system, for obvious reasons. Players who have an off day can still recover in the following matches and don't have to immediately worry about elimination.
              </p>

              <div className="mt-4 space-y-2.5 text-xs text-neutral-300">
                <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                  <span className="font-bold text-orange-400 block mb-0.5">Group Allocation</span>
                  We're working with a group system (group A-B-C...) and the number of groups and players per group will be decided based on the number of registrations.
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-neutral-800">
                  <span className="font-bold text-orange-400 block mb-0.5">Fixtures</span>
                  Each team can play twice (home & away) against an opponent from their group.
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs sm:text-sm text-amber-200">
              <Trophy className="h-5 w-5 text-amber-400 shrink-0" />
              <span>The <strong className="text-white">2 teams with the most points</strong> after the group matches qualify for the quarter-finals.</span>
            </div>
          </div>

          {/* Card 2: Points System */}
          <div className="rounded-2xl p-6 bg-neutral-900/50 border border-neutral-800/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Scale className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-base uppercase tracking-wider text-white">
                  Points System & Aggregate
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs text-neutral-400 font-medium">Old school vibes:</span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-bold text-xs">
                  3 pts for W
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold text-xs">
                  1 pt for D
                </span>
                <span className="px-3 py-1 rounded-lg bg-red-500/15 border border-red-500/30 text-red-400 font-bold text-xs">
                  0 pts for L
                </span>
              </div>

              {/* Aggregate Explanation */}
              <div className="p-4 rounded-xl bg-black/40 border border-orange-500/15 space-y-2 text-xs">
                <div className="font-bold text-orange-400">No Aggregate in Group Matches:</div>
                <p className="text-neutral-400">For example:</p>
                <div className="font-mono bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 text-neutral-300 space-y-1">
                  <div>Team X - Team Y; 2-1</div>
                  <div>Team Y - Team X; 3-0</div>
                </div>
                <p className="text-neutral-400 pt-1">
                  If you were using the aggregate system, this would be a 4-2 score for Team Y, but we won't be doing that. Each team receives points for its match, but Team Y simply advances to the next matches with a better goal difference.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-900 border border-neutral-800 text-xs text-neutral-300">
              <span className="text-amber-400 font-bold">Tiebreaker:</span> Aggregate only occurs if there is an equal number of points and goal difference between two teams after all group matches have been completed.
            </div>
          </div>

          {/* Card 3: Fair Play & Anti-Toxic Guidelines */}
          <div className="rounded-2xl p-6 bg-neutral-900/50 border border-neutral-800/80 space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-500/15 text-red-400">
                <ShieldAlert className="h-4 w-4" />
              </span>
              <h3 className="font-extrabold text-base uppercase tracking-wider text-white">
                Fair Play (Anti-Toxic Rules)
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400">
              As indicated in previous announcements, we try to avoid toxic play, which means:
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-bold text-red-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px]">1</span>
                <span>No Lob/Kick-off Spam</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-bold text-red-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px]">2</span>
                <span>No Cross Spam</span>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs font-bold text-red-300">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 text-[10px]">3</span>
                <span>No Backpassing</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-black/40 border border-neutral-800 text-xs text-neutral-400">
              <strong className="text-white">Skill Moves:</strong> There is no limit on other skill moves.
            </div>
          </div>

          {/* Card 4: Match Verification & Tournament Spirit */}
          <div className="rounded-2xl p-6 bg-neutral-900/50 border border-neutral-800/80 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
                <h3 className="font-extrabold text-base uppercase tracking-wider text-white">
                  Match Verification & Philosophy
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Matches will be verified and results will be pushed to the website.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/15 to-amber-500/10 border border-orange-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-wider">
                <Sparkles className="h-4 w-4 text-orange-400" />
                <span>Tournament Spirit</span>
              </div>
              <p className="text-xs sm:text-sm text-orange-100 font-medium">
                Remember, we're organizing this to bring some fun to the game. So try and experience it!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
