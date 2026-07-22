"use client";

import type { StreamProvider } from "@/lib/providers";
import { PROVIDER_LABELS } from "@/lib/providers";
import { BRAND_NAME } from "@/lib/brand";
import { isTvShow, resolveMediaStream, resolveTmdbId, type ResolvedMediaStream } from "@/lib/streaming";
import { proxifySubtitleUrl } from "@/lib/subtitles-client";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibraryActions } from "@/components/UserLibraryProvider";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/AuthModalProvider";
import PlayerTvSelector from "@/components/PlayerTvSelector";
import PlayerNextEpisodeOverlay from "@/components/PlayerNextEpisodeOverlay";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState, useCallback } from "react";
import { isSlowConnection } from "@/lib/stream-optimizer";
import PlayerLoadingOverlay from "./PlayerLoadingOverlay";
import PlayerScrubber from "./PlayerScrubber";
import EmbedStreamFrame from "./EmbedStreamFrame";
import HlsStreamFrame, { type HlsStreamFrameHandle, type HlsQualityLevel } from "./HlsStreamFrame";
import { useProviderFallback } from "./hooks/useProviderFallback";
import { useResumeTime } from "./hooks/useResumeTime";
import { useSubtitles } from "./hooks/useSubtitles";
import { usePlayerViewport } from "./hooks/usePlayerViewport";
import { useVideoPlayer } from "./hooks/useVideoPlayer";
import type { ActivePlayer, PlayerMode } from "./types";

interface ActiveDownload {
  downloadId: string;
  percentage: number;
  filename: string;
}

interface VideoPlayerModalProps {
  active: ActivePlayer;
  onClose: () => void;
  onModeChange: (mode: PlayerMode) => void;
  onProviderChange: (provider: StreamProvider) => void;
  onSeasonEpisodeChange: (season: number, episode: number) => void;
}

