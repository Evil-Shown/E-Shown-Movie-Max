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
      ? "font-cinzel inline-flex min-w-[160px] h-12 items-center justify-center gap-2 bg-[#C9A84C] px-8 text-sm font-bold uppercase tracking-[0.15em] text-black transition hover:bg-[var(--gold-bright)] hover:shadow-[0_8px_30px_rgba(201,168,76,0.25)]"
      : variant === "ghost"
        ? "inline-flex h-12 items-center justify-center gap-2 border border-[rgba(201,168,76,0.4)] px-8 text-sm text-[rgba(240,237,228,0.8)] transition hover:border-[var(--border-hot)] hover:text-[var(--text-primary)]"
        : "flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(201,168,76,0.6)] bg-black/40 backdrop-blur-sm transition hover:scale-105 hover:bg-[var(--gold-primary)] hover:text-black";

  return (
    <button
      type="button"
      onClick={() => openPlayer(movie)}
      className={`${base} ${className}`}
    >
      {variant !== "circle" && label}
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
