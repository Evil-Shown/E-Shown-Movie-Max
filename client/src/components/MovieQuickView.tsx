"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import PlayButton from "@/components/PlayButton";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

interface MovieQuickViewProps {
  movie: Movie | null;
  onClose: () => void;
}

export default function MovieQuickView({ movie, onClose }: MovieQuickViewProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!movie) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [movie, onClose]);

  return (
    <AnimatePresence>
      {movie && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150] bg-[rgba(23,27,36,0.62)] backdrop-blur-md"
            onClick={onClose}
          />
          <motion.div
            layoutId={`poster-${movie.id}`}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="glass-panel fixed inset-x-4 bottom-0 top-auto z-[151] mx-auto max-h-[90vh] max-w-4xl overflow-y-auto rounded-t-[2rem] border border-[var(--border-mid)] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.32)] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:w-full md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-5 h-36 overflow-hidden rounded-2xl ring-1 ring-white/10 md:h-44">
              <Image
                src={backdropUrl(movie.backdropPath)}
                alt=""
                fill
                className="object-cover"
                sizes="800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-elevated)] via-[rgba(42,49,69,0.35)] to-transparent" />
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              <motion.div layoutId={`poster-img-${movie.id}`} className="mx-auto w-[140px] shrink-0 md:mx-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-2xl shadow-[0_16px_42px_rgba(0,0,0,0.28)] ring-1 ring-[var(--border-mid)]">
                  <Image
                    src={posterUrl(movie.posterPath, "w342")}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
                </div>
              </motion.div>

              <div className="flex-1">
                <h2 className="font-cinzel text-cinema-glow text-2xl text-[var(--text-primary)] md:text-3xl">
                  {movie.title}
                </h2>
                <p className="font-cormorant mt-1 text-sm italic text-[var(--gold-bright)]">
                  {movie.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                  <span className="text-[var(--gold-primary)]">★ {movie.rating.toFixed(1)}</span>
                  <span>{movie.year}</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                  <span>Dir. {movie.director}</span>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {movie.overview}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <PlayButton movie={movie} label="Play" />
                  <Link
                    href={`/movie/${movie.id}`}
                    data-cursor="link"
                    className="inline-flex h-12 items-center rounded-full border border-[var(--border-mid)] bg-[rgba(32,38,54,0.46)] px-6 text-xs font-semibold uppercase tracking-wider text-[var(--text-primary)] transition hover:border-[var(--gold-primary)] hover:bg-[rgba(212,168,67,0.08)] active:scale-95"
                    onClick={onClose}
                  >
                    Full Details
                  </Link>
                  <button
                    type="button"
                    data-cursor="link"
                    onClick={onClose}
                    className="inline-flex h-12 items-center rounded-full px-4 text-xs uppercase tracking-wider text-[var(--text-secondary)] transition hover:bg-white/5 hover:text-[var(--text-primary)] active:scale-95"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
