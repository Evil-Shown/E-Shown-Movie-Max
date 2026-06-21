"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ChannelLogo from "@/components/live-tv/ChannelLogo";
import type { LiveTvChannel } from "@/lib/live-tv/types";

export type LiveTvLoadingPhase =
  | "resolve"
  | "connect"
  | "proxy"
  | "fallback"
  | "buffer"
  | "embed";

const PHASE_COPY: Record<LiveTvLoadingPhase, { title: string; lines: string[] }> = {
  resolve: {
    title: "Preparing channel",
    lines: [
      "Looking up stream sources for this channel…",
      "Checking live availability in our guide…",
      "Almost ready to tune in…",
    ],
  },
  connect: {
    title: "Connecting to live stream",
    lines: [
      "Handshaking with the broadcast server…",
      "Loading the HLS live manifest…",
      "Video should start in a few seconds…",
    ],
  },
  proxy: {
    title: "Routing through secure relay",
    lines: [
      "Fetching the stream via our server proxy…",
      "This helps avoid browser CORS blocks…",
      "Hang tight — first load can take a moment…",
    ],
  },
  fallback: {
    title: "Trying alternate source",
    lines: [
      "Primary feed did not respond — switching…",
      "Testing a backup stream URL…",
      "Searching for a working live signal…",
    ],
  },
  buffer: {
    title: "Buffering live video",
    lines: [
      "Downloading the first video segment…",
      "Building a playback buffer…",
      "Starting playback now…",
    ],
  },
  embed: {
    title: "Loading broadcaster page",
    lines: [
      "Opening the official channel player…",
      "Embedded directly from the network site…",
      "Some channels take longer on first visit…",
    ],
  },
};

interface LiveTvPlayerLoadingProps {
  channel: LiveTvChannel;
  phase?: LiveTvLoadingPhase;
  /** Compact overlay on top of video (semi-transparent) */
  overlay?: boolean;
  className?: string;
}

export default function LiveTvPlayerLoading({
  channel,
  phase = "connect",
  overlay = false,
  className = "",
}: LiveTvPlayerLoadingProps) {
  const prefersReducedMotion = useReducedMotion();
  const copy = PHASE_COPY[phase];
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    setLineIndex(0);
  }, [phase]);

  useEffect(() => {
    const id = window.setInterval(() => {
      setLineIndex((i) => (i + 1) % copy.lines.length);
    }, 2800);
    return () => window.clearInterval(id);
  }, [copy.lines.length, phase]);

  return (
    <div
      className={`relative flex h-full w-full flex-col items-center justify-center px-6 text-center ${
        overlay ? "bg-black/75 backdrop-blur-sm" : "bg-[#050505]"
      } ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        <motion.div
          className="absolute left-1/2 top-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--accent-primary)]/12 blur-3xl sm:h-72 sm:w-72"
          animate={
            prefersReducedMotion ? undefined : { scale: [1, 1.12, 1], opacity: [0.35, 0.65, 0.35] }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-w-sm flex-col items-center"
      >
        <div className="relative mb-5">
          {!prefersReducedMotion && (
            <>
              <motion.span
                className="absolute -inset-1 rounded-2xl border border-[var(--accent-primary)]/50"
                animate={{ scale: [1, 1.4], opacity: [0.45, 0] }}
                transition={{ duration: 1.6, repeat: Infinity }}
              />
              <motion.span
                className="absolute -inset-1 rounded-2xl border border-white/15"
                animate={{ scale: [1, 1.25], opacity: [0.25, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, delay: 0.35 }}
              />
            </>
          )}
          <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-[var(--bg-card)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] sm:h-[72px] sm:w-[72px]">
            <ChannelLogo channel={channel} variant="tile" priority className="size-12 sm:size-14" />
          </div>
        </div>

        <div className="mb-4 flex h-5 items-end justify-center gap-1" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.span
              key={i}
              className="w-1 origin-bottom rounded-full bg-[var(--accent-primary)]"
              style={{ height: 6 + i * 3 }}
              animate={
                prefersReducedMotion
                  ? { opacity: 0.75 }
                  : { scaleY: [0.3, 1, 0.3], opacity: [0.35, 1, 0.35] }
              }
              transition={{
                duration: 0.85,
                repeat: Infinity,
                delay: i * 0.11,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--accent-primary)]">
          {copy.title}
        </p>
        <h3 className="mt-2 font-[var(--font-playfair)] text-lg font-bold text-white sm:text-xl">
          {channel.name}
        </h3>

        <div className="mt-3 min-h-[2.75rem]">
          <AnimatePresence mode="wait">
            <motion.p
              key={`${phase}-${lineIndex}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm leading-relaxed text-white/55"
            >
              {copy.lines[lineIndex]}
            </motion.p>
          </AnimatePresence>
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-white/30">
          Live TV may take 5–15 seconds · tap the player to unmute when video starts
        </p>
      </motion.div>
    </div>
  );
}
