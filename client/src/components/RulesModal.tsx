import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  BookOpen,
  Users,
  Trophy,
  Scale,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScrollToSection?: () => void;
}

export default function RulesModal({ isOpen, onClose, onScrollToSection }: RulesModalProps) {
  // Prevent background scrolling when modal is open
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
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400 shadow-[0_0_15px_rgba(255,106,0,0.2)]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black italic uppercase tracking-wider text-white text-lg sm:text-xl">
                      Tournament Rules
                    </h3>
                    <span className="rounded-full bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 text-[9px] font-black tracking-widest text-orange-400 uppercase">
                      H2H
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 font-medium">Official S43 Tournament Guidelines</p>
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
              {/* Welcome Banner */}
              <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-500/20">
                <p className="font-semibold text-neutral-200">
                  Welcome to <span className="text-orange-400 font-black">S43 H2H tournament</span>. You're already familiar with some of the rules, but let me briefly review them here.
                </p>
              </div>

              {/* Group System Section */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400">
                    <Users className="h-4 w-4" />
                  </span>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Group System & Qualification
                  </h4>
                </div>
                <p className="text-neutral-400">
                  First and foremost, we've decided to work with a group system, for obvious reasons. Players who have an off day can still recover in the following matches and don't have to immediately worry about elimination.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
                    <span className="font-bold text-white block mb-1">Group Structure</span>
                    We're working with a group system (group A-B-C...) and the number of groups and players per group will be decided based on the number of registrations.
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs">
                    <span className="font-bold text-white block mb-1">Match Format</span>
                    Each team can play twice (home & away) against an opponent from their group.
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                  <Trophy className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>The <strong className="text-white">2 teams with the most points</strong> after the group matches qualify for the quarter-finals.</span>
                </div>
              </div>

              {/* Points System Section */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
                    <Scale className="h-4 w-4" />
                  </span>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Points System & Aggregate
                  </h4>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
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

                {/* Aggregate clarification */}
                <div className="p-4 rounded-xl bg-neutral-900/70 border border-orange-500/15 space-y-2 text-xs">
                  <div className="font-bold text-orange-400">No Aggregate in Group Matches:</div>
                  <p className="text-neutral-400">
                    For example:
                  </p>
                  <div className="font-mono bg-black/60 p-2.5 rounded-lg border border-neutral-800 text-neutral-300 space-y-1">
                    <div>Team X - Team Y; 2-1</div>
                    <div>Team Y - Team X; 3-0</div>
                  </div>
                  <p className="text-neutral-400 pt-1">
                    If you were using the aggregate system, this would be a 4-2 score for Team Y, but we won't be doing that. Each team receives points for its match, but Team Y simply advances to the next matches with a better goal difference.
                  </p>
                  <div className="pt-2 text-neutral-300 border-t border-neutral-800/80">
                    <span className="text-amber-400 font-semibold">Note:</span> Aggregate only occurs if there is an equal number of points and goal difference between two teams after all group matches have been completed.
                  </div>
                </div>
              </div>

              {/* Fair Play & Anti-Toxic Section */}
              <div className="rounded-2xl p-5 bg-neutral-950/60 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15 text-red-400">
                    <ShieldAlert className="h-4 w-4" />
                  </span>
                  <h4 className="font-extrabold text-sm uppercase tracking-wider text-white">
                    Fair Play & Anti-Toxic Guidelines
                  </h4>
                </div>
                <p className="text-xs text-neutral-400">
                  As indicated in previous announcements, we try to avoid toxic play, which means:
                </p>
                <div className="grid sm:grid-cols-3 gap-2.5 pt-1">
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs font-semibold text-red-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-[10px]">1</span>
                    <span>No Lob/Kick-off Spam</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs font-semibold text-red-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-[10px]">2</span>
                    <span>No Cross Spam</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs font-semibold text-red-300">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-500/20 text-red-400 font-bold text-[10px]">3</span>
                    <span>No Backpassing</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-400">
                  <strong className="text-white">Skill Moves:</strong> There is no limit on other skill moves.
                </div>
              </div>

              {/* Match Verification & Spirit */}
              <div className="rounded-2xl p-4 sm:p-5 bg-neutral-950/70 border border-neutral-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-neutral-300">
                    Matches will be verified and results will be pushed to the website.
                  </p>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-medium text-orange-200">
                  <Sparkles className="h-4 w-4 text-orange-400 shrink-0" />
                  <span>Remember, we're organizing this to bring some fun to the game. So try and experience it!</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-800/80 bg-neutral-950/90 text-xs">
              {onScrollToSection ? (
                <button
                  onClick={() => {
                    onClose();
                    onScrollToSection();
                  }}
                  className="flex items-center gap-1.5 text-neutral-400 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  <span>View full section on page</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              ) : (
                <span className="text-neutral-500">S43 Official Rules</span>
              )}
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all cursor-pointer"
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
