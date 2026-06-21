"use client";

import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import HlsVideoPlayer from "@/components/live-tv/HlsVideoPlayer";
import { fadeUpVariant } from "@/lib/motion";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

interface LiveTvPlayerProps {
  channel: LiveTvChannel | null;
  isFavorite?: boolean;
  onToggleFavorite?: (channel: LiveTvChannel) => void;
}

export default function LiveTvPlayer({ channel, isFavorite = false, onToggleFavorite }: LiveTvPlayerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {channel ? (
        <motion.div
          key={channel.id}
          variants={prefersReducedMotion ? undefined : fadeUpVariant}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: 16 }}
          className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-md)]"
        >
          <div className="flex items-center gap-3 border-b border-[var(--border)] p-4 sm:px-6">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full shadow-sm">
              <ChannelLogo channel={channel} className="text-sm" />
            </div>
            <div className="flex flex-1 items-center gap-3">
              <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--text-primary)]">
                {channel.name}
              </h2>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[rgba(220,38,38,0.85)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                  Live
                </span>
                {channel.isHd && (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--text-secondary)]">
                    HD
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="relative aspect-video w-full overflow-hidden bg-[#0f0d0b]">
            {channel.id === "hiru-tv" ? (
              <HlsVideoPlayer
                src="https://tv.hiruhost.com:1936/8012/8012/playlist.m3u8"
                poster="/channels/hiru-tv.png"
                className="absolute left-0 top-0 h-full w-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-[var(--text-secondary)]">
                Stream not available for this channel
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4 border-t border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">
                {channel.region === "local" ? "Local Channel" : "International Channel"} • {channel.region === "local" ? "Sri Lanka" : "Global"}
              </span>
            </div>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => onToggleFavorite(channel)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
                  isFavorite
                    ? "border-[var(--accent-primary)] bg-[rgba(201,106,43,0.1)] text-[var(--accent-primary)]"
                    : "border-[var(--border-strong)] bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                }`}
              >
                <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
                {isFavorite ? "Favorited" : "Add to Favorites"}
              </button>
            )}
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty-player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] p-8 text-center"
        >
          <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16 text-[var(--text-muted)]" aria-hidden>
            <rect x="8" y="20" width="64" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M34 30l16 10-16 10V30z" fill="currentColor" opacity="0.4" />
          </svg>
          <p className="mt-4 font-[var(--font-playfair)] text-xl text-[var(--text-primary)]">
            Select a channel to start watching
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Choose from local Sri Lankan networks or international channels below.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