export default function VideoPlayerModal({
  active,
  onClose,
  onModeChange,
  onProviderChange,
  onSeasonEpisodeChange,
}: VideoPlayerModalProps) {
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { movie, mode, season, episode, provider, resumeSeconds } = active;
  const { setProvider } = useUserLibraryActions();
  const [playerEngaged, setPlayerEngaged] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [hlsQualityLevels, setHlsQualityLevels] = useState<HlsQualityLevel[]>([]);
  const [selectedQualityIndex, setSelectedQualityIndex] = useState<number>(-1);
  const [showQualityDropdown, setShowQualityDropdown] = useState(false);
  const hlsFrameRef = useRef<HlsStreamFrameHandle>(null);
  const setLoadedRef = useRef<(value: boolean) => void>(() => {});

  const [activeDownloads, setActiveDownloads] = useState<ActiveDownload[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const desktopApi = typeof window !== "undefined" ? window.chithraDesktop : undefined;

  const FadeLoading = ({ children }: { children: React.ReactNode }) => (
    <AnimatePresence>
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="absolute inset-0 z-[1]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );

  useEffect(() => {
    const api = desktopApi;
    if (!api?.onDownloadProgress) return;
    return api.onDownloadProgress((payload) => {
      setActiveDownloads((prev) => {
        const existing = prev.find((d) => d.downloadId === payload.downloadId);
        if (payload.done) {
          return prev.filter((d) => d.downloadId !== payload.downloadId);
        }
        if (existing) {
          return prev.map((d) =>
            d.downloadId === payload.downloadId ? { ...d, percentage: payload.percentage } : d
          );
        }
        return [
          ...prev,
          { downloadId: payload.downloadId, percentage: payload.percentage, filename: "Downloading..." },
        ];
      });
    });
  }, [desktopApi]);

  const handleDownload = useCallback(async () => {
    const api = desktopApi;
    if (!api?.downloadMedia) return;
    const tmdbId = resolveTmdbId(movie);
    if (!tmdbId) return;
    const tv = isTvShow(movie);
    try {
      await api.downloadMedia({
        tmdbId,
        type: tv ? "tv" : "movie",
        season: tv ? (season ?? 1) : undefined,
        episode: tv ? (episode ?? 1) : undefined,
      });
    } catch {
      // download failed silently — progress listener handles UI
    }
  }, [desktopApi, movie, season, episode]);

  const handleCancelDownload = useCallback(
    (downloadId: string) => {
      desktopApi?.cancelDownload?.(downloadId);
      setActiveDownloads((prev) => prev.filter((d) => d.downloadId !== downloadId));
    },
    [desktopApi]
  );

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        setShowDiagnostics((prev) => !prev);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!showQualityDropdown) return;
    const onPointer = () => setShowQualityDropdown(false);
    document.addEventListener("pointerdown", onPointer);
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [showQualityDropdown]);

  useEffect(() => {
    if (hlsFrameRef.current) {
      hlsFrameRef.current.setQualityLevel(selectedQualityIndex);
    }
  }, [selectedQualityIndex]);

  // Auth gate: block playback if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      openAuthModal({ redirectOnClose: true });
      onClose();
    }
  }, [isAuthenticated, openAuthModal, onClose]);

  const isTrailer = mode === "trailer";
  const isTvPlayer = !isTrailer && isTvShow(movie);

  const subtitles = useSubtitles({
    movie,
    season,
    episode,
    isTvPlayer,
    onEpisodeSubtitleReload: () => {
      setPlayerEngaged(false);
      setLoadedRef.current(false);
    },
  });

  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);
  const [resolvedStream, setResolvedStream] = useState<ResolvedMediaStream | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const resolveOptions = { season, episode, seek: resumeSeconds };

  useEffect(() => {
    let cancelled = false;
    setResolvedStream(null);
    setIsResolving(true);

    if (isTrailer) {
      setIsResolving(false);
      return;
    }

    resolveMediaStream(movie, provider, resolveOptions).then((result) => {
      if (!cancelled) {
        setResolvedStream(result);
        setIsResolving(false);
        if (result?.isGeoBypassed) {
          showToast("Bypassing regional restriction (IN)...");
        }
        if (result?.isAdStripped && !result?.isGeoBypassed) {
          showToast("Ads removed from stream.");
        }
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movie.id, provider, season, episode, mode, resumeSeconds]);

  const streamSrc = isTrailer ? null : resolvedStream?.url ?? null;
  const iframeSrc = isTrailer
    ? `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`
    : resolvedStream?.type === "embed"
      ? resolvedStream.url
      : null;
  const currentTmdbId = resolveTmdbId(movie);

  const {
    loaded: fallbackLoaded,
    setLoaded: fallbackSetLoaded,
    loadFailed: fallbackLoadFailed,
    autoSwitchMessage: fallbackAutoSwitchMessage,
    providerLogs,
    handleProviderSwitch: fallbackHandleProviderSwitch,
    handleStreamError: fallbackHandleStreamError,
    confirmPlayback: fallbackConfirmPlayback,
    handleIframeLoad: fallbackHandleIframeLoad,
  } = useProviderFallback({
    provider,
    isTrailer,
    streamSrc,
    playerEngaged,
    tmdbId: currentTmdbId,
    onProviderChange,
    setProvider,
    resetKey: `${movie.id}-${mode}`,
  });

  useEffect(() => {
    setLoadedRef.current = fallbackSetLoaded;
  }, [fallbackSetLoaded]);

  const resume = useResumeTime(resumeSeconds);

  const {
    isFullscreen,
    isFauxFullscreen,
    showKeyboardHint,
    showNextEpisode,
    nextEpisodeCountdown,
    nextEpisodeProgress,
    nextEpisodeTarget,
    nextEpisodeSummary,
    nextEpisodeAuto,
    stabilityTip,
    rawEmbedUrl,
    playerLabel,
    displayYear,
    heroImage,
    posterImage,
    episodeLabel,
    isHlsStream,
    stageRef,
    iframeRef,
    toggleFullscreen,
    openStreamInBrowserTab,
    playNextEpisode,
    dismissNextEpisode,
    handleIframeLoadComplete,
    playbackCurrentTime,
    playbackDuration,
  } = useVideoPlayer({
    movie,
    mode,
    season,
    episode,
    provider,
    resumeSeconds,
    resolvedStream,
    loaded: fallbackLoaded,
    playerEngaged,
    setPlayerEngaged,
    confirmPlayback: fallbackConfirmPlayback,
    onClose,
    onSeasonEpisodeChange,
  });

  const { isMobile, isLandscape } = usePlayerViewport(true);
  const immersiveLandscape = isMobile && isLandscape;
  const fsActive = isFullscreen || isFauxFullscreen;
  const showFloatChrome = isMobile && (fsActive || immersiveLandscape);
  const slowConnection = isSlowConnection();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`player-modal-shell fixed inset-0 z-[200] flex overflow-hidden bg-[rgba(18,15,12,0.96)] ${
        slowConnection ? "" : "backdrop-blur-xl"
      } ${isTvPlayer ? "p-0" : "items-center justify-center p-0 sm:p-2 md:p-4"} ${
        immersiveLandscape ? "player-modal-shell--immersive" : ""
      } ${fsActive && isMobile ? "player-modal-shell--fs-active" : ""}`}
      onClick={onClose}
    >
      {!isTvPlayer ? (
        <>
          <div
            className="absolute inset-0 opacity-30 blur-3xl max-sm:opacity-20"
            style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="player-vignette absolute inset-0" />
          <div className="cinema-sweep pointer-events-none absolute inset-x-0 top-0 h-1/2 max-sm:hidden" />
          <AnimatePresence>
            {toastMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="pointer-events-none absolute left-1/2 top-4 z-[220] -translate-x-1/2"
              >
                <div className="rounded-full border border-[rgba(232,164,74,0.4)] bg-[rgba(28,25,23,0.92)] px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f4c27a] shadow-lg backdrop-blur-sm">
                  {toastMessage}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : null}

      <motion.div
        initial={isTvPlayer ? { opacity: 0 } : { scale: 0.94, opacity: 0, y: 28 }}
        animate={isTvPlayer ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
        exit={isTvPlayer ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex w-full flex-col overflow-hidden bg-[rgba(247,244,239,0.98)] ${
          isTvPlayer
            ? "h-[100dvh] max-h-[100dvh] rounded-none border-0 shadow-none"
            : "h-[100dvh] max-h-[100dvh] max-w-none rounded-none border-0 shadow-none sm:h-[92dvh] sm:max-h-[92dvh] sm:max-w-6xl sm:rounded-[1.25rem] sm:border sm:border-[rgba(232,164,74,0.34)] sm:shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`player-modal-header relative shrink-0 overflow-hidden border-b border-[rgba(201,106,43,0.18)] bg-[linear-gradient(135deg,#fffdf9,#f3ebe0)] dark:border-[var(--border)] dark:bg-[linear-gradient(135deg,var(--bg-card),var(--bg-secondary))] ${
            isTvPlayer ? "px-3 py-2 sm:px-4" : "px-3 py-2.5 sm:px-5 sm:py-3"
          }`}
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.12]"
            style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,249,0.94),rgba(255,253,249,0.78),rgba(255,253,249,0.94))] dark:bg-[linear-gradient(90deg,var(--hero-veil),var(--hero-veil-mid),var(--hero-veil))]" />
          <div className="relative flex items-center justify-between gap-2 sm:gap-3">
            <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
              <div className="hidden h-12 w-8 overflow-hidden rounded-md border border-[rgba(201,106,43,0.2)] bg-white shadow-sm sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <span className="rounded-full border border-[rgba(201,106,43,0.35)] bg-[rgba(232,164,74,0.16)] px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.16em] text-[#9a4f1a] sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.18em]">
                    {playerLabel}
                  </span>
                  {!isTrailer && (
                    <span className="rounded-full border border-[var(--border)] bg-white/80 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[var(--text-secondary)] sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.14em]">
                      {episodeLabel ?? "HD Stream"}
                    </span>
                  )}
                </div>
                <h2 className="mt-0.5 truncate font-[var(--font-playfair)] text-lg leading-tight text-[var(--text-primary)] sm:mt-1 sm:text-2xl">
                  {movie.title}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  {displayYear ? (
                    <>
                      <span>{displayYear}</span>
                      <span className="hidden sm:inline">/</span>
                    </>
                  ) : null}
                  {movie.runtime > 0 ? (
                    <>
                      <span className="hidden sm:inline">{movie.runtime} min</span>
                      <span className="hidden sm:inline">/</span>
                    </>
                  ) : null}
                  <span className="hidden sm:inline">{movie.genres.slice(0, 2).join(", ") || "Series"}</span>
                  <span className="hidden sm:inline">/</span>
                  <span className="font-semibold text-[var(--accent-primary)]">Rating {movie.rating.toFixed(1)}</span>
                  {resume.showResumeBadge && resume.formattedResumeTime ? (
                    <>
                      <span className="hidden sm:inline">/</span>
                      <span className="hidden sm:inline text-[var(--accent-primary)]">Resume {resume.formattedResumeTime}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
              {isHlsStream && hlsQualityLevels.length > 1 ? (
                <div className="relative" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowQualityDropdown((prev) => !prev); }}
                    aria-label="Video quality"
                    title="Video quality"
                    className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white active:scale-95 sm:h-10 sm:w-10"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  {showQualityDropdown && (
                    <div className="absolute bottom-full right-0 mb-2 min-w-[120px] rounded-lg border border-[rgba(232,164,74,0.35)] bg-[rgba(28,25,23,0.96)] p-1 shadow-xl backdrop-blur-sm">
                      <button
                        type="button"
                        onClick={() => { setSelectedQualityIndex(-1); setShowQualityDropdown(false); }}
                        className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[11px] transition-colors ${
                          selectedQualityIndex === -1 ? "bg-[rgba(232,164,74,0.2)] text-[#f4c27a]" : "text-stone-300 hover:bg-white/10"
                        }`}
                      >
                        Auto
                        {selectedQualityIndex === -1 && <span className="ml-auto text-[9px]">✓</span>}
                      </button>
                      {hlsQualityLevels.map((level) => (
                        <button
                          key={level.index}
                          type="button"
                          onClick={() => { setSelectedQualityIndex(level.index); setShowQualityDropdown(false); }}
                          className={`flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-left text-[11px] transition-colors ${
                            selectedQualityIndex === level.index ? "bg-[rgba(232,164,74,0.2)] text-[#f4c27a]" : "text-stone-300 hover:bg-white/10"
                          }`}
                        >
                          {level.label}
                          {selectedQualityIndex === level.index && <span className="ml-auto text-[9px]">✓</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
              {streamSrc ? (
                <button
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleFullscreen();
                  }}
                  aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  title={isFullscreen ? "Exit fullscreen (F)" : "Fullscreen (F)"}
                  className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white active:scale-95 sm:h-10 sm:w-10"
                >
                  {isFullscreen ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                      <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                      <path d="M4 9V4h5M15 4h5v5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ) : null}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close player"
                title="Close"
                className="group flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white active:scale-95 sm:h-10 sm:w-10"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  className="h-5 w-5"
                  aria-hidden
                >
                  <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div
          className={`player-modal-body flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#faf6ef,#f0e8dc)] dark:bg-[linear-gradient(180deg,var(--bg-primary),var(--bg-secondary))] ${isTvPlayer ? "p-0" : "p-1.5 sm:p-3"}`}
        >
          <div
            className={`flex min-h-0 flex-1 ${isTvPlayer ? "flex-col lg:flex-row lg:gap-0" : "flex-col gap-1.5 sm:gap-3"}`}
          >
            <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${isTvPlayer ? "p-1.5 sm:p-3 lg:pr-2" : ""}`}>
              <div
                ref={stageRef}
                className={`player-stage player-screen-glow relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black ${
                  isTvPlayer ? "rounded-none lg:rounded-xl" : "rounded-xl"
                } ${isTrailer ? "border border-white/10" : "player-cinema-frame"} ${
                  isFauxFullscreen ? "player-stage--faux-fullscreen" : ""
                }`}
              >
                <div className="player-video-fit bg-[var(--bg-dark)]">
                  {/* Decorative only — never sit above the embed hit target */}
                  {!isFullscreen && !immersiveLandscape && (
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

                  {isHlsStream ? (
                    <>
                      {!fallbackLoaded && (
                        <FadeLoading>
                          <PlayerLoadingOverlay
                            movie={movie}
                            isTrailer={isTrailer}
                            provider={provider}
                            episodeLabel={episodeLabel}
                            resumeSeconds={resumeSeconds}
                            heroImage={heroImage}
                            posterImage={posterImage}
                            autoSwitchMessage={fallbackAutoSwitchMessage}
                            stabilityTip={stabilityTip}
                          />
                        </FadeLoading>
                      )}
                      {fallbackLoadFailed && !fallbackLoaded && (
                        <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
                          <p className="font-[var(--font-playfair)] text-xl text-stone-100">No HLS stream on this source</p>
                          <p className="max-w-sm text-sm leading-relaxed text-stone-300">
                            {PROVIDER_LABELS[provider]} couldn&apos;t resolve a playable HLS manifest for this title
                            right now. We&apos;ll try another source automatically.
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={fallbackHandleProviderSwitch}
                              className="rounded-full bg-[#f4c27a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-950 hover:bg-white"
                            >
                              Try Next Source
                            </button>
                          </div>
                        </div>
                      )}
                      {resolvedStream?.url ? (
                        <div className="absolute inset-0">
                          <HlsStreamFrame
                            ref={hlsFrameRef}
                            key={`${provider}-${season ?? 0}-${episode ?? 0}-${resolvedStream.url}`}
                            src={resolvedStream.url}
                            title={`${movie.title} stream`}
                            subtitles={subtitles.subtitleTracks.map((t) => ({
                              lang: t.language,
                              label: t.label,
                              src: proxifySubtitleUrl(t.url),
                            }))}
                            defaultSubtitle={
                              subtitles.subtitleLang !== "off" ? subtitles.subtitleLang : undefined
                            }
                            onLevelsLoaded={(levels) => {
                              setHlsQualityLevels(levels);
                              setSelectedQualityIndex(-1);
                            }}
                            onLoad={() => {
                              fallbackHandleIframeLoad();
                              handleIframeLoadComplete();
                              setPlayerEngaged(true);
                            }}
                            onError={() => {
                              fallbackHandleStreamError();
                            }}
                          />
                        </div>
                      ) : null}
                      {isTvPlayer && nextEpisodeTarget ? (
                        <PlayerNextEpisodeOverlay
                          visible={showNextEpisode}
                          showTitle={movie.title}
                          nextSeason={nextEpisodeTarget.season}
                          nextEpisode={nextEpisodeTarget.episode}
                          episode={nextEpisodeSummary}
                          countdown={nextEpisodeCountdown}
                          progress={nextEpisodeProgress}
                          autoAdvance={nextEpisodeAuto}
                          onPlayNow={playNextEpisode}
                          onCancel={dismissNextEpisode}
                        />
                      ) : null}
                    </>
                  ) : iframeSrc ? (
                    <>
                      {!fallbackLoaded && (
                        <FadeLoading>
                          <PlayerLoadingOverlay
                            movie={movie}
                            isTrailer={isTrailer}
                            provider={provider}
                            episodeLabel={episodeLabel}
                            resumeSeconds={resumeSeconds}
                            heroImage={heroImage}
                            posterImage={posterImage}
                            autoSwitchMessage={fallbackAutoSwitchMessage}
                            stabilityTip={stabilityTip}
                          />
                        </FadeLoading>
                      )}
                      {fallbackLoadFailed && !fallbackLoaded && (
                        <div className="absolute inset-0 z-[3] flex flex-col items-center justify-center gap-4 bg-black/85 px-6 text-center">
                          <p className="font-[var(--font-playfair)] text-xl text-stone-100">No stream on this source</p>
                          <p className="max-w-sm text-sm leading-relaxed text-stone-300">
                            {PROVIDER_LABELS[provider]} doesn&apos;t have this title right now. If you use an ad blocker
                            (uBlock, AdGuard, Brave Shields), pause it for this site — blocked trackers like{" "}
                            <span className="text-stone-200">dtscout.com</span> stop embed players from starting.
                          </p>
                          <div className="flex flex-wrap items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={fallbackHandleProviderSwitch}
                              className="rounded-full bg-[#f4c27a] px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-950 hover:bg-white"
                            >
                              Try Next Source
                            </button>
                            {rawEmbedUrl ? (
                              <button
                                type="button"
                                onClick={openStreamInBrowserTab}
                                className="rounded-full border border-stone-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-100 hover:bg-white hover:text-stone-950"
                              >
                                Open in Browser Tab
                              </button>
                            ) : null}
                          </div>
                        </div>
                      )}
                      <div
                        className="absolute inset-0"
                        style={{ bottom: !isTrailer && fallbackLoaded ? "52px" : "0" }}
                      >
                        <EmbedStreamFrame
                          key={`${provider}-${season ?? 0}-${episode ?? 0}-${iframeSrc}`}
                          src={iframeSrc}
                          title={isTrailer ? `${movie.title} trailer` : `${movie.title} stream`}
                          iframeRef={iframeRef}
                          onLoad={() => {
                            fallbackHandleIframeLoad();
                            handleIframeLoadComplete();
                            setPlayerEngaged(true);
                          }}
                          onError={() => {
                            fallbackHandleStreamError("Embed 404 or timeout");
                          }}
                        />
                      </div>
                      <PlayerScrubber
                        currentTime={playbackCurrentTime}
                        duration={playbackDuration || (movie.runtime || 90) * 60}
                        isTrailer={isTrailer}
                        loaded={Boolean(fallbackLoaded)}
                      />
                      {!isTrailer && subtitles.activeSubtitleCue ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-[13%] z-[11] flex justify-center px-4 sm:bottom-[11%]">
                          <div className="max-w-[88%] rounded-2xl border border-black/20 bg-black/65 px-4 py-2 text-center shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:max-w-3xl sm:px-5 sm:py-3">
                            <p className="whitespace-pre-line font-[var(--font-playfair)] text-[15px] leading-snug text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] sm:text-[18px]">
                              {subtitles.activeSubtitleCue.text}
                            </p>
                            <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f4c27a]/85">
                              {subtitles.subtitleLang === "si-auto"
                                ? "Sinhala auto translation"
                                : subtitles.subtitleLang === "si"
                                  ? "Sinhala subtitle"
                                  : subtitles.subtitleLabel || "Subtitle"}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {isTvPlayer && nextEpisodeTarget ? (
                        <PlayerNextEpisodeOverlay
                          visible={showNextEpisode}
                          showTitle={movie.title}
                          nextSeason={nextEpisodeTarget.season}
                          nextEpisode={nextEpisodeTarget.episode}
                          episode={nextEpisodeSummary}
                          countdown={nextEpisodeCountdown}
                          progress={nextEpisodeProgress}
                          autoAdvance={nextEpisodeAuto}
                          onPlayNow={playNextEpisode}
                          onCancel={dismissNextEpisode}
                        />
                      ) : null}
                    </>
                  ) : isResolving ? (
                    <FadeLoading>
                      <PlayerLoadingOverlay
                        movie={movie}
                        isTrailer={isTrailer}
                        provider={provider}
                        episodeLabel={episodeLabel}
                        resumeSeconds={resumeSeconds}
                        heroImage={heroImage}
                        posterImage={posterImage}
                        autoSwitchMessage="Resolving stream source…"
                        stabilityTip={stabilityTip}
                      />
                    </FadeLoading>
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
                  {showKeyboardHint && fallbackLoaded && !isFullscreen && (
                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-[4] -translate-x-1/2 max-sm:hidden">
                      <p className="rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-stone-200 backdrop-blur">
                        Click video · Space to play/pause · Arrows to seek
                      </p>
                    </div>
                  )}

                  {showFloatChrome ? (
                    <div className="player-float-chrome sm:hidden">
                      <div className="player-float-chrome__actions">
              {streamSrc ? (
                          <button
                            type="button"
                            onPointerDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFullscreen();
                            }}
                            aria-label={fsActive ? "Exit fullscreen" : "Enter fullscreen"}
                            className="player-float-chrome__btn"
                          >
                            {fsActive ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                                <path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden>
                                <path d="M4 9V4h5M15 4h5v5M4 15v5h5M20 15v5h-5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          onClick={onClose}
                          aria-label="Close player"
                          className="player-float-chrome__btn"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden>
                            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                      {immersiveLandscape && !fsActive ? (
                        <p className="player-float-chrome__hint">Rotate or tap fullscreen for cinema view</p>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </div>
              {fallbackLoaded && streamSrc && (
                <p className="player-modal-helper mt-2 hidden text-center text-[10px] text-[var(--text-secondary)] sm:block lg:text-left">
                  Use the player timeline to jump to any moment. Click inside the video first for keyboard shortcuts.
                </p>
              )}
            </div>

            {!isTrailer && isTvShow(movie) && (
              <PlayerTvSelector
                movie={movie}
                season={season ?? 1}
                episode={episode ?? 1}
                disabled={!fallbackLoaded && !fallbackLoadFailed}
                forceCollapsed={immersiveLandscape || fsActive}
                onChange={onSeasonEpisodeChange}
                onSwitchProvider={fallbackHandleProviderSwitch}
              />
            )}
          </div>
        </div>

        <div
          className={`player-modal-footer shrink-0 border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--bg-card),var(--bg-secondary))] ${
            isTvPlayer
              ? "flex items-center justify-end gap-2 px-3 py-2 sm:px-4"
              : "flex flex-col gap-2 px-3 py-2 sm:px-4 lg:grid lg:grid-cols-[1fr_auto] lg:gap-3 lg:px-5"
          }`}
        >
          {!isTvPlayer ? (
            <div className="hidden lg:block">
              <p className="line-clamp-1 font-[var(--font-playfair)] text-base italic text-[var(--text-primary)]">
                &ldquo;{movie.tagline || movie.title}&rdquo;
              </p>
              <p className="mt-1 line-clamp-1 max-w-3xl text-xs leading-relaxed text-[var(--text-secondary)]">
                {movie.overview}
              </p>
            </div>
          ) : null}
          <div className="player-modal-footer__actions flex flex-wrap items-center justify-end gap-2">
            {streamSrc ? (
              <button
                type="button"
                onPointerDown={(e) => {
                  e.preventDefault();
                  toggleFullscreen();
                }}
                className="min-h-[44px] rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] sm:min-h-[40px]"
              >
                {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </button>
            ) : null}
            {!isTrailer && streamSrc && (
              <>
                <button
                  type="button"
                  onClick={fallbackHandleProviderSwitch}
                  className="min-h-[44px] rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] sm:min-h-[40px]"
                >
                  Not working? Switch
                </button>
                {rawEmbedUrl ? (
                  <button
                    type="button"
                    onClick={openStreamInBrowserTab}
                    className="min-h-[44px] rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] sm:min-h-[40px]"
                  >
                    Open in Tab
                  </button>
                ) : null}
                {desktopApi?.isDesktopApp && isHlsStream && resolvedStream?.url ? (
                  activeDownloads.length > 0 ? (
                    activeDownloads.map((dl) => (
                      <button
                        key={dl.downloadId}
                        type="button"
                        onClick={() => handleCancelDownload(dl.downloadId)}
                        className="min-h-[44px] rounded-full border border-[var(--border-strong)] bg-[rgba(232,164,74,0.1)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f4c27a] hover:bg-[rgba(232,164,74,0.2)] sm:min-h-[40px]"
                      >
                        {dl.percentage < 100 ? `Downloading ${dl.percentage}%` : "Complete"}
                      </button>
                    ))
                  ) : (
                    <button
                      type="button"
                      onClick={handleDownload}
                      className="min-h-[44px] rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)] sm:min-h-[40px]"
                    >
                      Download
                    </button>
                  )
                ) : null}
              </>
            )}
            <button
              type="button"
              onClick={() => onModeChange("movie")}
              className={`min-h-[44px] rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] sm:min-h-[40px] ${
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
              className={`min-h-[44px] rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] sm:min-h-[40px] ${
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
      {showDiagnostics && (
        <div className="pointer-events-none absolute bottom-4 right-4 z-[210] max-w-[340px]">
          <div className="pointer-events-auto rounded-lg border border-[rgba(232,164,74,0.35)] bg-[rgba(18,15,12,0.92)] p-3 text-left text-[10px] font-mono leading-relaxed text-stone-200 backdrop-blur-sm shadow-xl">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#f4c27a]">
                Diagnostics
              </span>
              <span className="text-[9px] text-stone-500">Ctrl+D to toggle</span>
            </div>
            {currentTmdbId && (
              <p className="mb-2 text-[9px] text-stone-500">
                TMDB: {currentTmdbId}
                {!isResolving && !resolvedStream && !isTrailer ? " · HLS resolve FAILED" : ""}
                {resolvedStream?.isGeoBypassed ? " · Geo-bypass active" : ""}
              </p>
            )}
            {providerLogs.length === 0 ? (
              <p className="text-stone-500 italic">No provider activity yet.</p>
            ) : (
              <ul className="space-y-1">
                {providerLogs.map((entry, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                        entry.status === "success"
                          ? "bg-green-400"
                          : entry.status === "error"
                            ? "bg-red-400"
                            : "bg-yellow-400 animate-pulse"
                      }`}
                    />
                    <span className="text-stone-400 text-[9px]">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="font-semibold text-stone-100">{entry.provider}</span>
                    <span
                      className={
                        entry.status === "success"
                          ? "text-green-300"
                          : entry.status === "error"
                            ? "text-red-300"
                            : "text-yellow-300"
                      }
                    >
                      {entry.status}
                    </span>
                    {entry.reason ? (
                      <span className="text-stone-500 text-[9px]">({entry.reason})</span>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
