"use client";

import type { Movie } from "@/lib/types";
import { warmStreamProviders } from "@/lib/stream-optimizer";
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
  const { openMovie } = useVideoPlayer();

  const base =
    variant === "primary"
      ? "inline-flex items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[#b85f26]"
      : variant === "ghost"
        ? "inline-flex items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]"
        : "flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)]";

  return (
    <button
      type="button"
      onClick={() => openMovie(movie)}
      onMouseEnter={() => warmStreamProviders()}
      onFocus={() => warmStreamProviders()}
      className={`${base} active:scale-95 ${className}`}
    >
      {variant !== "circle" && label}
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
