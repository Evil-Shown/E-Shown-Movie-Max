"use client";

import type { Movie } from "@/lib/types";
import { useVideoPlayer } from "./VideoPlayerProvider";

interface TrailerButtonProps {
  movie: Movie;
  label?: string;
  variant?: "primary" | "ghost";
  className?: string;
}

export default function TrailerButton({
  movie,
  label = "Trailer",
  variant = "ghost",
  className = "",
}: TrailerButtonProps) {
  const { openTrailer } = useVideoPlayer();

  const base =
    variant === "primary"
      ? "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-sm font-semibold text-[var(--text-inverse)] hover:bg-[#b85f26] sm:w-auto"
      : "inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-[var(--border-strong)] bg-transparent px-6 py-3 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] sm:w-auto";

  return (
    <button
      type="button"
      onClick={() => openTrailer(movie)}
      className={`${base} active:scale-95 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
      </svg>
      {label}
    </button>
  );
}
