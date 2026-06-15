"use client";

import type { Movie } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import { useQuickView } from "@/components/QuickViewProvider";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { scaleInVariant } from "@/lib/motion";
import { useState } from "react";

interface MovieCardProps {
  movie: Movie;
  priority?: boolean;
  rank?: number;
}

export default function MovieCard({ movie, priority = false, rank }: MovieCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const { openMovie } = useVideoPlayer();
  const { openQuickView } = useQuickView();
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className="group/card relative shrink-0"
    >
      {rank !== undefined && (
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-0.5 left-0 z-[1] select-none font-[var(--font-playfair)] text-[58px] font-normal leading-none tracking-[-0.04em] text-[rgba(28,25,23,0.06)] sm:text-[66px] md:text-[72px]"
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <div className={`relative z-[2] ${rank !== undefined ? "pl-5 sm:pl-6" : ""}`}>
        <Link href={`/movie/${movie.id}`} className="sr-only">
          View {movie.title}
        </Link>

        <motion.div
          layoutId={`poster-${movie.id}`}
          role="button"
          tabIndex={0}
          onClick={() => openQuickView(movie)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openQuickView(movie);
            }
          }}
          className="relative"
        >
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg bg-[var(--bg-secondary)]">
            {!loaded && <div className="skeleton absolute inset-0 z-[1]" />}

            <PosterImage
              posterPath={movie.posterPath}
              title={movie.title}
              priority={priority}
              className="h-full w-full object-cover transition-transform duration-300 ease-in-out group-hover/card:scale-[1.03]"
              onLoad={() => setLoaded(true)}
            />

            <div className="pointer-events-none absolute inset-0 z-[2] bg-gradient-to-t from-[rgba(28,25,23,0.7)] via-transparent to-transparent opacity-0 transition-opacity duration-300 ease-in-out group-hover/card:opacity-100" />

            <button
              type="button"
              aria-label={`Play ${movie.title}`}
              onClick={(e) => {
                e.stopPropagation();
                openMovie(movie);
              }}
              className="absolute left-1/2 top-1/2 z-[3] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--bg-primary)] px-4 py-2 text-xs font-semibold text-[var(--text-primary)] opacity-0 shadow-sm group-hover/card:opacity-100 hover:bg-[var(--accent-primary)] hover:text-[var(--text-inverse)]"
            >
              <span className="inline-flex items-center gap-1">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch
              </span>
            </button>
          </div>

          <div className="mt-2">
            <div className="flex items-center gap-2">
              <p className="min-w-0 truncate text-[13px] font-semibold text-[var(--text-primary)]">{movie.title}</p>
              {movie.mediaType === "tv" && (
                <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.08em] text-[var(--text-muted)]">
                  Series
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center justify-between gap-2 text-[11px]">
              <span className="text-[var(--text-muted)]">{movie.year}</span>
              <span className="font-semibold text-[var(--accent-warm)]">★ {movie.rating.toFixed(1)}</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
