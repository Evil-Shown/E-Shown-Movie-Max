"use client";

import type { Movie } from "@/lib/types";
import MovieCard from "./MovieCard";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { scaleInVariant, staggerContainer } from "@/lib/motion";

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
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <line
          key={deg}
          x1="40"
          y1="12"
          x2="40"
          y2="20"
          stroke="currentColor"
          strokeWidth="1"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
    </svg>
  );
}

export default function MovieGrid({
  movies,
  emptyMessage = "No movies found.",
  countLabel,
}: MovieGridProps) {
  const prefersReducedMotion = useReducedMotion();

  if (movies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center border border-dashed border-[var(--border-mid)] bg-[var(--bg-surface)] py-24 text-center">
        <FilmReelIcon />
        <p className="font-cinzel mt-6 text-2xl text-[var(--text-primary)]">No titles found</p>
        <p className="font-cormorant mt-2 text-lg italic text-[var(--text-secondary)]">
          {emptyMessage}
        </p>
        <Link
          href="/browse"
          className="mt-8 border border-[var(--border-hot)] bg-[var(--gold-primary)] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--gold-bright)]"
        >
          Browse All
        </Link>
      </div>
    );
  }

  return (
    <div>
      {countLabel && (
        <p className="mb-4 inline-block bg-[var(--bg-surface)] px-3 py-1 text-xs text-[var(--text-dim)]">
          {countLabel}
        </p>
      )}
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        variants={prefersReducedMotion ? undefined : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-40px" }}
      >
        {movies.map((movie) => (
          <motion.div key={movie.id} variants={prefersReducedMotion ? undefined : scaleInVariant}>
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
