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
  const { openPlayer } = useVideoPlayer();
  const { openQuickView } = useQuickView();
  const [loaded, setLoaded] = useState(false);

  return (
    <motion.div
      variants={scaleInVariant}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.03 }}
      transition={{ type: "tween", duration: 0.15, ease: "easeOut" }}
      className="group/card relative shrink-0"
    >
      {rank !== undefined && (
        <span
          aria-hidden
          className="font-cinzel pointer-events-none absolute -bottom-1 left-0 z-[1] translate-y-[15px] text-[72px] leading-none text-[rgba(212,168,67,0.12)] transition-colors duration-150 group-hover/card:text-[rgba(212,168,67,0.35)]"
        >
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <div className="relative z-[2]">
        <Link href={`/movie/${movie.id}`} className="sr-only">
          View {movie.title}
        </Link>

        <motion.div
          layoutId={`poster-${movie.id}`}
          role="button"
          tabIndex={0}
          data-cursor="link"
          onClick={() => openQuickView(movie)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openQuickView(movie);
            }
          }}
          className="card-hover-shimmer card-3d-tilt card-surface relative aspect-[2/3] overflow-hidden rounded-2xl ring-1 ring-[rgba(255,255,255,0.14)] transition-[box-shadow,ring-color] duration-150 ease-out group-hover/card:ring-[rgba(212,168,67,0.5)] group-hover/card:shadow-[0_20px_46px_rgba(0,0,0,0.32),0_0_25px_var(--gold-glow)]"
        >
          {!loaded && <div className="skeleton absolute inset-0 z-[1]" />}

          <div className="relative h-full w-full transition-[filter] duration-150 ease-out group-hover/card:brightness-[0.68]">
            <PosterImage
              posterPath={movie.posterPath}
              title={movie.title}
              priority={priority}
              className="h-full w-full object-cover transition-transform duration-200 ease-out group-hover/card:scale-[1.04]"
              onLoad={() => setLoaded(true)}
            />
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[2]"
            style={{
              background:
                "linear-gradient(to top, rgba(32,38,54,0.96) 12%, rgba(32,38,54,0.72) 42%, transparent)",
            }}
          />

          <div className="absolute inset-x-0 bottom-0 z-[3] p-3 transition-all duration-150 ease-out group-hover/card:translate-y-2 group-hover/card:opacity-0">
            <p className="line-clamp-2 text-[13px] font-semibold text-white">{movie.title}</p>
            <div className="mt-1 flex items-center gap-1 text-[12px] text-[var(--text-secondary)]">
              <span className="text-[var(--gold-primary)]">★</span>
              {movie.rating.toFixed(1)}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-[4] translate-y-full rounded-t-2xl border-t border-white/10 bg-[rgba(32,38,54,0.9)] p-3 backdrop-blur-md transition-transform duration-150 ease-out group-hover/card:translate-y-0">
            <div className="flex flex-wrap gap-1">
              {movie.genres.slice(0, 2).map((g) => (
                <span
                  key={g}
                  className="border border-[rgba(212,168,67,0.35)] px-1.5 py-0.5 text-[8px] uppercase tracking-wider text-[var(--gold-bright)]"
                >
                  {g}
                </span>
              ))}
            </div>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--text-dim)]">
              DIR. {movie.director}
            </p>
            <span className="mt-2 inline-block text-[11px] font-medium uppercase tracking-wider text-[var(--gold-primary)]">
              Quick View →
            </span>
          </div>
        </motion.div>

        <button
          type="button"
          aria-label={`Play ${movie.title}`}
          data-cursor="play"
          onClick={(e) => {
            e.stopPropagation();
            openPlayer(movie);
          }}
          className="play-btn-ring absolute right-2 top-2 z-[5] flex h-9 w-9 scale-100 items-center justify-center rounded-full border border-[rgba(212,168,67,0.68)] bg-[rgba(32,38,54,0.72)] shadow-[0_8px_24px_rgba(0,0,0,0.25)] backdrop-blur-sm transition-transform duration-150 ease-out active:scale-95 md:scale-0 md:group-hover/card:scale-100"
        >
          <svg viewBox="0 0 24 24" fill="white" className="relative z-[1] ml-0.5 h-3.5 w-3.5">
            <path d="M8 5v14l11-7z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
