"use client";

import { useState, useRef, MouseEvent } from "react";
import { Link } from "react-router-dom";
import { Tournament } from "../types";
import { Zap, Users, Trophy } from "lucide-react";

interface InteractiveTournamentCardProps {
  tournament: Tournament;
}

export default function InteractiveTournamentCard({ tournament }: InteractiveTournamentCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const rY = ((mouseX - width / 2) / (width / 2)) * 10;
    const rX = -((mouseY - height / 2) / (height / 2)) * 10;

    setRotateX(rX);
    setRotateY(rY);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const logoSrc = tournament.logoUrl || "/fall_frenzy_logo.png";
  const isCompleted = tournament.status === "COMPLETED";

  return (
    <div
      className="relative pt-14 group perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={`/tournaments/${tournament.id}`} className="block">
        {/* Overlapping Top Emblem Shield */}
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 pointer-events-none">
          <div className="relative h-28 w-28 sm:h-32 sm:w-32 flex items-center justify-center">
            {/* Fiery Orange Radial Glow */}
            <div
              className={`absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-red-600 blur-md transition-all duration-500 ${
                isHovered ? "opacity-30 scale-105" : "opacity-15 scale-95"
              }`}
            />

            {/* Emblem Image */}
            <img
              src={logoSrc}
              alt={tournament.name}
              className={`relative z-10 h-full w-full object-contain transition-transform duration-500 drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)] ${
                isHovered ? "scale-110 -translate-y-1" : "scale-100"
              }`}
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/fall_frenzy_logo.png";
              }}
            />
          </div>
        </div>

        {/* 3D Tilt Card Surface */}
        <div
          ref={cardRef}
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
            transition: isHovered ? "transform 0.1s ease-out" : "transform 0.5s ease-out"
          }}
          className={`relative rounded-3xl border bg-[#09080b] p-7 pt-20 text-center transition-all duration-300 ${
            isCompleted
              ? "border-slate-800/80 hover:border-slate-600 shadow-xl"
              : "border-orange-500/30 hover:border-orange-500/80 shadow-[0_10px_30px_rgba(0,0,0,0.8)] hover:shadow-[0_15px_50px_rgba(255,106,0,0.22)]"
          }`}
        >
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 rounded-3xl opacity-20 pointer-events-none bg-[radial-gradient(#ff6a00_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10 flex flex-col items-center">
            {/* Status Pill */}
            {isCompleted ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-400 mb-4 shadow-sm">
                COMPLETED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-500/40 bg-orange-950/40 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-orange-400 mb-4 shadow-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
                {tournament.status === "DRAFT" ? "DRAFTING" : "LIVE"}
              </span>
            )}

            {/* Tournament Title */}
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mb-6 leading-none transition-colors group-hover:text-orange-400">
              {tournament.name}
            </h3>

            {/* Format Details with Icons */}
            <div className="flex flex-col items-center gap-2.5 text-sm font-bold text-neutral-300 mb-6">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-orange-500 shrink-0" />
                <span>{tournament.totalGroups > 1 ? `Two Stage ${tournament.mode}` : `${tournament.mode} Format`}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-orange-500 shrink-0" />
                <span>{tournament.totalGroups > 1 ? `${tournament.totalGroups} Groups` : `${tournament.totalPlayers} Teams`}</span>
              </div>
            </div>

            {/* Horizontal Line Divider */}
            <div className="w-full border-t border-neutral-800/80 mb-5" />

            {/* Bottom CTA Button */}
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-wider text-orange-500 transition-colors group-hover:text-orange-400">
              <span>VIEW TOURNAMENT</span>
              <span className="text-sm font-black transition-transform duration-300 group-hover:translate-x-2">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
