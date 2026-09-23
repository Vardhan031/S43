import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function RulesModal({ isOpen, onClose }: RulesModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0c0906] border border-orange-500/30 shadow-[0_0_50px_rgba(255,85,0,0.25),0_20px_50px_rgba(0,0,0,0.9)] overflow-hidden z-10"
          >
            {/* Top Accent Gradient Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 via-amber-400 to-orange-600" />

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-orange-500/15 bg-neutral-950/80">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black italic uppercase tracking-wider text-white text-lg sm:text-xl">
                      S43 H2H Tournament Rules
                    </h3>
                  </div>
                  <p className="text-xs text-neutral-400 font-medium">Official Tournament Guidelines</p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="h-9 w-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
                aria-label="Close rules modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="overflow-y-auto px-6 py-6 space-y-6 text-sm text-neutral-300 leading-relaxed custom-scrollbar">
              {/* Welcome Intro */}
              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
                <p className="font-medium text-neutral-200">
                  Welcome to the <strong className="text-white font-extrabold">S43 H2H Tournament</strong>! You&apos;re already familiar with some of the rules, but here&apos;s a quick overview.
                </p>
              </div>

              {/* 1. Tournament Format */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2 text-white font-black uppercase text-sm tracking-wider border-b border-neutral-800 pb-2.5">
                  <span className="text-lg">📋</span>
                  <h4>Tournament Format</h4>
                </div>

                <ul className="space-y-2 text-neutral-300 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>The tournament will follow a <strong className="text-white">group-stage system</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>Groups will be named <strong className="text-white">A, B, C</strong>, etc.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>The number of groups and players per group will depend on the number of registrations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>Each team plays <strong className="text-white">twice against every opponent</strong> in their group — <strong className="text-white">Home &amp; Away</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>The <strong className="text-white">top 2 teams from each group</strong> qualify for the <strong className="text-white">Quarter-Finals</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>The group system allows players to recover from a bad match without immediate elimination.</span>
                  </li>
                </ul>
              </div>

              {/* 2. Points System */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-4">
                <div className="flex items-center gap-2 text-white font-black uppercase text-sm tracking-wider border-b border-neutral-800 pb-2.5">
                  <span className="text-lg">⚽</span>
                  <h4>Points System</h4>
                </div>

                <ul className="space-y-1.5 text-xs sm:text-sm text-neutral-300">
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span>
                    <span><strong className="text-white">Win:</strong> 3 points</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span>
                    <span><strong className="text-white">Draw:</strong> 1 point</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-orange-400">•</span>
                    <span><strong className="text-white">Loss:</strong> 0 points</span>
                  </li>
                </ul>

                <div className="pt-1 space-y-2.5 text-xs sm:text-sm">
                  <p>
                    There is <strong className="text-white">no aggregate scoring</strong> in group matches.
                  </p>

                  <div>
                    <p className="font-bold text-neutral-200 mb-1.5">Example:</p>
                    <ul className="space-y-1 pl-1">
                      <li className="flex items-center gap-2 font-mono text-xs sm:text-sm text-neutral-200 bg-black/60 p-2 rounded-lg border border-neutral-800 w-fit min-w-[200px]">
                        <span className="text-orange-400">•</span>
                        <span>Team X 2–1 Team Y</span>
                      </li>
                      <li className="flex items-center gap-2 font-mono text-xs sm:text-sm text-neutral-200 bg-black/60 p-2 rounded-lg border border-neutral-800 w-fit min-w-[200px]">
                        <span className="text-orange-400">•</span>
                        <span>Team Y 3–0 Team X</span>
                      </li>
                    </ul>
                  </div>

                  <p>
                    The matches are treated separately for points. Team Y would simply have the better <strong className="text-white">goal difference</strong>.
                  </p>

                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/25 text-neutral-200 font-medium">
                    <strong className="text-white">Aggregate is used only if two teams have the same points and the same goal difference after all group matches are completed.</strong>
                  </div>
                </div>
              </div>

              {/* 3. Fair Play Rules */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2 text-white font-black uppercase text-sm tracking-wider border-b border-neutral-800 pb-2.5">
                  <span className="text-lg">🚫</span>
                  <h4>Fair Play Rules</h4>
                </div>

                <p className="text-xs sm:text-sm font-medium text-neutral-200">
                  To avoid toxic gameplay:
                </p>

                <div className="space-y-2 text-xs sm:text-sm font-medium">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/25 border border-red-500/25 text-neutral-200">
                    <span className="text-neutral-400 font-bold w-4">1.</span>
                    <span className="text-base">❌</span>
                    <span>No Lob/Kick-off Spam</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/25 border border-red-500/25 text-neutral-200">
                    <span className="text-neutral-400 font-bold w-4">2.</span>
                    <span className="text-base">❌</span>
                    <span>No Cross Spam</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-950/25 border border-red-500/25 text-neutral-200">
                    <span className="text-neutral-400 font-bold w-4">3.</span>
                    <span className="text-base">❌</span>
                    <span>No Backpassing</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-950/25 border border-emerald-500/25 text-neutral-200">
                    <span className="text-neutral-400 font-bold w-4">4.</span>
                    <span className="text-base">✅</span>
                    <span>No limit on other skill moves</span>
                  </div>
                </div>
              </div>

              {/* 4. Match Verification */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2 text-white font-black uppercase text-sm tracking-wider border-b border-neutral-800 pb-2.5">
                  <span className="text-lg">📝</span>
                  <h4>Match Verification</h4>
                </div>

                <ul className="space-y-2 text-neutral-300 text-xs sm:text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>All matches will be <strong className="text-white">verified</strong>.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-400 mt-0.5">•</span>
                    <span>Results will be <strong className="text-white">updated on the tournament website</strong>.</span>
                  </li>
                </ul>

                <div className="mt-3 p-4 rounded-xl bg-gradient-to-r from-orange-500/20 via-amber-500/10 to-transparent border border-orange-500/30">
                  <p className="text-neutral-100 font-medium text-xs sm:text-sm leading-relaxed">
                    Most importantly, this tournament is being organized to <strong className="text-white font-bold">have fun and enjoy the game</strong>. Play fair, stay competitive, and enjoy the tournament! 🥳
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800/80 bg-neutral-950/90 text-xs">
              <span className="text-neutral-500 font-medium">S43 Official Rules</span>
              <button
                onClick={onClose}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                Got It
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
