"use client";

import type { Movie } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";
import { formatDisplayYear } from "@/lib/movies";
import { PROVIDER_LABELS, type StreamProvider } from "@/lib/providers";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { formatResumeTime } from "./hooks/useResumeTime";

const MOVIE_LOADING_MESSAGES = [
  `Connecting to ${BRAND_NAME}…`,
  "Finding your stream source…",
  "Buffering video — this can take a moment…",
  "Almost ready — your film is loading…",
];

const TRAILER_LOADING_MESSAGES = [
  "Loading trailer preview…",
  "Opening video player…",
  "Almost ready…",
];

export default function PlayerLoadingOverlay({
  movie,
  isTrailer,
  provider,
  episodeLabel,
  resumeSeconds,
  heroImage,
  posterImage,
  autoSwitchMessage,
  stabilityTip,
}: {
  movie: Movie;
  isTrailer: boolean;
  provider: StreamProvider;
  episodeLabel: string | null;
  resumeSeconds?: number;
  heroImage: string;
  posterImage: string;
  autoSwitchMessage?: string | null;
  stabilityTip?: string | null;
}) {
  const messages = isTrailer ? TRAILER_LOADING_MESSAGES : MOVIE_LOADING_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setMessageIndex(0);
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [messages.length, isTrailer, provider, movie.id]);

  const statusLine = isTrailer
    ? "Trailer"
    : episodeLabel
      ? `${episodeLabel} · ${PROVIDER_LABELS[provider]}`
      : `HD Stream · ${PROVIDER_LABELS[provider]}`;

  return (
    <div className="player-loading-overlay absolute inset-0 z-[1] overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-55 blur-md"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,13,11,0.55),rgba(28,25,23,0.92))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,106,43,0.18),transparent_58%)]" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 py-8 text-center">
        <div className="player-loading-poster mb-5 overflow-hidden rounded-lg border border-[rgba(232,164,74,0.35)] shadow-[0_18px_48px_rgba(0,0,0,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImage} alt="" className="h-28 w-[4.5rem] object-cover sm:h-36 sm:w-24" />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f4c27a]/80">
          {isTrailer ? "Preview Mode" : "Now Loading"}
        </p>
        <h3 className="mt-2 max-w-md font-[var(--font-playfair)] text-2xl text-white sm:text-3xl">
          {movie.title}
        </h3>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-stone-300">
          {formatDisplayYear(movie.year) ?? "Series"}
          <span className="mx-2 text-stone-500">·</span>
          {statusLine}
        </p>

        {resumeSeconds && resumeSeconds > 30 ? (
          <p className="mt-3 rounded-full border border-[rgba(232,164,74,0.28)] bg-[rgba(232,164,74,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4c27a]">
            Resuming from {formatResumeTime(resumeSeconds)}
          </p>
        ) : null}

        {stabilityTip ? (
          <p className="mt-3 max-w-sm rounded-full border border-[rgba(74,124,142,0.35)] bg-[rgba(74,124,142,0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#a8d4e0]">
            {stabilityTip}
          </p>
        ) : null}

        {autoSwitchMessage ? (
          <p className="mt-3 max-w-sm text-sm font-medium text-[#f4c27a]">{autoSwitchMessage}</p>
        ) : null}

        <div className="player-loading-progress mt-8 w-full max-w-xs" aria-hidden>
          <div className="player-loading-progress-track">
            <div className="player-loading-progress-bar" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="mt-5 max-w-sm text-sm leading-relaxed text-stone-300"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>

        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-stone-500">
          Please wait — do not close this window
        </p>
      </div>
    </div>
  );
}
