"use client";

import type { Movie } from "@/lib/types";
import { backdropUrl, posterUrl } from "@/lib/movies";
import { getMovieEmbedUrl } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type PlayerMode = "movie" | "trailer";

interface VideoPlayerContextValue {
  openMovie: (movie: Movie) => void;
  openTrailer: (movie: Movie) => void;
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
  mode,
  onClose,
  onModeChange,
}: {
  movie: Movie;
  mode: PlayerMode;
  onClose: () => void;
  onModeChange: (mode: PlayerMode) => void;
}) {
  const isTrailer = mode === "trailer";
  const [loaded, setLoaded] = useState(false);
  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);
  const movieEmbedUrl = getMovieEmbedUrl(movie);
  const iframeSrc = isTrailer
    ? `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`
    : movieEmbedUrl;
  const playerLabel = isTrailer ? "Trailer" : "Now Streaming";
  const heroImage = backdropUrl(movie.backdropPath || movie.posterPath);
  const posterImage = posterUrl(movie.posterPath);

  useEffect(() => {
    setLoaded(false);
  }, [iframeSrc]);

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
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden bg-[rgba(18,15,12,0.96)] p-2 backdrop-blur-xl sm:p-4"
      onClick={onClose}
    >
      <div
        className="absolute inset-0 opacity-30 blur-3xl"
        style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="player-vignette absolute inset-0" />
      <div className="cinema-sweep pointer-events-none absolute inset-x-0 top-0 h-1/2" />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 28 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-[1.25rem] border border-[rgba(232,164,74,0.34)] bg-[rgba(247,244,239,0.96)] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative overflow-hidden border-b border-[rgba(201,106,43,0.18)] bg-[linear-gradient(135deg,rgba(28,25,23,0.96),rgba(80,45,26,0.92))] px-4 py-3 text-stone-50 sm:px-5">
          <div className="pointer-events-none absolute inset-0 opacity-20" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(28,25,23,0.96),rgba(28,25,23,0.72),rgba(28,25,23,0.94))]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-12 w-8 overflow-hidden rounded-md border border-white/15 bg-white/10 shadow-lg sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[rgba(232,164,74,0.42)] bg-[rgba(232,164,74,0.16)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f4c27a]">
                    {playerLabel}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-stone-200">
                    HD Cinema
                  </span>
                </div>
                <h2 className="mt-1 truncate font-[var(--font-playfair)] text-xl text-white sm:text-2xl">
                  {movie.title}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-stone-300">
                  <span>{movie.year}</span>
                  <span>/</span>
                  <span>{movie.runtime} min</span>
                  <span>/</span>
                  <span>{movie.genres.slice(0, 2).join(", ")}</span>
                  <span>/</span>
                  <span className="font-semibold text-[#f4c27a]">Rating {movie.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close player"
              data-cursor="link"
              className="group flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white hover:border-[#f4c27a] hover:bg-[#f4c27a] hover:text-stone-950 active:scale-95"
            >
              <span className="reel-close-icon" aria-hidden />
            </button>
          </div>
        </div>

        <div className="bg-[linear-gradient(180deg,#0f0d0b,#1c1917)] p-2 sm:p-3">
          <div className="player-screen-glow relative overflow-hidden rounded-xl border border-white/10 bg-black">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex justify-between px-3 py-2">
              <div className="flex gap-1.5">
                <span className="player-control-dot bg-[#ff5f56]" />
                <span className="player-control-dot bg-[#ffbd2e]" />
                <span className="player-control-dot bg-[#27c93f]" />
              </div>
              <span className="rounded-full bg-black/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/75 backdrop-blur">
                {isTrailer ? "Preview Mode" : "Full Movie"}
              </span>
            </div>

            <div className="relative aspect-video w-full bg-[var(--bg-dark)]">
          {iframeSrc ? (
                <>
                  {!loaded && (
                    <div className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-4 bg-black">
                      <div className="h-16 w-16 rounded-full border border-[#f4c27a]/30 border-t-[#f4c27a] animate-spin" />
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#f4c27a]">
                        Preparing Cinema
                      </p>
                    </div>
                  )}
                  <iframe
                    src={iframeSrc}
                    title={isTrailer ? `${movie.title} trailer` : `${movie.title} stream`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    onLoad={() => setLoaded(true)}
                    className="absolute inset-0 h-full w-full"
                  />
                </>
          ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,rgba(201,106,43,0.2),transparent_42%),#0f0d0b] px-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#f4c27a]/30 bg-[#f4c27a]/10 text-[#f4c27a]">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <h3 className="font-[var(--font-playfair)] text-2xl text-white">Stream Not Available</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-stone-300">
                    This title does not have a movie stream source yet. Try the trailer or another movie from the catalog.
                  </p>
                  <button
                    type="button"
                    onClick={() => onModeChange("trailer")}
                    className="mt-5 rounded-full bg-[#f4c27a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-950 hover:bg-white"
                  >
                    Watch Trailer
                  </button>
                </div>
              )}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 to-transparent" />
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--bg-card),var(--bg-secondary))] px-4 py-3 lg:grid-cols-[1fr_auto] lg:px-5">
          <div>
            <p className="line-clamp-1 font-[var(--font-playfair)] text-base italic text-[var(--text-primary)]">
              &ldquo;{movie.tagline}&rdquo;
            </p>
            <p className="mt-1 line-clamp-1 max-w-3xl text-xs leading-relaxed text-[var(--text-secondary)]">
              {movie.overview}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            <button
              type="button"
              onClick={() => onModeChange("movie")}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                !isTrailer
                  ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                  : "border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
              }`}
            >
              Movie
            </button>
            <button
              type="button"
              onClick={() => onModeChange("trailer")}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isTrailer
                  ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                  : "border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
              }`}
            >
              Trailer
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<{ movie: Movie; mode: PlayerMode } | null>(null);

  const openMovie = useCallback((movie: Movie) => setActive({ movie, mode: "movie" }), []);
  const openTrailer = useCallback((movie: Movie) => setActive({ movie, mode: "trailer" }), []);
  const changeMode = useCallback((mode: PlayerMode) => {
    setActive((current) => current ? { ...current, mode } : current);
  }, []);
  const closePlayer = useCallback(() => setActive(null), []);

  return (
    <VideoPlayerContext.Provider value={{ openMovie, openTrailer, closePlayer }}>
      {children}
      <AnimatePresence>
        {active && (
          <VideoPlayerModal
            movie={active.movie}
            mode={active.mode}
            onClose={closePlayer}
            onModeChange={changeMode}
          />
        )}
      </AnimatePresence>
    </VideoPlayerContext.Provider>
  );
}
