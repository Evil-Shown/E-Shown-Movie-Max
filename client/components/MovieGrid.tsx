import MovieCardGrid from "@/components/MovieCardGrid";
import type { Movie } from "@/lib/types";
import Link from "next/link";

interface MovieGridProps {
  movies: Movie[];
  emptyMessage?: string;
  countLabel?: string;
}

function FilmReelIcon() {
  return (
    <svg viewBox="0 0 80 80" fill="none" className="h-16 w-16 text-[var(--text-dim)]">
      <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1" />
      <circle cx="40" cy="40" r="8" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

export default function MovieGrid({ movies, emptyMessage = "No movies found.", countLabel }: MovieGridProps) {
  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-strong)] bg-[var(--bg-card)] py-24 text-center">
        <FilmReelIcon />
        <p className="mt-6 font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]">No titles found</p>
        <p className="mt-2 text-[15px] leading-[1.7] text-[var(--text-secondary)]">{emptyMessage}</p>
        <Link
          href="/browse"
          data-cursor="link"
          className="mt-8 rounded-md bg-[var(--accent-primary)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-inverse)] hover:bg-[#b85f26] active:scale-95"
        >
          Browse All
        </Link>
      </div>
    );
  }

  return (
    <div>
      {countLabel && (
        <p className="mb-5 ml-auto w-fit rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-4 py-1.5 text-xs text-[var(--text-secondary)]">
          {countLabel}
        </p>
      )}
      <MovieCardGrid movies={movies} className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-4 xl:grid-cols-6" />
    </div>
  );
}
