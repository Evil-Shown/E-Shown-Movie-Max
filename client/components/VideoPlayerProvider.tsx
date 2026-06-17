"use client";

import type { Movie } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";
import { backdropUrl, posterUrl } from "@/lib/movies";
import { PROVIDER_LABELS, STREAM_PROVIDERS, type StreamProvider } from "@/lib/providers";
import { getBestProvider, recordProviderLoad } from "@/lib/storage/provider-performance";
import {
  formatProviderSwitchMessage,
  getNextProvider,
  getStreamLoadTimeoutMs,
  getStabilityTip,
  warmStreamProviders,
} from "@/lib/stream-optimizer";
import { getMovieEmbedUrl, isTvShow } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import { AnimatePresence, motion } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type PlayerMode = "movie" | "trailer";

export interface OpenMovieOptions {
  season?: number;
  episode?: number;
  provider?: StreamProvider;
  resumeSeconds?: number;
}

interface VideoPlayerContextValue {
  openMovie: (movie: Movie, options?: OpenMovieOptions) => void;
  openTrailer: (movie: Movie) => void;
  closePlayer: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

async function safeExitFullscreen() {
  if (!document.fullscreenElement) return;
  try {
    await document.exitFullscreen();
  } catch {
    // Tab/window inactive, embed-owned fullscreen, or already exited.
  }
}

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}

interface ActivePlayer {
  movie: Movie;
  mode: PlayerMode;
  season?: number;
  episode?: number;
  provider: StreamProvider;
  resumeSeconds?: number;
}

function formatResumeTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

const MOVIE_LOADING_MESSAGES = [
  `Connecting to ${BRAND_NAME}…`,
  "Finding your stream source…",
  "Buffering video — this can take a moment…",
  "Almost ready — your film is loading…",
];

const TRAILER_LOADING_MESSAGES = [
  "Loading trailer preview…",
  "Opening video player…",
  "Almost ready…",
];

