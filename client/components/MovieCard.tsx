"use client";

import type { Movie } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import { useQuickView } from "@/components/QuickViewProvider";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";
import styles from "./MovieCard.module.css";

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
      initial={false}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className={styles.card}
    >
      {rank !== undefined && (
        <span aria-hidden className={styles.rank}>
          {String(rank).padStart(2, "0")}
        </span>
      )}

      <div className={`${styles.body} ${rank !== undefined ? styles.bodyRanked : ""}`}>
        <Link href={`/movie/${movie.id}`} className={styles.srOnly}>
          View {movie.title}
        </Link>

        <div
          role="button"
          tabIndex={0}
          onClick={() => openQuickView(movie)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              openQuickView(movie);
            }
          }}
        >
          <div className={styles.poster}>
            {!loaded && <div className="skeleton absolute inset-0 z-[1]" />}

            <PosterImage
              posterPath={movie.posterPath}
              title={movie.title}
              priority={priority}
              className={styles.posterImage}
              onLoad={() => setLoaded(true)}
            />

            <div className={styles.posterOverlay} aria-hidden />
            <div className={styles.posterBar} aria-hidden />

            <button
              type="button"
              aria-label={`Play ${movie.title}`}
              onClick={(e) => {
                e.stopPropagation();
                openMovie(movie);
              }}
              className={styles.watchBtn}
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch
            </button>
          </div>

          <div className={styles.meta}>
            <div className={styles.titleRow}>
              <p className={styles.title}>{movie.title}</p>
              {movie.mediaType === "tv" && <span className={styles.seriesBadge}>Series</span>}
            </div>
            <div className={styles.statsRow}>
              <span className={styles.year}>{movie.year}</span>
              <span className={styles.rating}>★ {movie.rating.toFixed(1)}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
