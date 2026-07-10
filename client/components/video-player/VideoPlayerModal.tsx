"use client";

import type { StreamProvider } from "@/lib/providers";
import { PROVIDER_LABELS } from "@/lib/providers";
import { BRAND_NAME } from "@/lib/brand";
import { isTvShow } from "@/lib/streaming";
import { getMovieEmbedUrl } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import PlayerTvSelector from "@/components/PlayerTvSelector";
import PlayerNextEpisodeOverlay from "@/components/PlayerNextEpisodeOverlay";
import PlayerSubtitlePicker from "@/components/PlayerSubtitlePicker";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import PlayerLoadingOverlay from "./PlayerLoadingOverlay";
import { useProviderFallback } from "./hooks/useProviderFallback";
import { useResumeTime } from "./hooks/useResumeTime";
import { useSubtitles } from "./hooks/useSubtitles";
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
  const { movie, mode, season, episode, provider, resumeSeconds } = active;
  const { setProvider } = useUserLibrary();
  const [playerEngaged, setPlayerEngaged] = useState(false);
  const setLoadedRef = useRef<(value: boolean) => void>(() => {});

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
        subtitleLang: subtitles.subtitleLang !== "off" ? subtitles.subtitleLang : undefined,
        subtitleFile: subtitles.subtitleFile,
        subtitleLabel: subtitles.subtitleLabel,
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

  const player = useVideoPlayer({
    movie,
    mode,
    season,
    episode,
    provider,
    resumeSeconds,
    subtitleLang: subtitles.subtitleLang,
    subtitleFile: subtitles.subtitleFile,
    subtitleLabel: subtitles.subtitleLabel,
    loaded: fallback.loaded,
    playerEngaged,
    setPlayerEngaged,
    confirmPlayback: fallback.confirmPlayback,
    onClose,
    onSeasonEpisodeChange,
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] flex overflow-hidden bg-[rgba(18,15,12,0.96)] backdrop-blur-xl ${
        player.isTvPlayer ? "p-0" : "items-center justify-center p-2 sm:p-4"
      }`}
      onClick={onClose}
    >
      {!player.isTvPlayer ? (
        <>
          <div
            className="absolute inset-0 opacity-30 blur-3xl"
            style={{ backgroundImage: `url(${player.heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="player-vignette absolute inset-0" />
          <div className="cinema-sweep pointer-events-none absolute inset-x-0 top-0 h-1/2" />
        </>
      ) : null}

      <motion.div
        initial={player.isTvPlayer ? { opacity: 0 } : { scale: 0.94, opacity: 0, y: 28 }}
        animate={player.isTvPlayer ? { opacity: 1 } : { scale: 1, opacity: 1, y: 0 }}
        exit={player.isTvPlayer ? { opacity: 0 } : { scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className={`relative flex w-full flex-col overflow-hidden bg-[rgba(247,244,239,0.98)] ${
          player.isTvPlayer
            ? "h-[100dvh] max-h-[100dvh] rounded-none border-0 shadow-none"
            : "h-[92dvh] max-h-[92dvh] max-w-6xl rounded-[1.25rem] border border-[rgba(232,164,74,0.34)] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative shrink-0 overflow-hidden border-b border-[rgba(201,106,43,0.18)] bg-[linear-gradient(135deg,#fffdf9,#f3ebe0)] ${
            player.isTvPlayer ? "px-3 py-2 sm:px-4" : "px-4 py-3 sm:px-5"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `url(${player.heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,249,0.94),rgba(255,253,249,0.78),rgba(255,253,249,0.94))]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-12 w-8 overflow-hidden rounded-md border border-[rgba(201,106,43,0.2)] bg-white shadow-sm sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={player.posterImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[rgba(201,106,43,0.35)] bg-[rgba(232,164,74,0.16)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a4f1a]">
                    {player.playerLabel}
                  </span>
                  {!player.isTrailer && (
                    <span className="rounded-full border border-[var(--border)] bg-white/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {player.episodeLabel ?? "HD Stream"}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 truncate font-[var(--font-playfair)] text-xl text-[var(--text-primary)] sm:text-2xl">
                  {movie.title}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  {player.displayYear ? (
                    <>
                      <span>{player.displayYear}</span>
                      <span>/</span>
                    </>
                  ) : null}
                  {movie.runtime > 0 ? (
                    <>
                      <span>{movie.runtime} min</span>
                      <span>/</span>
                    </>
                  ) : null}
                  <span>{movie.genres.slice(0, 2).join(", ") || "Series"}</span>
                  <span>/</span>
                  <span className="font-semibold text-[var(--accent-primary)]">Rating {movie.rating.toFixed(1)}</span>
                  {resume.showResumeBadge && resume.formattedResumeTime ? (
                    <>
                      <span>/</span>
                      <span className="text-[var(--accent-primary)]">Resume {resume.formattedResumeTime}</span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close player"
              title="Close"
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--border-strong)] bg-white text-[var(--text-primary)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-5 w-5" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        <div className={`flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#faf6ef,#f0e8dc)] ${player.isTvPlayer ? "p-0" : "p-2 sm:p-3"}`}>
          <div className={`flex min-h-0 flex-1 ${player.isTvPlayer ? "flex-col lg:flex-row lg:gap-0" : "flex-col gap-2 sm:gap-3"}`}>
            <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${player.isTvPlayer ? "p-2 sm:p-3 lg:pr-2" : ""}`}>
              <div
                ref={player.stageRef}
                className={`player-stage player-screen-glow relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black ${
                  player.isTvPlayer ? "rounded-none lg:rounded-xl" : "rounded-xl"
                } ${player.isTrailer ? "border border-white/10" : "player-cinema-frame"}`}
              >
                <div className="player-video-fit bg-[var(--bg-dark)]">
                  {!player.isFullscreen && (
                    <div className="pointer-events-none absolute inset-x-0 top-0 z-[2]">
                      <div className={`player-cinema-bar ${player.isTrailer ? "player-cinema-bar--trailer" : ""}`} />
                      <div className="flex items-center justify-between px-3 py-2">
                        <span className="font-[var(--font-cinzel)] text-[10px] font-semibold uppercase tracking-[0.28em] text-[#f4c27a]/90">
                          {player.isTrailer ? "Preview" : BRAND_NAME}
                        </span>
                        <span className="rounded-full border border-[rgba(232,164,74,0.28)] bg-[rgba(28,25,23,0.72)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f4c27a]/85 backdrop-blur">
                          {player.isTrailer ? "Trailer" : isTvShow(movie) ? "Streaming · TV" : "Now Playing"}
                        </span>
                      </div>
                    </div>
                  )}

                  {player.iframeSrc && fallback.loaded && (
                    <div className="absolute top-2 right-2 z-[20] flex items-center gap-2 pointer-events-auto">
                      {!player.isTrailer ? (
                        <PlayerSubtitlePicker
                          value={subtitles.subtitleLang}
                          loading={subtitles.subtitleLoading}
                          disabled={!fallback.loaded}
                          tracks={subtitles.subtitleTracks}
                          autoSinhalaAvailable={subtitles.autoSinhalaAvailable}
                          onSearch={() => void subtitles.refreshSubtitleTracks()}
                          onChange={subtitles.handleSubtitleChange}
                          onTrackSelect={(track) => {
                            void subtitles.handleSubtitleChange(track.language);
                          }}
                        />
                      ) : null}
                      <button
                        type="button"
                        onClick={player.toggleFullscreen}
                        aria-label={player.isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:border-[#f4c27a] hover:bg-[#f4c27a] hover:text-stone-950"
                      >
                        {player.isFullscreen ? (
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

                  {player.iframeSrc ? (
                    <>
                      {!fallback.loaded && (
                        <PlayerLoadingOverlay
                          movie={movie}
                          isTrailer={player.isTrailer}
                          provider={provider}
                          episodeLabel={player.episodeLabel}
                          resumeSeconds={resumeSeconds}
                          heroImage={player.heroImage}
                          posterImage={player.posterImage}
                          autoSwitchMessage={fallback.autoSwitchMessage}
                          stabilityTip={player.stabilityTip}
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
                            {player.rawEmbedUrl ? (
                              <button
                                type="button"
                                onClick={player.openStreamInBrowserTab}
                                className="rounded-full border border-stone-400 px-5 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-100 hover:bg-white hover:text-stone-950"
                              >
                                Open in Browser Tab
                              </button>
                            ) : null}
                          </div>
                        </div>
                      )}
                      <iframe
                        ref={player.iframeRef}
                        key={`${provider}-${season ?? 0}-${episode ?? 0}-${subtitles.subtitleLang}-${subtitles.subtitleFile ?? "none"}-${player.iframeSrc}`}
                        src={player.iframeSrc}
                        title={player.isTrailer ? `${movie.title} trailer` : `${movie.title} stream`}
                        tabIndex={0}
                        referrerPolicy="strict-origin-when-cross-origin"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                        allowFullScreen
                        onLoad={() => {
                          fallback.handleIframeLoad();
                          player.handleIframeLoadComplete();
                        }}
                        onPointerDown={player.focusPlayer}
                        className="player-embed-iframe absolute inset-0 z-[1] h-full w-full border-0"
                      />
                      {!player.isTrailer && subtitles.activeSubtitleCue ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-[13%] z-[7] flex justify-center px-4 sm:bottom-[11%]">
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
                      {!player.isTrailer && fallback.loaded && !playerEngaged && (
                        <button
                          type="button"
                          onClick={() => {
                            setPlayerEngaged(true);
                            player.focusPlayer();
                          }}
                          className="absolute inset-0 z-[6] flex flex-col items-center justify-center gap-3 bg-black/55 px-6 text-center backdrop-blur-[2px] transition hover:bg-black/45"
                        >
                          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f4c27a]/50 bg-[#f4c27a]/15 text-[#f4c27a]">
                            <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7" aria-hidden>
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </span>
                          <span className="text-sm font-semibold uppercase tracking-[0.16em] text-stone-100">
                            Click to start watching
                          </span>
                          <span className="max-w-xs text-xs text-stone-200">
                            Tap once to focus the player. Pause ad blockers for localhost if video never starts.
                          </span>
                        </button>
                      )}
                      {player.isTvPlayer && player.nextEpisodeTarget ? (
                        <PlayerNextEpisodeOverlay
                          visible={player.showNextEpisode}
                          showTitle={movie.title}
                          nextSeason={player.nextEpisodeTarget.season}
                          nextEpisode={player.nextEpisodeTarget.episode}
                          episode={player.nextEpisodeSummary}
                          countdown={player.nextEpisodeCountdown}
                          progress={player.nextEpisodeProgress}
                          onPlayNow={player.playNextEpisode}
                          onCancel={player.dismissNextEpisode}
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
                  {player.showKeyboardHint && fallback.loaded && !player.isFullscreen && (
                    <div className="pointer-events-none absolute bottom-3 left-1/2 z-[4] -translate-x-1/2">
                      <p className="rounded-full border border-white/10 bg-black/65 px-3 py-1.5 text-[10px] uppercase tracking-[0.14em] text-stone-200 backdrop-blur">
                        Click video · Space to play/pause · Arrows to seek
                      </p>
                    </div>
                  )}
                </div>
              </div>
              {fallback.loaded && player.iframeSrc && (
                <p className="mt-2 text-center text-[10px] text-[var(--text-secondary)] lg:text-left">
                  Use the player timeline to jump to any moment. Click inside the video first for keyboard shortcuts.
                </p>
              )}
            </div>

            {!player.isTrailer && isTvShow(movie) && (
              <PlayerTvSelector
                movie={movie}
                season={season ?? 1}
                episode={episode ?? 1}
                disabled={!fallback.loaded && !fallback.loadFailed}
                onChange={onSeasonEpisodeChange}
                onSwitchProvider={fallback.handleProviderSwitch}
              />
            )}
          </div>
        </div>

        <div
          className={`shrink-0 border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--bg-card),var(--bg-secondary))] ${
            player.isTvPlayer ? "flex items-center justify-end gap-2 px-3 py-2 sm:px-4" : "grid gap-3 px-4 py-3 lg:grid-cols-[1fr_auto] lg:px-5"
          }`}
        >
          {!player.isTvPlayer ? (
            <div>
              <p className="line-clamp-1 font-[var(--font-playfair)] text-base italic text-[var(--text-primary)]">
                &ldquo;{movie.tagline || movie.title}&rdquo;
              </p>
              <p className="mt-1 line-clamp-1 max-w-3xl text-xs leading-relaxed text-[var(--text-secondary)]">
                {movie.overview}
              </p>
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-2 lg:justify-end">
            {!player.isTrailer && player.iframeSrc && (
              <>
                <button
                  type="button"
                  onClick={fallback.handleProviderSwitch}
                  className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                >
                  Not working? Switch
                </button>
                {player.rawEmbedUrl ? (
                  <button
                    type="button"
                    onClick={player.openStreamInBrowserTab}
                    className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
                  >
                    Open in Tab
                  </button>
                ) : null}
              </>
            )}
            <button
              type="button"
              onClick={() => onModeChange("movie")}
              className={`rounded-full px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                !player.isTrailer
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
                player.isTrailer
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
