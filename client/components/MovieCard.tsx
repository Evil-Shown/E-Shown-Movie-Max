"use client";

import type { Movie } from "@/lib/types";
import PosterImage from "@/components/PosterImage";
import RatingRing from "@/components/RatingRing";
import WatchlistButton from "@/components/WatchlistButton";
import { useQuickView } from "@/components/QuickViewProvider";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { recordPosterDwell } from "@/lib/storage/taste-signals";
import { useAfterHydration } from "@/lib/hooks/use-after-hydration";
import { useEffect, useRef, useState } from "react";
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
  const { continueWatching } = useUserLibrary();
  const afterHydration = useAfterHydration();
  const [loaded, setLoaded] = useState(false);
  const [externalRatings, setExternalRatings] = useState(movie.externalRatings ?? null);
  const cardRef = useRef<HTMLDivElement>(null);
  const dwellStartRef = useRef<number | null>(null);
  const dwellRecordedRef = useRef(false);

  const progress = afterHydration
    ? (continueWatching.find((item) => item.id === movie.id)?.progress ?? 0)
    : 0;

  useEffect(() => {
    if (externalRatings || typeof window === "undefined") return;

    const node = cardRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();

        const params = new URLSearchParams({ title: movie.title });
        if (movie.year > 0) params.set("year", String(movie.year));

        fetch(`/api/tmdb/search?${params.toString()}`)
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.externalRatings) {
              setExternalRatings(data.externalRatings);
            }
          })
          .catch(() => undefined);
      },
      { rootMargin: "250px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [externalRatings, movie.title, movie.year]);

  function handlePointerEnter() {
    dwellStartRef.current = Date.now();
  }

  function handlePointerLeave() {
    if (dwellRecordedRef.current || dwellStartRef.current === null) return;
    const seconds = (Date.now() - dwellStartRef.current) / 1000;
    if (seconds >= 2) {
      dwellRecordedRef.current = true;
      recordPosterDwell(
        {
          id: movie.id,
          title: movie.title,
          genres: movie.genres,
          mediaType: movie.mediaType,
        },
        seconds
      );
    }
    dwellStartRef.current = null;
  }

  return (
    <motion.div
      ref={cardRef}
      initial={false}
      whileHover={prefersReducedMotion ? undefined : { y: -2 }}
      transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
      className={styles.card}
      onMouseEnter={handlePointerEnter}
      onMouseLeave={handlePointerLeave}
      onFocus={handlePointerEnter}
      onBlur={handlePointerLeave}
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

            <div className="absolute right-2 top-2 z-[3]">
              <WatchlistButton movie={movie} />
            </div>

            <PosterImage
              posterPath={movie.posterPath}
              title={movie.title}
              priority={priority}
              className={styles.posterImage}
              onLoad={() => setLoaded(true)}
            />

            <div className={styles.posterOverlay} aria-hidden />
            <div className={styles.posterBar} aria-hidden />
            {progress > 0 && (
              <div className="absolute inset-x-0 bottom-0 z-[2] h-1 bg-black/35">
                <div className="h-full bg-[var(--accent-warm)]" style={{ width: `${Math.max(progress, 4)}%` }} />
              </div>
            )}

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
              <RatingRing rating={movie.rating} size={28} />
            </div>
            {externalRatings ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {typeof externalRatings.imdb === "number" ? (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                    IMDb {externalRatings.imdb.toFixed(1)}
                  </span>
                ) : null}
                {typeof externalRatings.rottenTomatoes === "number" ? (
                  <span className="rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-2 py-0.5 text-[10px] text-[var(--text-secondary)]">
                    RT {externalRatings.rottenTomatoes}%
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
