"use client";

import FloatingCard from "@/components/3d/FloatingCard";
import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import { motion, useReducedMotion } from "framer-motion";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

interface LiveTvChannelCardProps {
  channel: LiveTvChannel;
  isSelected?: boolean;
  isFavorite?: boolean;
  compact?: boolean;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite?: (channel: LiveTvChannel) => void;
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-600/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg backdrop-blur-md">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]" aria-hidden />
      Live
    </span>
  );
}

export default function LiveTvChannelCard({
  channel,
  isSelected = false,
  isFavorite = false,
  compact = false,
  onSelect,
  onToggleFavorite,
}: LiveTvChannelCardProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <FloatingCard maxTilt={15} className="h-full">
      <motion.button
        type="button"
        onClick={() => onSelect(channel)}
        whileHover={prefersReducedMotion ? undefined : { y: -10, scale: 1.05 }}
        className={`group relative flex w-full flex-col overflow-hidden rounded-2xl text-left transition-all duration-500 ease-out 
          aspect-[2/3] ${compact ? "min-h-[280px]" : "min-h-[380px]"}
          ${
            isSelected
              ? "ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)] shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
              : "shadow-[0_10px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.7)]"
          }`}
        aria-pressed={isSelected}
        aria-label={`Watch ${channel.name}`}
      >
        {/* GRAVITY CORE: The Cinematic Poster Background */}
        <div className="absolute inset-0 z-0">
          <ChannelLogo 
            channel={channel} 
            className="h-full w-full scale-[1.15] blur-[1.5px] transition-transform duration-700 ease-out group-hover:scale-[1.25]" 
          />
          {/* Dark gradient rooting the poster */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-5">
          {/* TOP ROW: Identity Stamp & Live Badge */}
          <div className="flex items-start justify-between gap-2">
            {/* Logo Stamp */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/20 bg-black/20 shadow-lg backdrop-blur-md transition-transform duration-500 group-hover:scale-105 group-hover:-rotate-3">
              <ChannelLogo channel={channel} className="h-full w-full text-xs" />
            </div>

            <div className="flex flex-col items-end gap-1.5 transition-transform duration-500 group-hover:-translate-y-1">
              <LiveBadge />
              {channel.isHd && (
                <span className="rounded-full border border-white/30 bg-black/40 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white/90 backdrop-blur-sm">
                  HD
                </span>
              )}
            </div>
          </div>

          {/* BOTTOM ROW: Hover-Revealed Metadata */}
          <div className="mt-auto flex flex-col translate-y-6 opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
            <h3 className="font-[var(--font-playfair)] text-2xl font-bold tracking-wide text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-3xl">
              {channel.name}
            </h3>
            <p className="mt-1 text-xs font-medium text-white/80 drop-shadow-md sm:text-sm">
              {LIVE_TV_CATEGORY_LABELS[channel.category]}
              {channel.region === "local" ? " · Sri Lanka" : " · International"}
            </p>
          </div>

          {/* Favorite Button (Bottom Right) */}
          {onToggleFavorite && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(channel);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggleFavorite(channel);
                }
              }}
              aria-label={isFavorite ? `Remove ${channel.name} from favorites` : `Add ${channel.name} to favorites`}
              className={`absolute bottom-4 right-4 z-20 flex h-10 w-10 translate-y-4 items-center justify-center rounded-full border opacity-0 backdrop-blur-md transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100 sm:bottom-5 sm:right-5 ${
                isFavorite
                  ? "border-[var(--accent-primary)] bg-[rgba(201,106,43,0.3)] text-[var(--accent-primary)]"
                  : "border-white/30 bg-black/40 text-white/70 hover:border-white hover:bg-white/20 hover:text-white"
              }`}
            >
              <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-5 w-5">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </span>
          )}
        </div>
      </motion.button>
    </FloatingCard>
  );
}
