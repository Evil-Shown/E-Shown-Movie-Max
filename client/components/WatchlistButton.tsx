"use client";

import type { Movie } from "@/lib/types";
import { useUserLibrary } from "@/components/UserLibraryProvider";

interface WatchlistButtonProps {
  movie: Movie;
  className?: string;
}

export default function WatchlistButton({ movie, className = "" }: WatchlistButtonProps) {
  const { isWatchlisted, toggleWatchlist } = useUserLibrary();
  const active = isWatchlisted(movie.id);

  return (
    <button
      type="button"
      aria-label={active ? "Remove from watchlist" : "Add to watchlist"}
      onClick={(e) => {
        e.stopPropagation();
        toggleWatchlist(movie);
      }}
      className={`flex h-8 w-8 items-center justify-center rounded-full border transition active:scale-95 ${
        active
          ? "border-[var(--accent-primary)] bg-[var(--accent-primary)] text-white"
          : "border-[var(--border-strong)] bg-[var(--bg-card)]/90 text-[var(--text-secondary)] hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
      } ${className}`}
    >
      <svg viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </svg>
    </button>
  );
}
