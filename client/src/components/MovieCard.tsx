"use client";

import type { Movie } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
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
  const { openPlayer } = useVideoPlayer();
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.04 }}
      className="group/card relative shrink-0"
    >
      {rank !== undefined && (
        <span
          aria-hidden
          className="font-cinzel pointer-events-none absolute -bottom-1 left-0 z-[1] translate-y-[15px] text-[72px] leading-none text-[rgba(201,168,76,0.12)] transition-colors duration-300 group-hover/card:text-[rgba(201,168,76,0.35)]"
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <div className="relative z-[2]">
        <Link href={`/movie/${movie.id}`} className="block">
          <div
            className="card-hover-shimmer card-3d-tilt relative aspect-[2/3] overflow-hidden rounded-xl bg-[var(--bg-surface)] ring-1 ring-[var(--border-subtle)] transition-[box-shadow,ring-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:ring-[rgba(201,168,76,0.5)] group-hover/card:shadow-[0_0_0_1px_rgba(201,168,76,0.5),0_0_25px_rgba(201,168,76,0.15)]"
          >
            {!loaded && <div className="skeleton absolute inset-0 z-[1]" />}

            <div className="relative h-full w-full transition-[filter] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:brightness-[0.55]">
              <PosterImage
                posterPath={movie.posterPath}
                title={movie.title}
                priority={priority}
                className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-[1.04]"
                onLoad={() => setLoaded(true)}
              />
            </div>

            <div
              className="pointer-events-none absolute inset-0 z-[2]"
              style={{
                background:
                  "linear-gradient(to top, #02020A 35%, rgba(2,2,10,0.6) 65%, transparent)",
              }}
            />

            <div className="absolute inset-x-0 bottom-0 z-[3] p-3 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-2 group-hover/card:opacity-0">
              <p className="line-clamp-2 text-[13px] font-semibold text-white">{movie.title}</p>
              <div className="mt-1 flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
                <span className="text-[var(--gold-primary)]">★</span>
                {movie.rating.toFixed(1)}
              </div>
            </div>

            <div className="absolute inset-x-0 bottom-0 z-[4] translate-y-full p-3 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:translate-y-0">
              <div className="flex flex-wrap gap-1">
                {movie.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="border border-[rgba(201,168,76,0.35)] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[var(--gold-bright)]"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
                DIR. {movie.director}
              </p>
              <span className="mt-2 inline-block text-[11px] font-medium uppercase tracking-wider text-[var(--gold-primary)]">
                Explore →
              </span>
            </div>
          </div>
        </Link>

        <button
          type="button"
          aria-label={`Play ${movie.title}`}
          onClick={() => openPlayer(movie)}
          className="absolute right-2 top-2 z-[5] flex h-9 w-9 scale-0 items-center justify-center rounded-full border border-[rgba(201,168,76,0.6)] bg-black/40 backdrop-blur-sm transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/card:scale-100"
        >
          <svg viewBox="0 0 24 24" fill="white" className="ml-0.5 h-3.5 w-3.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
