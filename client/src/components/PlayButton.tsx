"use client";

import type { Movie } from "@/lib/types";
import { useVideoPlayer } from "./VideoPlayerProvider";

interface PlayButtonProps {
  movie: Movie;
  label?: string;
  variant?: "primary" | "ghost" | "circle";
  className?: string;
}

export default function PlayButton({
  movie,
  label = "Play Now",
  variant = "primary",
  className = "",
}: PlayButtonProps) {
  const { openPlayer } = useVideoPlayer();

  const base =
    variant === "primary"
      ? "font-cinzel inline-flex min-w-[160px] h-12 items-center justify-center gap-2 rounded-full bg-[#D4A843] px-8 text-sm font-bold uppercase tracking-[0.15em] text-black shadow-[0_12px_30px_rgba(212,168,67,0.22)] transition hover:bg-[var(--gold-bright)] hover:shadow-[0_14px_36px_rgba(212,168,67,0.3)]"
      : variant === "ghost"
        ? "inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[rgba(201,168,76,0.45)] bg-[rgba(32,38,54,0.45)] px-8 text-sm text-[var(--text-secondary)] transition hover:border-[var(--border-hot)] hover:bg-[rgba(212,168,67,0.08)] hover:text-[var(--text-primary)]"
        : "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(201,168,76,0.65)] bg-[rgba(32,38,54,0.72)] backdrop-blur-sm transition hover:scale-105 hover:bg-[var(--gold-primary)] hover:text-black";

  return (
    <button
      type="button"
      data-cursor="play"
      onClick={() => openPlayer(movie)}
      className={`${base} active:scale-95 ${className}`}
    >
      {variant !== "circle" && label}
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