function PlayerLoadingOverlay({
  movie,
  isTrailer,
  provider,
  episodeLabel,
  resumeSeconds,
  heroImage,
  posterImage,
  autoSwitchMessage,
  stabilityTip,
}: {
  movie: Movie;
  isTrailer: boolean;
  provider: StreamProvider;
  episodeLabel: string | null;
  resumeSeconds?: number;
  heroImage: string;
  posterImage: string;
  autoSwitchMessage?: string | null;
  stabilityTip?: string | null;
}) {
  const messages = isTrailer ? TRAILER_LOADING_MESSAGES : MOVIE_LOADING_MESSAGES;
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    setMessageIndex(0);
    const timer = window.setInterval(() => {
      setMessageIndex((current) => (current + 1) % messages.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, [messages.length, isTrailer, provider, movie.id]);

  const statusLine = isTrailer
    ? "Trailer"
    : episodeLabel
      ? `${episodeLabel} · ${PROVIDER_LABELS[provider]}`
      : `HD Stream · ${PROVIDER_LABELS[provider]}`;

  return (
    <div className="player-loading-overlay absolute inset-0 z-[1] overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center opacity-55 blur-md"
        style={{ backgroundImage: `url(${heroImage})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,13,11,0.55),rgba(28,25,23,0.92))]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(201,106,43,0.18),transparent_58%)]" />

      <div className="relative flex h-full flex-col items-center justify-center px-6 py-8 text-center">
        <div className="player-loading-poster mb-5 overflow-hidden rounded-lg border border-[rgba(232,164,74,0.35)] shadow-[0_18px_48px_rgba(0,0,0,0.45)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={posterImage} alt="" className="h-28 w-[4.5rem] object-cover sm:h-36 sm:w-24" />
        </div>

        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f4c27a]/80">
          {isTrailer ? "Preview Mode" : "Now Loading"}
        </p>
        <h3 className="mt-2 max-w-md font-[var(--font-playfair)] text-2xl text-white sm:text-3xl">
          {movie.title}
        </h3>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-stone-300">
          {movie.year}
          <span className="mx-2 text-stone-500">·</span>
          {statusLine}
        </p>

        {resumeSeconds && resumeSeconds > 30 ? (
          <p className="mt-3 rounded-full border border-[rgba(232,164,74,0.28)] bg-[rgba(232,164,74,0.1)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4c27a]">
            Resuming from {formatResumeTime(resumeSeconds)}
          </p>
        ) : null}

        {stabilityTip ? (
          <p className="mt-3 max-w-sm rounded-full border border-[rgba(74,124,142,0.35)] bg-[rgba(74,124,142,0.12)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#a8d4e0]">
            {stabilityTip}
          </p>
        ) : null}

        {autoSwitchMessage ? (
          <p className="mt-3 max-w-sm text-sm font-medium text-[#f4c27a]">{autoSwitchMessage}</p>
        ) : null}

        <div className="player-loading-progress mt-8 w-full max-w-xs" aria-hidden>
          <div className="player-loading-progress-track">
            <div className="player-loading-progress-bar" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={messageIndex}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            className="mt-5 max-w-sm text-sm leading-relaxed text-stone-300"
          >
            {messages[messageIndex]}
          </motion.p>
        </AnimatePresence>

        <p className="mt-4 text-[10px] uppercase tracking-[0.18em] text-stone-500">
          Please wait — do not close this window
        </p>
      </div>
    </div>
  );
}

function VideoPlayerModal({
  active,
  onClose,
  onModeChange,
  onProviderChange,
}: {
  active: ActivePlayer;
  onClose: () => void;
  onModeChange: (mode: PlayerMode) => void;
  onProviderChange: (provider: StreamProvider) => void;
}) {
  const { movie, mode, season, episode, provider, resumeSeconds } = active;
  const { savePlayback, setProvider } = useUserLibrary();
  const isTrailer = mode === "trailer";
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState<string | null>(null);
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartedAtRef = useRef(Date.now());
  const failoverAttemptsRef = useRef(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stabilityTip = getStabilityTip();
  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);

  const movieEmbedUrl = isTrailer
    ? null
    : getMovieEmbedUrl(movie, provider, {
        season,
        episode,
        seek: resumeSeconds,
      });

  const iframeSrc = isTrailer
    ? `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`
    : movieEmbedUrl;

  const playerLabel = isTrailer ? "Trailer" : isTvShow(movie) ? "Now Streaming · TV" : "Now Streaming";
  const heroImage = backdropUrl(movie.backdropPath || movie.posterPath);
  const posterImage = posterUrl(movie.posterPath);
  const episodeLabel =
    season && episode ? `S${season} · E${episode}` : null;

  useEffect(() => {
    warmStreamProviders();
    failoverAttemptsRef.current = 0;
    setAutoSwitchMessage(null);
  }, [movie.id, mode]);

  useEffect(() => {
    setLoaded(false);
    setLoadFailed(false);
    loadStartedAtRef.current = Date.now();

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer && iframeSrc) {
      loadTimerRef.current = setTimeout(() => {
        if (failoverAttemptsRef.current >= STREAM_PROVIDERS.length - 1) {
          setLoadFailed(true);
          setAutoSwitchMessage(null);
          return;
        }

        const next = getNextProvider(provider);
        failoverAttemptsRef.current += 1;
        setAutoSwitchMessage(formatProviderSwitchMessage(next));
        onProviderChange(next);
        setProvider(next);
      }, getStreamLoadTimeoutMs());
    }

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    };
  }, [iframeSrc, isTrailer, provider, onProviderChange, setProvider]);

  useEffect(() => {
    if (!isTrailer && loaded && movieEmbedUrl) {
      setProvider(provider);
      savePlayback({
        movie,
        provider,
        season,
        episode,
        currentTime: resumeSeconds ?? 0,
        duration: (movie.runtime || 90) * 60,
      });
    }
  }, [loaded, isTrailer, movie, provider, season, episode, resumeSeconds, movieEmbedUrl, savePlayback, setProvider]);

  useEffect(() => {
    if (!showKeyboardHint) return;
    const timer = window.setTimeout(() => setShowKeyboardHint(false), 9000);
    return () => window.clearTimeout(timer);
  }, [showKeyboardHint]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (document.fullscreenElement) return;
      onClose();
    };
    const onFullscreenChange = () => {
      const active = document.fullscreenElement === stageRef.current;
      setIsFullscreen(active);
      if (active) {
        window.setTimeout(() => iframeRef.current?.focus(), 50);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      void safeExitFullscreen();
    };
  }, [onClose]);

  function focusPlayer() {
    iframeRef.current?.focus();
    setShowKeyboardHint(false);
  }

  async function toggleFullscreen() {
    const stage = stageRef.current;
    if (!stage) return;

    try {
      if (document.fullscreenElement === stage) {
        await safeExitFullscreen();
      } else {
        await stage.requestFullscreen();
        focusPlayer();
      }
    } catch {
      // Browser blocked fullscreen — user can still use the embed control.
    }
  }

  function handleProviderSwitch() {
    const next = getNextProvider(provider);
    onProviderChange(next);
    setProvider(next);
    setLoaded(false);
    setLoadFailed(false);
    setAutoSwitchMessage(formatProviderSwitchMessage(next));
    failoverAttemptsRef.current += 1;
  }

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
        className="relative flex h-[92dvh] max-h-[92dvh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.25rem] border border-[rgba(232,164,74,0.34)] bg-[rgba(247,244,239,0.96)] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative shrink-0 overflow-hidden border-b border-[rgba(201,106,43,0.18)] bg-[linear-gradient(135deg,rgba(28,25,23,0.96),rgba(80,45,26,0.92))] px-4 py-3 text-stone-50 sm:px-5">
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
                  {!isTrailer && (
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-stone-400">
                      {episodeLabel ?? "HD Stream"}
                    </span>
                  )}
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
                  {resumeSeconds && resumeSeconds > 30 ? (
                    <>
                      <span>/</span>
                      <span className="text-[#f4c27a]">Resume {formatResumeTime(resumeSeconds)}</span>
                    </>
                  ) : null}
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

        <div className="flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#0f0d0b,#1c1917)] p-2 sm:p-3">
          <div
            ref={stageRef}
            className={`player-stage player-screen-glow relative flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-xl bg-black ${
              isTrailer ? "border border-white/10" : "player-cinema-frame"
            }`}
          >
            <div className="player-video-fit bg-[var(--bg-dark)]">
              {!isFullscreen && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-[2]">
                  <div className={`player-cinema-bar ${isTrailer ? "player-cinema-bar--trailer" : ""}`} />
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="font-[var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f4c27a]/90">
                      {isTrailer ? "Preview" : BRAND_NAME}
                    </span>
                    <span className="rounded-full border border-[rgba(232,164,74,0.28)] bg-[rgba(28,25,23,0.72)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4c27a]/85 backdrop-blur">
                      {isTrailer ? "Trailer" : isTvShow(movie) ? "Streaming · TV" : "Now Playing"}
                    </span>
                  </div>
                </div>
              )}

              {iframeSrc && loaded && (
                <div className="pointer-events-none absolute top-2 right-2 z-[5] flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className="pointer-events-auto flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:border-[#f4c27a] hover:bg-[#f4c27a] hover:text-stone-950"
                  >
                    {isFullscreen ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                        <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden>
                        <path d="M4 9V4h5M15 4h5v5M4 15v5h5M20 15v5h-5" />
                      </svg>
                    )}
                  </button>
                </div>
              )}

              {iframeSrc ? (
                <>
                  {!loaded && (
                    <PlayerLoadingOverlay
                      movie={movie}
                      isTrailer={isTrailer}
                      provider={provider}
                      episodeLabel={episodeLabel}
                      resumeSeconds={resumeSeconds}
                      heroImage={heroImage}
                      posterImage={posterImage}
                      autoSwitchMessage={autoSwitchMessage}
                      stabilityTip={stabilityTip}
                    />
                  )}
                  {loadFailed && !loaded && (
                    <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-3 bg-black/80 px-6 text-center">
                      <p className="text-sm text-stone-200">Stream is taking too long or unavailable on {PROVIDER_LABELS[provider]}.</p>
                      <button
                        type="button"
                        onClick={handleProviderSwitch}
                        className="rounded-full bg-[#f4c27a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-950 hover:bg-white"
                      >
                        Try Next Provider
                      </button>
                    </div>
                  )}
                  <iframe
                    ref={iframeRef}
                    key={`${provider}-${iframeSrc}`}
                    src={iframeSrc}
                    title={isTrailer ? `${movie.title} trailer` : `${movie.title} stream`}
                    tabIndex={0}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                    allowFullScreen
                    onLoad={() => {
                      recordProviderLoad(provider, Date.now() - loadStartedAtRef.current);
                      setLoaded(true);
                      setLoadFailed(false);
                      setAutoSwitchMessage(null);
                      setShowKeyboardHint(true);
                      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
                      window.setTimeout(() => iframeRef.current?.focus(), 100);
                    }}
                    onPointerDown={focusPlayer}
                    className="player-embed-iframe absolute inset-0 z-[1] h-full w-full border-0"
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
                    This title does not have a stream source yet. Try the trailer or another title.
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
              {showKeyboardHint && loaded && !isFullscreen && (
                <div className="pointer-events-none absolute bottom-3 left-1/2 z-[4] -translate-x-1/2">
                  <p className="rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-stone-200 backdrop-blur">
                    Click video · Space to play/pause · Arrows to seek
                  </p>
                </div>
              )}
            </div>
          </div>
          {loaded && iframeSrc && (
            <p className="mt-2 text-center text-[10px] text-stone-500">
              Use the player timeline to jump to any moment. Click inside the video first for keyboard shortcuts.
            </p>
          )}
        </div>

        <div className="grid shrink-0 gap-3 border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--bg-card),var(--bg-secondary))] px-4 py-3 lg:grid-cols-[1fr_auto] lg:px-5">
          <div>
            <p className="line-clamp-1 font-[var(--font-playfair)] text-base italic text-[var(--text-primary)]">
              &ldquo;{movie.tagline || movie.title}&rdquo;
            </p>
            <p className="mt-1 line-clamp-1 max-w-3xl text-xs leading-relaxed text-[var(--text-secondary)]">
              {movie.overview}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {!isTrailer && iframeSrc && (
              <button
                type="button"
                onClick={handleProviderSwitch}
                className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
              >
                Not working? Switch
              </button>
            )}
            <button
              type="button"
              onClick={() => onModeChange("movie")}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                !isTrailer
                  ? "bg-[var(--accent-primary)] text-[var(--text-inverse)]"
                  : "border border-[var(--border-strong)] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
              }`}
            >
              {isTvShow(movie) ? "Episode" : "Movie"}
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
  const { preferredProvider, getResumeTime } = useUserLibrary();
  const [active, setActive] = useState<ActivePlayer | null>(null);

  const openMovie = useCallback(
    (movie: Movie, options?: OpenMovieOptions) => {
      warmStreamProviders();
      const resume = options?.resumeSeconds ?? getResumeTime(movie.id);
      const provider = options?.provider ?? getBestProvider(preferredProvider);
      setActive({
        movie,
        mode: "movie",
        season: options?.season ?? (isTvShow(movie) ? 1 : undefined),
        episode: options?.episode ?? (isTvShow(movie) ? 1 : undefined),
        provider,
        resumeSeconds: resume > 30 ? resume : undefined,
      });
    },
    [preferredProvider, getResumeTime]
  );

  const openTrailer = useCallback((movie: Movie) => setActive({ movie, mode: "trailer", provider: preferredProvider }), [preferredProvider]);
  const changeMode = useCallback((mode: PlayerMode) => {
    setActive((current) => (current ? { ...current, mode } : current));
  }, []);
  const changeProvider = useCallback((provider: StreamProvider) => {
    setActive((current) => (current ? { ...current, provider } : current));
  }, []);
  const closePlayer = useCallback(() => setActive(null), []);

  return (
    <VideoPlayerContext.Provider value={{ openMovie, openTrailer, closePlayer }}>
      {children}
      <AnimatePresence>
        {active && (
          <VideoPlayerModal
            active={active}
            onClose={closePlayer}
            onModeChange={changeMode}
            onProviderChange={changeProvider}
          />
        )}
      </AnimatePresence>
    </VideoPlayerContext.Provider>
  );
}
