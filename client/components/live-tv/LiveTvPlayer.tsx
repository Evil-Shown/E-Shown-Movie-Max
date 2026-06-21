"use client";

import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import LiveTvStreamPlayer from "@/components/live-tv/LiveTvStreamPlayer";
import { fadeUpVariant } from "@/lib/motion";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

interface LiveTvPlayerProps {
  channel: LiveTvChannel | null;
  isFavorite?: boolean;
  onToggleFavorite?: (channel: LiveTvChannel) => void;
}

export default function LiveTvPlayer({
  channel,
  isFavorite = false,
  onToggleFavorite,
}: LiveTvPlayerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      {channel ? (
        <motion.div
          key={channel.id}
          variants={prefersReducedMotion ? undefined : fadeUpVariant}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: 12 }}
          className="overflow-hidden rounded-2xl shadow-[0_24px_80px_rgba(0,0,0,0.35)] ring-1 ring-white/[0.08]"
        >
          {/* Video stage — controls live inside the player */}
          <div className="relative aspect-video w-full bg-[#050505]">
            <LiveTvStreamPlayer channel={channel} />
          </div>

          {/* Info strip below player */}
          <div className="flex flex-col gap-3 border-t border-white/[0.06] bg-gradient-to-r from-[#111] to-[#0d0d0d] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-white/10 sm:flex">
                <ChannelLogo channel={channel} variant="clean" className="h-full w-full" />
              </div>
              <div className="min-w-0">
                <h2 className="truncate font-[var(--font-playfair)] text-lg font-bold text-white">
                  {channel.name}
                </h2>
                <p className="truncate text-xs text-white/45">
                  {LIVE_TV_CATEGORY_LABELS[channel.category]}
                  {channel.region === "local" ? " · Sri Lanka" : " · International"}
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-2">
              {onToggleFavorite && (
                <button
                  type="button"
                  onClick={() => onToggleFavorite(channel)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                    isFavorite
                      ? "bg-[rgba(201,106,43,0.2)] text-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/40"
                      : "bg-white/5 text-white/60 ring-1 ring-white/10 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill={isFavorite ? "currentColor" : "none"}
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="h-4 w-4"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                  {isFavorite ? "Saved" : "Save"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="empty-player"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex aspect-video flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] p-8 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]">
            <svg viewBox="0 0 80 80" fill="none" className="h-8 w-8 text-[var(--text-muted)]" aria-hidden>
              <rect x="8" y="20" width="64" height="40" rx="4" stroke="currentColor" strokeWidth="1.5" />
              <path d="M34 30l16 10-16 10V30z" fill="currentColor" opacity="0.4" />
            </svg>
          </div>
          <p className="mt-4 font-[var(--font-playfair)] text-xl text-[var(--text-primary)]">
            Select a channel to start watching
          </p>
          <p className="mt-2 max-w-sm text-sm text-[var(--text-secondary)]">
            Pick any channel below — scrub back to rewind live, or jump to Live anytime.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
