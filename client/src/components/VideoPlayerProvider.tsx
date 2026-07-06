"use client";

import type { Movie } from "@/lib/types";
import { getTrailerId } from "@/lib/trailers";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

interface VideoPlayerContextValue {
  openPlayer: (movie: Movie) => void;
  closePlayer: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}

function VideoPlayerModal({
  movie,
  onClose,
}: {
  movie: Movie;
  onClose: () => void;
}) {
  const trailerId = getTrailerId(movie.id);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 p-4 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="gold-glow relative w-full max-w-5xl overflow-hidden border border-[var(--border-mid)] bg-[var(--bg-void)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] px-5 py-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-[var(--gold-primary)]">
              Now Playing
            </p>
            <h2 className="font-cinzel mt-1 text-xl text-[var(--text-primary)] sm:text-2xl">
              {movie.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close player"
            className="flex h-10 w-10 items-center justify-center border border-[var(--border-mid)] text-[var(--text-secondary)] transition hover:border-[var(--gold-primary)] hover:text-[var(--gold-primary)]"
          >
            ✕
          </button>
        </div>

        <div className="relative aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`}
            title={`${movie.title} trailer`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 h-full w-full"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/80 to-transparent" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border-subtle)] px-5 py-4">
          <p className="font-cormorant max-w-xl text-sm italic text-[var(--text-secondary)]">
            &ldquo;{movie.tagline}&rdquo;
          </p>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-[var(--text-dim)]">
            <span>{movie.year}</span>
            <span>·</span>
            <span className="text-[var(--gold-primary)]">★ {movie.rating.toFixed(1)}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);

  const openPlayer = useCallback((movie: Movie) => setActiveMovie(movie), []);
  const closePlayer = useCallback(() => setActiveMovie(null), []);

  return (
    <VideoPlayerContext.Provider value={{ openPlayer, closePlayer }}>
      {children}
      <AnimatePresence>
        {activeMovie && (
          <VideoPlayerModal movie={activeMovie} onClose={closePlayer} />
        )}
      </AnimatePresence>
    </VideoPlayerContext.Provider>
  );
}
