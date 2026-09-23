import React from "react";
import {
  Trophy,
  ClipboardList,
  CircleDot,
  Ban,
  FileCheck2,
  PartyPopper
} from "lucide-react";

export default function RulesSection() {
  return (
    <section id="rules" className="mb-20 scroll-mt-24">
      {/* Section Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(255,106,0,0.2)]">
            <Trophy className="h-4 w-4" />
          </span>
          <h2 className="font-extrabold text-xl sm:text-2xl text-white uppercase tracking-wider">
            S43 H2H Tournament Rules
          </h2>
        </div>
        <span className="text-[10px] font-bold tracking-[0.2em] text-orange-400/90 uppercase px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/25">
          Official Guide
        </span>
      </div>

      {/* Main Rules Container */}
      <div className="relative rounded-3xl bg-neutral-950/85 border border-orange-500/25 p-6 sm:p-10 shadow-[0_12px_45px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Top accent glow line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent" />

        <div className="max-w-4xl mx-auto space-y-8 text-neutral-300 text-sm sm:text-base leading-relaxed">
          {/* Welcome Intro */}
          <div className="rounded-2xl p-5 bg-gradient-to-r from-orange-500/15 via-amber-500/5 to-transparent border border-orange-500/25">
            <p className="text-base sm:text-lg font-medium text-neutral-200">
              Welcome to the <strong className="text-white font-extrabold">S43 H2H Tournament</strong>! You&apos;re already familiar with some of the rules, but here&apos;s a quick overview.
            </p>
          </div>

          {/* 1. Tournament Format */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-black uppercase text-base tracking-wider border-b border-neutral-800 pb-3">
              <span className="text-xl">📋</span>
              <h3>Tournament Format</h3>
            </div>

            <ul className="space-y-2.5 text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>The tournament will follow a <strong className="text-white">group-stage system</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>Groups will be named <strong className="text-white">A, B, C</strong>, etc.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>The number of groups and players per group will depend on the number of registrations.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>Each team plays <strong className="text-white">twice against every opponent</strong> in their group — <strong className="text-white">Home &amp; Away</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>The <strong className="text-white">top 2 teams from each group</strong> qualify for the <strong className="text-white">Quarter-Finals</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>The group system allows players to recover from a bad match without immediate elimination.</span>
              </li>
            </ul>
          </div>

          {/* 2. Points System */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-5">
            <div className="flex items-center gap-2.5 text-white font-black uppercase text-base tracking-wider border-b border-neutral-800 pb-3">
              <span className="text-xl">⚽</span>
              <h3>Points System</h3>
            </div>

            <ul className="space-y-2 text-neutral-300">
              <li className="flex items-center gap-2.5">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong className="text-white">Win:</strong> 3 points</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong className="text-white">Draw:</strong> 1 point</span>
              </li>
              <li className="flex items-center gap-2.5">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong className="text-white">Loss:</strong> 0 points</span>
              </li>
            </ul>

            <div className="pt-2 space-y-3">
              <p>
                There is <strong className="text-white">no aggregate scoring</strong> in group matches.
              </p>

              <div>
                <p className="font-bold text-neutral-200 mb-2">Example:</p>
                <ul className="space-y-1.5 pl-2">
                  <li className="flex items-center gap-2.5 font-mono text-sm sm:text-base text-neutral-200 bg-black/50 p-2.5 rounded-lg border border-neutral-800 w-fit min-w-[220px]">
                    <span className="text-orange-400">•</span>
                    <span>Team X 2–1 Team Y</span>
                  </li>
                  <li className="flex items-center gap-2.5 font-mono text-sm sm:text-base text-neutral-200 bg-black/50 p-2.5 rounded-lg border border-neutral-800 w-fit min-w-[220px]">
                    <span className="text-orange-400">•</span>
                    <span>Team Y 3–0 Team X</span>
                  </li>
                </ul>
              </div>

              <p className="pt-1">
                The matches are treated separately for points. Team Y would simply have the better <strong className="text-white">goal difference</strong>.
              </p>

              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/25 text-neutral-200 font-medium">
                <strong className="text-white">Aggregate is used only if two teams have the same points and the same goal difference after all group matches are completed.</strong>
              </div>
            </div>
          </div>

          {/* 3. Fair Play Rules */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-black uppercase text-base tracking-wider border-b border-neutral-800 pb-3">
              <span className="text-xl">🚫</span>
              <h3>Fair Play Rules</h3>
            </div>

            <p className="font-medium text-neutral-200">
              To avoid toxic gameplay:
            </p>

            <div className="space-y-2.5 font-medium">
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/25 border border-red-500/25 text-neutral-200">
                <span className="text-neutral-400 font-bold w-4">1.</span>
                <span className="text-base">❌</span>
                <span>No Lob/Kick-off Spam</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/25 border border-red-500/25 text-neutral-200">
                <span className="text-neutral-400 font-bold w-4">2.</span>
                <span className="text-base">❌</span>
                <span>No Cross Spam</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-red-950/25 border border-red-500/25 text-neutral-200">
                <span className="text-neutral-400 font-bold w-4">3.</span>
                <span className="text-base">❌</span>
                <span>No Backpassing</span>
              </div>
              <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-neutral-200">
                <span className="text-neutral-400 font-bold w-4">4.</span>
                <span className="text-base">✅</span>
                <span>No limit on other skill moves</span>
              </div>
            </div>
          </div>

          {/* 4. Match Verification */}
          <div className="rounded-2xl p-6 bg-neutral-900/60 border border-neutral-800 space-y-4">
            <div className="flex items-center gap-2.5 text-white font-black uppercase text-base tracking-wider border-b border-neutral-800 pb-3">
              <span className="text-xl">📝</span>
              <h3>Match Verification</h3>
            </div>

            <ul className="space-y-2.5 text-neutral-300">
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>All matches will be <strong className="text-white">verified</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-orange-400 mt-1 font-bold">•</span>
                <span>Results will be <strong className="text-white">updated on the tournament website</strong>.</span>
              </li>
            </ul>

            <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30">
              <p className="text-neutral-100 font-medium sm:text-base leading-relaxed">
                Most importantly, this tournament is being organized to <strong className="text-white font-bold">have fun and enjoy the game</strong>. Play fair, stay competitive, and enjoy the tournament! 🥳
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
