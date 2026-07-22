"use client";

import type { StreamProvider } from "@/lib/providers";
import { PROVIDER_LABELS } from "@/lib/providers";
import { BRAND_NAME } from "@/lib/brand";
import { isTvShow } from "@/lib/streaming";
import { getMovieEmbedUrl } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibraryActions } from "@/components/UserLibraryProvider";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/AuthModalProvider";
import PlayerTvSelector from "@/components/PlayerTvSelector";
import PlayerNextEpisodeOverlay from "@/components/PlayerNextEpisodeOverlay";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { isSlowConnection } from "@/lib/stream-optimizer";
import PlayerLoadingOverlay from "./PlayerLoadingOverlay";
import EmbedStreamFrame from "./EmbedStreamFrame";
import { useProviderFallback } from "./hooks/useProviderFallback";
import { useResumeTime } from "./hooks/useResumeTime";
import { useSubtitles } from "./hooks/useSubtitles";
import { usePlayerViewport } from "./hooks/usePlayerViewport";
import { useVideoPlayer } from "./hooks/useVideoPlayer";
import type { ActivePlayer, PlayerMode } from "./types";

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
  const setLoadedRef = useRef<(value: boolean) => void>(() => {});

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

  const fallback = useProviderFallback({
    provider,
    isTrailer,
    iframeSrc,
    playerEngaged,
    onProviderChange,
    setProvider,
    resetKey: `${movie.id}-${mode}`,
  });

  useEffect(() => {
    setLoadedRef.current = fallback.setLoaded;
  }, [fallback.setLoaded]);

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
    stageRef,
    iframeRef,
    toggleFullscreen,
    openStreamInBrowserTab,
    playNextEpisode,
    dismissNextEpisode,
    handleIframeLoadComplete,
  } = useVideoPlayer({
    movie,
    mode,
    season,
    episode,
    provider,
    resumeSeconds,
    loaded: fallback.loaded,
    playerEngaged,
    setPlayerEngaged,
    confirmPlayback: fallback.confirmPlayback,
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
              {iframeSrc ? (
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

                  {iframeSrc ? (
                    <>
                      {!fallback.loaded && (
                        <PlayerLoadingOverlay
                          movie={movie}
                          isTrailer={isTrailer}
                          provider={provider}
                          episodeLabel={episodeLabel}
                          resumeSeconds={resumeSeconds}
                          heroImage={heroImage}
                          posterImage={posterImage}
                          autoSwitchMessage={fallback.autoSwitchMessage}
                          stabilityTip={stabilityTip}
                        />
                      )}
                      {fallback.loadFailed && !fallback.loaded && (
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
                              onClick={fallback.handleProviderSwitch}
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
                      <EmbedStreamFrame
                        key={`${provider}-${season ?? 0}-${episode ?? 0}-${iframeSrc}`}
                        src={iframeSrc}
                        title={isTrailer ? `${movie.title} trailer` : `${movie.title} stream`}
                        iframeRef={iframeRef}
                        onLoad={() => {
                          fallback.handleIframeLoad();
                          handleIframeLoadComplete();
                          setPlayerEngaged(true);
                        }}
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
                  {showKeyboardHint && fallback.loaded && !isFullscreen && (
                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-[4] -translate-x-1/2 max-sm:hidden">
                      <p className="rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-stone-200 backdrop-blur">
                        Click video · Space to play/pause · Arrows to seek
                      </p>
                    </div>
                  )}

                  {showFloatChrome ? (
                    <div className="player-float-chrome sm:hidden">
                      <div className="player-float-chrome__actions">
                        {iframeSrc ? (
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
              {fallback.loaded && iframeSrc && (
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
                disabled={!fallback.loaded && !fallback.loadFailed}
                forceCollapsed={immersiveLandscape || fsActive}
                onChange={onSeasonEpisodeChange}
                onSwitchProvider={fallback.handleProviderSwitch}
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
            {iframeSrc ? (
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
            {!isTrailer && iframeSrc && (
              <>
                <button
                  type="button"
                  onClick={fallback.handleProviderSwitch}
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
    </motion.div>
  );
}
