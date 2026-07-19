"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import { prefetchMovieStream } from "@/lib/stream-prefetch";
import { useVideoPlayer } from "@/components/VideoPlayerProvider";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import styles from "./HeroBanner.module.css";

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { openMovie, openTrailer } = useVideoPlayer();
  const primaryGenre = movie.genres[0];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const backdropY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const scrollLabelOpacity = useTransform(scrollYProgress, [0.85, 1], [1, 0]);

  return (
    <section ref={sectionRef} className={styles.hero}>
      <motion.div
        style={{
          y: prefersReducedMotion ? 0 : backdropY,
        }}
        className={styles.backdropWrap}
      >
        <Image
          src={backdropUrl(movie.backdropPath, "w1920")}
          alt=""
          fill
          priority
          quality={95}
          sizes="100vw"
          className={styles.backdropImage}
        />
      </motion.div>

      <div className={styles.gradientLeft} aria-hidden />
      <div className={styles.gradientBottom} aria-hidden />
      <div className={styles.gradientTop} aria-hidden />

      <div className={styles.inner}>
        <motion.div style={{ opacity: prefersReducedMotion ? 1 : contentOpacity }} className={styles.grid}>
          <div className={styles.contentCol}>
            <div className={styles.contentAmbient} aria-hidden />
            <div className={styles.contentWrap}>
              <p className={`${styles.badge} ${styles.fadeItem} ${styles.fadeBadge}`}>FEATURED PICK</p>

              <h1 className={`${styles.title} ${styles.fadeItem} ${styles.fadeTitle}`}>{movie.title}</h1>

              <div className={`${styles.metaRow} ${styles.fadeItem} ${styles.fadeMeta}`}>
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

              <p className={`${styles.description} ${styles.fadeItem} ${styles.fadeDescription}`}>{movie.overview}</p>

              <div className={`${styles.buttonRow} ${styles.fadeItem} ${styles.fadeButtons}`}>
                <button
                  type="button"
                  className={styles.watchButton}
                  onMouseEnter={() => prefetchMovieStream(movie)}
                  onFocus={() => prefetchMovieStream(movie)}
                  onClick={() => openMovie(movie)}
                >
                  Watch Now
                </button>
                <button type="button" className={styles.trailerButton} onClick={() => openTrailer(movie)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
                  </svg>
                  Trailer
                </button>
                <Link href={`/movie/${movie.id}`} className={styles.moreButton}>
                  More Info
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.posterCol}>
            <div className={styles.posterWrap}>
              <div className={styles.posterGlow} aria-hidden />
              <div className={styles.posterFrame}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterUrl(movie.posterPath, "w342")} alt={movie.title} className={styles.posterImage} />
                <div className={styles.posterSheen} aria-hidden />
                <div className={styles.posterBar} aria-hidden />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div style={{ opacity: prefersReducedMotion ? 1 : scrollLabelOpacity }} className={styles.scrollHint}>
        <span className={styles.scrollLabel}>SCROLL</span>
        <span className={styles.scrollLine} aria-hidden />
        <span className={styles.scrollChevron} aria-hidden />
      </motion.div>
    </section>
  );
}
