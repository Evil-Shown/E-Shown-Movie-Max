"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import { prefetchMovieStream } from "@/lib/stream-prefetch";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import styles from "./HeroBanner.module.css";

interface HeroCarouselProps {
  movies: Movie[];
}

export default function HeroCarousel({ movies }: HeroCarouselProps) {
  const prefersReducedMotion = useReducedMotion();
  const { openMovie, openTrailer } = useVideoPlayer();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const movie = movies[index] ?? movies[0];
  const primaryGenre = movie?.genres[0];

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % movies.length);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length <= 1 || paused || prefersReducedMotion) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [movies.length, paused, prefersReducedMotion, next]);

  if (!movie) return null;

  return (
    <section className={styles.hero} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
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
            src={backdropUrl(movie.backdropPath)}
            alt=""
            fill
            priority
            sizes="100vw"
            className={styles.backdropImage}
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
                    ▶ Play Now
                  </button>
                  <button type="button" className={styles.trailerButton} onClick={() => openTrailer(movie)}>
                    Watch Trailer
                  </button>
                  <Link href={`/movie/${movie.id}`} className={styles.moreButton}>
                    ℹ More Info
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
        <div className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {movies.map((m, i) => (
            <button
              key={m.id}
              type="button"
              aria-label={`Show ${m.title}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-8 bg-[var(--accent-warm)]" : "w-3 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
