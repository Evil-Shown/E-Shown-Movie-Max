"use client";

import type { Movie } from "@/lib/types";
import { prefetchMovieStream } from "@/lib/stream-prefetch";
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
      ? "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--on-accent)] hover:bg-[#b85f26] sm:w-auto"
      : variant === "ghost"
        ? "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] sm:w-auto"
        : "flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-[var(--bg-card)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--on-accent)]";

  return (
    <button
      type="button"
      onClick={() => openMovie(movie)}
      onMouseEnter={() => prefetchMovieStream(movie)}
      onFocus={() => prefetchMovieStream(movie)}
      aria-label={variant === "circle" ? `Play ${movie.title}` : undefined}
      className={`${base} active:scale-95 ${className}`}
    >
      {variant !== "circle" && label}
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
        <path d="M8 5v14l11-7z" />
      </svg>
    </button>
  );
}
