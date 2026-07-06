"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, formatRuntime, posterUrl } from "@/lib/movies";
import PlayButton from "@/components/PlayButton";
import TrailerButton from "@/components/TrailerButton";
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
            className="fixed inset-0 z-[150] bg-[rgba(28,25,23,0.32)] backdrop-blur-[4px]"
            onClick={onClose}
          />
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="glass-panel fixed inset-x-4 bottom-0 top-auto z-[151] mx-auto max-h-[90vh] max-w-4xl overflow-y-auto rounded-t-2xl border border-[var(--border-strong)] p-6 shadow-[0_30px_90px_rgba(28,25,23,0.24)] md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:max-h-[85vh] md:w-full md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-5 h-36 overflow-hidden rounded-xl ring-1 ring-[var(--border)] md:h-44">
              <Image
                src={backdropUrl(movie.backdropPath)}
                alt=""
                fill
                className="object-cover"
                sizes="800px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[rgba(247,244,239,0.35)] to-transparent" />
            </div>

            <div className="flex flex-col gap-6 md:flex-row">
              <div className="mx-auto w-[140px] shrink-0 md:mx-0">
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl shadow-[0_16px_42px_rgba(28,25,23,0.22)] ring-1 ring-[var(--border-strong)]">
                  <Image
                    src={posterUrl(movie.posterPath, "w500")}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="140px"
                  />
                </div>
              </div>

              <div className="flex-1">
                <h2 className="font-[var(--font-playfair)] text-2xl text-[var(--text-primary)] md:text-3xl">
                  {movie.title}
                </h2>
                <p className="mt-1 font-[var(--font-playfair)] text-sm italic text-[var(--text-secondary)]">
                  {movie.tagline}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs text-[var(--text-secondary)]">
                  <span className="font-semibold text-[var(--accent-warm)]">★ {movie.rating.toFixed(1)}</span>
                  <span>{movie.year}</span>
                  <span>{formatRuntime(movie.runtime)}</span>
                  <span>Dir. {movie.director}</span>
                </div>
                <p className="mt-4 line-clamp-4 text-sm leading-relaxed text-[var(--text-secondary)]">
                  {movie.overview}
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <PlayButton movie={movie} label="Play" />
                  <TrailerButton movie={movie} />
                  <Link
                    href={`/movie/${movie.id}`}
                    data-cursor="link"
                    className="inline-flex h-12 items-center rounded-md border border-[var(--border-strong)] bg-transparent px-6 text-xs font-semibold uppercase tracking-[0.15em] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] active:scale-95"
                    onClick={onClose}
                  >
                    Full Details
                  </Link>
                  <button
                    type="button"
                    data-cursor="link"
                    onClick={onClose}
                    className="inline-flex h-12 items-center rounded-md px-4 text-xs uppercase tracking-[0.15em] text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] active:scale-95"
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
