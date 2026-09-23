import React from "react";
import {
  BookOpen,
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
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <BookOpen className="h-4 w-4" />
          </span>
          <h2 className="font-extrabold text-lg sm:text-xl text-white uppercase tracking-wider">
            Tournament Rules
          </h2>
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-orange-400/80 uppercase">
          S43 H2H Official
        </span>
      </div>

      {/* Main Rules Content Card */}
      <div className="relative rounded-3xl bg-neutral-950/80 border border-orange-500/25 p-6 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)] overflow-hidden">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

        <div className="max-w-4xl mx-auto space-y-7 text-neutral-300 text-sm sm:text-base leading-relaxed">
          {/* Welcome Intro */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent border border-orange-500/25">
            <p className="font-bold text-white sm:text-lg">
              Welcome to <span className="text-orange-400">S43 H2H tournament</span>. You're already familiar with some of the rules, but let me briefly review them here.
            </p>
          </div>

          {/* Group System Section */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-orange-400 font-extrabold uppercase text-xs sm:text-sm tracking-wider">
              <Trophy className="h-4 w-4" />
              <span>Group System & Qualification</span>
            </div>

            <p>
              First and foremost, we've decided to work with a group system, for obvious reasons. Players who have an off day can still recover in the following matches and don't have to immediately worry about elimination.
            </p>

            <p>
              We're working with a group system (group A-B-C...) and the number of groups and players per group will be decided based on the number of registrations.
            </p>

            <p>
              Each team can play twice (home & away) against an opponent from their group.
            </p>

            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 font-bold text-white flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-orange-400" />
              <span>The 2 teams with the most points after the group matches qualify for the quarter-finals.</span>
            </div>
          </div>

          {/* Points System Section */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-extrabold uppercase text-xs sm:text-sm tracking-wider">
              <Scale className="h-4 w-4" />
              <span>About the points system;</span>
            </div>

            <p className="font-medium text-white">
              Old school vibes; <span className="text-emerald-400 font-bold">3 points for W</span>, <span className="text-amber-400 font-bold">1 point for D</span>, and <span className="text-red-400 font-bold">0 points for L</span>.
            </p>

            <p>
              There is also no aggregate in group matches; for example:
            </p>

            {/* Score Box */}
            <div className="rounded-xl bg-black/60 border border-orange-500/20 p-4 font-mono text-sm sm:text-base text-neutral-200 space-y-1.5 w-fit min-w-[240px]">
              <div className="flex items-center justify-between gap-6">
                <span>Team X - Team Y;</span>
                <span className="text-orange-400 font-bold">2-1</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span>Team Y - Team X;</span>
                <span className="text-orange-400 font-bold">3-0</span>
              </div>
            </div>

            <p>
              If you were using the aggregate system, this would be a 4-2 score for Team Y, but we won't be doing that. Each team receives points for its match, but Team Y simply advances to the next matches with a better goal difference.
            </p>

            <div className="p-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs sm:text-sm text-neutral-300">
              <strong className="text-amber-400">Aggregate rule:</strong> Aggregate only occurs if there is an equal number of points and goal difference between two teams after all group matches have been completed.
            </div>
          </div>

          {/* Fair Play & Anti-Toxic Section */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-red-400 font-extrabold uppercase text-xs sm:text-sm tracking-wider">
              <ShieldAlert className="h-4 w-4" />
              <span>Fair Play & Anti-Toxic Guidelines</span>
            </div>

            <p className="font-medium text-white">
              As indicated in previous announcements, we try to avoid toxic play, which means:
            </p>

            <div className="grid sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 font-semibold text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-xs">1</span>
                <span>No Lob/Kick-off Spam</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 font-semibold text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-xs">2</span>
                <span>No Cross Spam</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/30 border border-red-500/30 text-red-200 font-semibold text-sm">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-xs">3</span>
                <span>No Backpassing</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 italic">
              There is no limit on other skill moves.
            </p>
          </div>

          {/* Verification & Closing */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <p className="font-semibold text-white">
                Matches will be verified and results will be pushed to the website.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-orange-400 shrink-0" />
              <p className="text-orange-200 font-bold sm:text-base">
                Remember, we're organizing this to bring some fun to the game. So try and experience it!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
