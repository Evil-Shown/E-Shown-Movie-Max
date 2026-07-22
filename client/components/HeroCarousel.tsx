"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import { prefetchMovieStream } from "@/lib/stream-prefetch";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./HeroBanner.module.css";

interface HeroCarouselProps {
  movies: Movie[];
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const { openMovie, openTrailer } = useVideoPlayer();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const movie = movies[index] ?? movies[0];
  const primaryGenre = movie?.genres[0];

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % movies.length);
  }, [movies.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + movies.length) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length <= 1 || paused || prefersReducedMotion) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [movies.length, paused, prefersReducedMotion, next]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
    setPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current == null) return;
    touchDeltaX.current = (e.touches[0]?.clientX ?? 0) - touchStartX.current;
  };

  const onTouchEnd = () => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setPaused(false);
    if (Math.abs(delta) < 48 || movies.length <= 1) return;
    if (delta < 0) next();
    else prev();
  };

  if (!movie) return null;

  return (
    <section
      className={styles.hero}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={movie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className={styles.backdropWrap}
        >
          <Image
            src={backdropUrl(movie.backdropPath, "w1280")}
            alt=""
            fill
            priority
            quality={90}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 100vw, 1280px"
            className={styles.backdropImage}
            style={{ objectFit: "cover" }}
          />
        </motion.div>
      </AnimatePresence>

      <div className={styles.gradientLeft} aria-hidden />
      <div className={styles.gradientBottom} aria-hidden />
      <div className={styles.gradientTop} aria-hidden />

      <div className={styles.inner}>
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${movie.id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
            className={styles.grid}
          >
            <div className={styles.contentCol}>
              <div className={styles.contentAmbient} aria-hidden />
              <div className={styles.contentWrap}>
                <p className={`${styles.badge} ${styles.fadeItem}`}>NOW PLAYING</p>
                <h1 className={`${styles.title} ${styles.fadeItem}`}>{movie.title}</h1>

                <div className={`${styles.metaRow} ${styles.fadeItem}`}>
                  <span className={styles.ratingPill}>★ {movie.rating.toFixed(1)}</span>
                  <span className={styles.metaDot} />
                  <span className={styles.metaText}>{movie.year}</span>
                  {movie.runtime > 0 && (
                    <>
                      <span className={styles.metaDot} />
                      <span className={styles.metaText}>{formatRuntime(movie.runtime)}</span>
                    </>
                  )}
                  {primaryGenre && <span className={styles.genrePill}>{primaryGenre}</span>}
                </div>

                <p className={`${styles.description} ${styles.fadeItem}`}>{movie.overview}</p>

                <div className={`${styles.buttonRow} ${styles.fadeItem}`}>
                  <button
                    type="button"
                    className={styles.watchButton}
                    onMouseEnter={() => prefetchMovieStream(movie)}
                    onFocus={() => prefetchMovieStream(movie)}
                    onClick={() => openMovie(movie)}
                  >
                    <span className={styles.playIcon} aria-hidden>
                      ▶
                    </span>
                    <span className={styles.playLabel}>Play Now</span>
                  </button>
                  <button
                    type="button"
                    className={styles.trailerButton}
                    onClick={() => openTrailer(movie)}
                    aria-label="Watch Trailer"
                  >
                    <span className={styles.trailerIcon} aria-hidden>
                      ▷
                    </span>
                    <span className={styles.trailerLabel}>Watch Trailer</span>
                  </button>
                  <Link href={`/movie/${movie.id}`} className={styles.moreButton} aria-label="More Info">
                    <span className={styles.moreIcon} aria-hidden>
                      ℹ
                    </span>
                    <span className={styles.moreLabel}>More Info</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.posterCol}>
              <div className={styles.posterWrap}>
                <div className={styles.posterFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={posterUrl(movie.posterPath, "w342")} alt={movie.title} className={styles.posterImage} />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {movies.length > 1 && (
        <div className={styles.dots}>
          {movies.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={`Show ${m.title}`}
              onClick={() => setIndex(i)}
              className={`${styles.dot} ${i === index ? styles.dotActive : ""}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
