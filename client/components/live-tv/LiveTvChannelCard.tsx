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
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(220,38,38,0.9)] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
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
    <FloatingCard maxTilt={10} className="h-full">
      <motion.button
        type="button"
        onClick={() => onSelect(channel)}
        whileHover={prefersReducedMotion ? undefined : { y: -2 }}
        className={`card-hover-shimmer glass-surface group relative flex h-full w-full flex-col overflow-hidden rounded-2xl text-left transition ${
          isSelected
            ? "ring-2 ring-[var(--accent-primary)] ring-offset-2 ring-offset-[var(--bg-primary)]"
            : ""
        } ${compact ? "p-3" : "p-4"}`}
        aria-pressed={isSelected}
        aria-label={`Watch ${channel.name}`}
      >
        <div className="relative mb-3 flex items-start justify-between gap-2">
          <div
            className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-[var(--shadow-sm)] ${
              compact ? "h-12 w-12" : "h-14 w-14"
            }`}
            aria-hidden
          >
            <ChannelLogo channel={channel} className={compact ? "text-sm" : "text-base"} />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <LiveBadge />
            {channel.isHd && (
              <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                HD
              </span>
            )}
          </div>
        </div>

        <h3
          className={`font-[var(--font-playfair)] font-semibold text-[var(--text-primary)] ${
            compact ? "text-sm" : "text-base"
          }`}
        >
          {channel.name}
        </h3>
        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {LIVE_TV_CATEGORY_LABELS[channel.category]}
          {channel.region === "local" ? " · Sri Lanka" : " · International"}
        </p>

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
            className={`absolute bottom-3 right-3 flex h-8 w-8 items-center justify-center rounded-full border transition ${
              isFavorite
                ? "border-[var(--accent-primary)] bg-[rgba(201,106,43,0.12)] text-[var(--accent-primary)]"
                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 hover:text-[var(--accent-primary)]"
            }`}
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        )}
      </motion.button>
    </FloatingCard>
  );
}
