"use client";

import { stillUrl } from "@/lib/movies";
import type { TvEpisodeSummary } from "@/lib/tv-episodes";
import { AnimatePresence, motion } from "framer-motion";

interface PlayerNextEpisodeOverlayProps {
  visible: boolean;
  showTitle: string;
  nextSeason: number;
  nextEpisode: number;
  episode?: TvEpisodeSummary | null;
  countdown: number;
  progress?: number;
  /** When false, only Play Now / Cancel — no auto-skip countdown. */
  autoAdvance?: boolean;
  onPlayNow: () => void;
  onCancel: () => void;
}

export default function PlayerNextEpisodeOverlay({
  visible,
  showTitle,
  nextSeason,
  nextEpisode,
  episode,
  countdown,
  progress = 0,
  autoAdvance = false,
  onPlayNow,
  onCancel,
}: PlayerNextEpisodeOverlayProps) {
  const thumb =
    stillUrl(episode?.still_path, "w500") ??
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 9'%3E%3Crect fill='%23111' width='16' height='9'/%3E%3C/svg%3E";

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-[12] flex items-end justify-center bg-[linear-gradient(180deg,rgba(0,0,0,0.15),rgba(0,0,0,0.88))] p-4 sm:items-center sm:p-8"
        >
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(160deg,rgba(28,25,23,0.96),rgba(12,10,9,0.98))] shadow-[0_30px_90px_rgba(0,0,0,0.55)]"
            role="dialog"
            aria-live="polite"
            aria-label="Next episode"
          >
            <div className="grid grid-cols-1 sm:grid-cols-[220px_1fr]">
              <div className="relative aspect-video overflow-hidden sm:aspect-auto sm:min-h-[180px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumb} alt="" className="h-full w-full object-cover" loading="lazy" />
                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(0,0,0,0.35),transparent)] sm:bg-[linear-gradient(0deg,transparent,rgba(0,0,0,0.45))]" />
                <div className="absolute left-3 top-3 rounded-full border border-[#f4c27a]/35 bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f4c27a] backdrop-blur">
                  Up Next
                </div>
              </div>

              <div className="flex flex-col justify-between p-5 sm:p-6">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    {showTitle}
                  </p>
                  <h3 className="mt-2 font-[var(--font-playfair)] text-2xl text-white">
                    Season {nextSeason} · Episode {nextEpisode}
                  </h3>
                  {episode?.name ? (
                    <p className="mt-2 text-sm font-medium text-[#f4c27a]">{episode.name}</p>
                  ) : null}
                  {episode?.overview ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-stone-300">
                      {episode.overview}
                    </p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={onPlayNow}
                    className="inline-flex items-center gap-2 rounded-full bg-[#f4c27a] px-5 py-2.5 text-xs font-bold uppercase tracking-[0.14em] text-stone-950 transition hover:bg-white"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    Play now
                  </button>
                  <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-full border border-white/15 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-stone-200 transition hover:bg-white/10"
                  >
                    Cancel
                  </button>
                  {autoAdvance ? (
                    <span className="ml-auto text-xs text-stone-400">
                      Auto-playing in <span className="font-semibold text-white">{countdown}s</span>
                    </span>
                  ) : (
                    <span className="ml-auto text-xs text-stone-400">Ready when you are</span>
                  )}
                </div>
              </div>
            </div>

            {autoAdvance ? (
              <>
                <div className="h-1 bg-white/10">
                  <motion.div
                    key={countdown}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: 1, ease: "linear" }}
                    className="h-full bg-[#f4c27a]"
                  />
                </div>
                <div className="h-[2px] bg-white/5">
                  <div
                    className="h-full bg-white/30"
                    style={{ width: `${Math.min(Math.max(progress, 0), 1) * 100}%` }}
                  />
                </div>
              </>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
