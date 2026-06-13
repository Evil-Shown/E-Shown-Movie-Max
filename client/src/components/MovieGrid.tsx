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
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--border-mid)] bg-[rgba(32,38,54,0.72)] py-24 text-center shadow-[0_18px_54px_rgba(0,0,0,0.16)]">
        <FilmReelIcon />
        <p className="font-cinzel mt-6 text-2xl text-[var(--text-primary)]">No titles found</p>
        <p className="font-cormorant mt-2 text-lg italic text-[var(--text-secondary)]">
          {emptyMessage}
        </p>
        <Link
          href="/browse"
          data-cursor="link"
          className="mt-8 rounded-full border border-[var(--border-hot)] bg-[var(--gold-primary)] px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black transition hover:bg-[var(--gold-bright)] active:scale-95"
        >
          Browse All
        </Link>
      </div>
    );
  }

  return (
    <div>
      {countLabel && (
        <p className="mb-5 ml-auto w-fit rounded-full border border-white/10 bg-[rgba(32,38,54,0.72)] px-4 py-1.5 text-xs text-[var(--text-secondary)] shadow-[0_10px_26px_rgba(0,0,0,0.12)]">
          {countLabel}
        </p>
      )}
      <motion.div
        className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
        variants={prefersReducedMotion ? undefined : staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {movies.map((movie, index) => (
          <motion.div
            key={movie.id}
            variants={prefersReducedMotion ? undefined : scaleInVariant}
            custom={index}
            transition={{ delay: index * 0.04 }}
          >
            <MovieCard movie={movie} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
