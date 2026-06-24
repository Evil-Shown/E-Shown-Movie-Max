"use client";

import type { Movie } from "@/lib/types";
import { BRAND_NAME } from "@/lib/brand";
import { backdropUrl, formatDisplayYear, posterUrl } from "@/lib/movies";
import { PROVIDER_LABELS, STREAM_PROVIDERS, type StreamProvider } from "@/lib/providers";
import { getBestProvider, recordProviderFailure, recordProviderLoad } from "@/lib/storage/provider-performance";
import {
  formatProviderSwitchMessage,
  getNextProvider,
  getPlaybackConfirmTimeoutMs,
  getStreamLoadTimeoutMs,
  getStabilityTip,
  isEmbedPlaybackMessage,
  warmStreamProviders,
} from "@/lib/stream-optimizer";
import { getMovieEmbedUrl, getRawMovieEmbedUrl, isTvShow, resolveImdbId, resolveTmdbId } from "@/lib/streaming";
import PlayerTvSelector from "@/components/PlayerTvSelector";
import PlayerNextEpisodeOverlay from "@/components/PlayerNextEpisodeOverlay";
import PlayerSubtitlePicker from "@/components/PlayerSubtitlePicker";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import {
  isEmbedNearEnd,
  isEmbedPlaybackEnded,
} from "@/lib/embed-events";
import {
  exitAnyFullscreen,
  getActiveFullscreenElement,
  requestElementFullscreen,
} from "@/lib/fullscreen";
import {
  fetchSubtitleText,
  parseSubtitleCues,
  proxifySubtitleUrl,
  resolveSubtitleForLanguage,
  searchSubtitleTracks,
  type SubtitleCue,
  type SubtitleTrackResult,
} from "@/lib/subtitles-client";
import {
  getEpisodeSummary,
  getNextEpisodeTarget,
  type TvEpisodeSummary,
  type TvSeasonSummary,
} from "@/lib/tv-episodes";
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

const NEXT_EPISODE_COUNTDOWN_SECONDS = 5;

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
          {formatDisplayYear(movie.year) ?? "Series"}
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
  onSeasonEpisodeChange,
}: {
  active: ActivePlayer;
  onClose: () => void;
  onModeChange: (mode: PlayerMode) => void;
  onProviderChange: (provider: StreamProvider) => void;
  onSeasonEpisodeChange: (season: number, episode: number) => void;
}) {
  const { movie, mode, season, episode, provider, resumeSeconds } = active;
  const { savePlayback, setProvider } = useUserLibrary();
  const isTrailer = mode === "trailer";
  const [loaded, setLoaded] = useState(false);
  const [loadFailed, setLoadFailed] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [autoSwitchMessage, setAutoSwitchMessage] = useState<string | null>(null);
  const [playerEngaged, setPlayerEngaged] = useState(false);
  const [subtitleLang, setSubtitleLang] = useState("off");
  const [subtitleFile, setSubtitleFile] = useState<string | undefined>();
  const [subtitleLabel, setSubtitleLabel] = useState<string | undefined>();
  const [subtitleLoading, setSubtitleLoading] = useState(false);
  const [subtitleTranslationAvailable, setSubtitleTranslationAvailable] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrackResult[]>([]);
  const [subtitleCues, setSubtitleCues] = useState<SubtitleCue[]>([]);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(NEXT_EPISODE_COUNTDOWN_SECONDS);
  const [nextEpisodeProgress, setNextEpisodeProgress] = useState(0);
  const [tvSeasons, setTvSeasons] = useState<TvSeasonSummary[]>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Map<number, TvEpisodeSummary[]>>(new Map());
  const loadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const playbackWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadStartedAtRef = useRef(Date.now());
  const failoverAttemptsRef = useRef(0);
  const playbackConfirmedRef = useRef(false);
  const playerEngagedRef = useRef(false);
  const nextEpisodeTriggeredRef = useRef(false);
  const subtitleLangRef = useRef(subtitleLang);
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const stabilityTip = getStabilityTip();
  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);
  const autoSinhalaAvailable =
    subtitleTranslationAvailable &&
    (subtitleTracks.some((track) => track.language === "en") ||
      subtitleTracks.some((track) => track.language === "si"));

  const movieEmbedUrl = isTrailer
    ? null
    : getMovieEmbedUrl(movie, provider, {
        season,
        episode,
        seek: resumeSeconds,
        subtitleLang: subtitleLang !== "off" ? subtitleLang : undefined,
        subtitleFile,
        subtitleLabel,
      });

  const rawEmbedUrl = isTrailer
    ? null
    : getRawMovieEmbedUrl(movie, provider, {
        season,
        episode,
        seek: resumeSeconds,
        subtitleLang: subtitleLang !== "off" ? subtitleLang : undefined,
        subtitleFile,
        subtitleLabel,
      });

  const iframeSrc = isTrailer
    ? `https://www.youtube.com/embed/${trailerId}?autoplay=1&rel=0&modestbranding=1`
    : movieEmbedUrl;

  const playerLabel = isTrailer ? "Trailer" : isTvShow(movie) ? "Now Streaming · TV" : "Now Streaming";
  const isTvPlayer = !isTrailer && isTvShow(movie);
  const displayYear = formatDisplayYear(movie.year);
  const heroImage = backdropUrl(movie.backdropPath || movie.posterPath);
  const posterImage = posterUrl(movie.posterPath);
  const episodeLabel =
    season && episode ? `S${season} · E${episode}` : null;

  const nextEpisodeTarget =
    isTvPlayer && season && episode
      ? getNextEpisodeTarget(tvSeasons, episodesBySeason, season, episode)
      : null;

  const nextEpisodeSummary = nextEpisodeTarget
    ? getEpisodeSummary(episodesBySeason, nextEpisodeTarget.season, nextEpisodeTarget.episode)
    : null;
  const currentEpisodeSummary =
    season && episode ? getEpisodeSummary(episodesBySeason, season, episode) : null;
  const activeSubtitleCue =
    subtitleCues.find((cue) => playbackTime >= cue.start && playbackTime <= cue.end) ?? null;

  const clearPlaybackWatchdog = useCallback(() => {
    if (playbackWatchdogRef.current) {
      clearTimeout(playbackWatchdogRef.current);
      playbackWatchdogRef.current = null;
    }
  }, []);

  const switchToNextProvider = useCallback(() => {
    if (failoverAttemptsRef.current >= STREAM_PROVIDERS.length - 1) {
      setLoadFailed(true);
      setAutoSwitchMessage(null);
      return false;
    }

    recordProviderFailure(provider);
    const next = getNextProvider(provider);
    failoverAttemptsRef.current += 1;
    setAutoSwitchMessage(formatProviderSwitchMessage(next));
    setLoaded(false);
    setLoadFailed(false);
    playbackConfirmedRef.current = false;
    onProviderChange(next);
    setProvider(next);
    return true;
  }, [onProviderChange, provider, setProvider]);

  const schedulePlaybackWatchdog = useCallback(() => {
    clearPlaybackWatchdog();
    playbackWatchdogRef.current = setTimeout(() => {
      if (playbackConfirmedRef.current || playerEngagedRef.current) return;
      switchToNextProvider();
    }, getPlaybackConfirmTimeoutMs());
  }, [clearPlaybackWatchdog, switchToNextProvider]);

  const loadSeasonEpisodes = useCallback(
    async (seasonNumber: number) => {
      if (!seasonNumber) return;
      let alreadyLoaded = false;
      setEpisodesBySeason((current) => {
        alreadyLoaded = current.has(seasonNumber);
        return current;
      });
      if (alreadyLoaded) return;

      try {
        const res = await fetch(`/api/tv/${movie.id}/seasons`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ season: seasonNumber }),
        });
        const data = (await res.json()) as { episodes: TvEpisodeSummary[] };
        setEpisodesBySeason((current) => {
          const next = new Map(current);
          next.set(seasonNumber, data.episodes ?? []);
          return next;
        });
      } catch {
        // Episode metadata is optional for playback.
      }
    },
    [movie.id]
  );

  const playNextEpisode = useCallback(() => {
    if (!nextEpisodeTarget) return;
    setShowNextEpisode(false);
    nextEpisodeTriggeredRef.current = false;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setNextEpisodeProgress(0);
    onSeasonEpisodeChange(nextEpisodeTarget.season, nextEpisodeTarget.episode);
  }, [nextEpisodeTarget, onSeasonEpisodeChange]);

  const dismissNextEpisode = useCallback(() => {
    setShowNextEpisode(false);
    nextEpisodeTriggeredRef.current = true;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setNextEpisodeProgress(0);
  }, []);

  const openNextEpisodeOverlay = useCallback(() => {
    if (!isTvPlayer || !nextEpisodeTarget || nextEpisodeTriggeredRef.current || showNextEpisode) {
      return;
    }
    nextEpisodeTriggeredRef.current = true;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setNextEpisodeProgress(0);
    setShowNextEpisode(true);
    void loadSeasonEpisodes(nextEpisodeTarget.season);
  }, [isTvPlayer, loadSeasonEpisodes, nextEpisodeTarget, showNextEpisode]);

  const handleSubtitleChange = useCallback(
    async (languageCode: string) => {
      setSubtitleLoading(true);
      try {
        const existing = subtitleTracks.find((t) => t.language === languageCode);
        if (existing?.url) {
          setSubtitleLang(languageCode);
          setSubtitleFile(existing.url.startsWith("/api/") ? existing.url : proxifySubtitleUrl(existing.url));
          setSubtitleLabel(existing.label);
          return;
        }
        const resolved = await resolveSubtitleForLanguage({
          tmdbId: resolveTmdbId(movie),
          imdbId: resolveImdbId(movie),
          season,
          episode,
          language: languageCode,
        });
        setSubtitleLang(resolved.lang);
        setSubtitleFile(resolved.file);
        setSubtitleLabel(resolved.label);
      } finally {
        setSubtitleLoading(false);
      }
    },
    [episode, movie, season, subtitleTracks]
  );

  const refreshSubtitleTracks = useCallback(async () => {
    setSubtitleLoading(true);
    try {
      const search = await searchSubtitleTracks({
      tmdbId: resolveTmdbId(movie),
      imdbId: resolveImdbId(movie),
      season,
      episode,
      });
      const ranked = [...search.tracks].sort((a, b) => {
        const score = (track: SubtitleTrackResult) => {
          if (track.language === "si") return 0;
          if (track.language === "en") return 1;
          if (track.language === "ta") return 2;
          return 3;
        };
        return score(a) - score(b);
      });
      setSubtitleTracks(ranked);
      setSubtitleTranslationAvailable(search.translationAvailable);
    } finally {
      setSubtitleLoading(false);
    }
  }, [episode, movie, season]);

  useEffect(() => {
    if (!isTvPlayer || !nextEpisodeTarget || showNextEpisode) return;

    const currentEpisode =
      episodesBySeason.get(season ?? 0)?.find((item) => item.episode_number === (episode ?? 0)) ?? null;
    const durationSeconds = currentEpisode?.runtime ?? movie.runtime ?? 0;
    const fallbackSeconds = Math.max(0, durationSeconds - 60);
    if (!fallbackSeconds) return;

    const timer = window.setTimeout(() => {
      openNextEpisodeOverlay();
    }, fallbackSeconds * 1000);

    return () => window.clearTimeout(timer);
  }, [episode, episodesBySeason, isTvPlayer, movie.runtime, nextEpisodeTarget, openNextEpisodeOverlay, season, showNextEpisode]);

  useEffect(() => {
    playerEngagedRef.current = playerEngaged;
  }, [playerEngaged]);

  useEffect(() => {
    warmStreamProviders();
    failoverAttemptsRef.current = 0;
    playbackConfirmedRef.current = false;
    setAutoSwitchMessage(null);
    setPlayerEngaged(false);
  }, [movie.id, mode]);

  useEffect(() => {
    if (!isTvPlayer) return;

    let cancelled = false;
    async function loadSeasons() {
      try {
        const res = await fetch(`/api/tv/${movie.id}/seasons`);
        const data = (await res.json()) as { seasons: TvSeasonSummary[] };
        if (!cancelled) setTvSeasons(data.seasons ?? []);
      } catch {
        if (!cancelled) setTvSeasons([]);
      }
    }

    loadSeasons();
    return () => {
      cancelled = true;
    };
  }, [isTvPlayer, movie.id]);

  useEffect(() => {
    if (!isTvPlayer || !season) return;
    void loadSeasonEpisodes(season);
  }, [isTvPlayer, loadSeasonEpisodes, season]);

  useEffect(() => {
    void refreshSubtitleTracks();
  }, [refreshSubtitleTracks]);

  useEffect(() => {
    let cancelled = false;
    async function loadSubtitleCues() {
      if (!subtitleFile || subtitleLang === "off") {
        setSubtitleCues([]);
        return;
      }

      try {
        const text = await fetchSubtitleText(subtitleFile);
        if (cancelled) return;
        setSubtitleCues(parseSubtitleCues(text));
      } catch {
        if (!cancelled) setSubtitleCues([]);
      }
    }

    void loadSubtitleCues();
    return () => {
      cancelled = true;
    };
  }, [subtitleFile, subtitleLang]);

  useEffect(() => {
    if (!nextEpisodeTarget) return;
    void loadSeasonEpisodes(nextEpisodeTarget.season);
  }, [loadSeasonEpisodes, nextEpisodeTarget]);

  useEffect(() => {
    setShowNextEpisode(false);
    nextEpisodeTriggeredRef.current = false;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
  }, [season, episode]);

  useEffect(() => {
    setTvSeasons([]);
    setEpisodesBySeason(new Map());
    setSubtitleLang("off");
    setSubtitleFile(undefined);
    setSubtitleLabel(undefined);
    setSubtitleTracks([]);
    setSubtitleTranslationAvailable(false);
    setSubtitleCues([]);
    setPlaybackTime(0);
    setPlaybackDuration(0);
  }, [movie.id]);

  useEffect(() => {
    subtitleLangRef.current = subtitleLang;
  }, [subtitleLang]);

  useEffect(() => {
    if (!isTvPlayer) return;
    const language = subtitleLangRef.current;
    if (language === "off") return;

    let cancelled = false;
    (async () => {
      setSubtitleLoading(true);
      try {
        const resolved = await resolveSubtitleForLanguage({
          tmdbId: resolveTmdbId(movie),
          imdbId: resolveImdbId(movie),
          season,
          episode,
          language,
        });
        if (cancelled) return;
        setSubtitleLang(resolved.lang);
        setSubtitleFile(resolved.file);
        setSubtitleLabel(resolved.label);
        setLoaded(false);
        setPlayerEngaged(false);
        playbackConfirmedRef.current = false;
      } finally {
        if (!cancelled) setSubtitleLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [episode, isTvPlayer, movie, season]);

  useEffect(() => {
    if (!showNextEpisode) return;
    if (nextEpisodeCountdown <= 0) {
      playNextEpisode();
      return;
    }
    const timer = window.setTimeout(() => {
      setNextEpisodeCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [nextEpisodeCountdown, playNextEpisode, showNextEpisode]);

  useEffect(() => {
    if (!isTvPlayer || !nextEpisodeTarget) return;
    const runtime = currentEpisodeSummary?.runtime ?? movie.runtime ?? 0;
    if (!runtime) return;

    const startThreshold = Math.max(0.82, (runtime - 75) / runtime);
    let started = false;

    const timer = window.setInterval(() => {
      if (started || showNextEpisode) return;
      const currentSeconds = loaded ? Math.min(runtime, runtime * startThreshold) : 0;
      const remaining = Math.max(runtime - currentSeconds, 0);
      const progress = 1 - remaining / runtime;
      setNextEpisodeProgress(progress);

      if (progress >= startThreshold) {
        started = true;
        openNextEpisodeOverlay();
      }
    }, 2000);

    return () => window.clearInterval(timer);
  }, [currentEpisodeSummary?.runtime, isTvPlayer, loaded, movie.runtime, nextEpisodeTarget, openNextEpisodeOverlay, showNextEpisode]);

  useEffect(() => {
    if (!subtitleFile || subtitleLang === "off") return;

    const onMessage = (event: MessageEvent) => {
      const data = event.data as { currentTime?: number; duration?: number } | undefined;
      if (typeof data?.currentTime === "number") {
        setPlaybackTime(data.currentTime);
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [subtitleFile, subtitleLang]);

  useEffect(() => {
    if (isTrailer) return;

    const onMessage = (event: MessageEvent) => {
      if (isEmbedPlaybackMessage(event.data)) {
        playbackConfirmedRef.current = true;
        clearPlaybackWatchdog();
      }
      if (isEmbedPlaybackEnded(event.data) || isEmbedNearEnd(event.data, 0.985)) {
        openNextEpisodeOverlay();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [clearPlaybackWatchdog, isTrailer, openNextEpisodeOverlay]);

  useEffect(() => {
    setPlayerEngaged(false);
    playbackConfirmedRef.current = false;
    clearPlaybackWatchdog();
  }, [season, episode, provider, iframeSrc, clearPlaybackWatchdog]);

  useEffect(() => {
    setLoaded(false);
    setLoadFailed(false);
    playbackConfirmedRef.current = false;
    loadStartedAtRef.current = Date.now();
    clearPlaybackWatchdog();

    if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
    if (!isTrailer && iframeSrc) {
      loadTimerRef.current = setTimeout(() => {
        if (!switchToNextProvider()) return;
      }, getStreamLoadTimeoutMs(provider));
    }

    return () => {
      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
      clearPlaybackWatchdog();
    };
  }, [iframeSrc, isTrailer, provider, switchToNextProvider, clearPlaybackWatchdog]);

  useEffect(() => {
    if (playerEngaged) {
      playbackConfirmedRef.current = true;
      clearPlaybackWatchdog();
    }
  }, [playerEngaged, clearPlaybackWatchdog]);

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
      if (getActiveFullscreenElement()) return;
      onClose();
    };
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(getActiveFullscreenElement()));
      if (getActiveFullscreenElement()) {
        window.setTimeout(() => iframeRef.current?.focus(), 50);
      } else {
        window.setTimeout(() => {
          if (!getActiveFullscreenElement()) {
            setIsFullscreen(false);
          }
        }, 50);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.addEventListener("webkitfullscreenchange", onFullscreenChange as EventListener);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", onFullscreenChange as EventListener);
      void exitAnyFullscreen();
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
      if (getActiveFullscreenElement()) {
        await exitAnyFullscreen();
        setIsFullscreen(false);
        return;
      }
      await requestElementFullscreen(stage);
      setIsFullscreen(true);
      focusPlayer();
    } catch {
      // Browser blocked fullscreen — user can still use the embed control.
    }
  }

  function openStreamInBrowserTab() {
    if (!rawEmbedUrl) return;
    window.open(rawEmbedUrl, "_blank", "noopener,noreferrer");
  }

  function handleProviderSwitch() {
    recordProviderFailure(provider);
    switchToNextProvider();
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-[200] flex overflow-hidden bg-[rgba(18,15,12,0.96)] backdrop-blur-xl ${
        isTvPlayer ? "p-0" : "items-center justify-center p-2 sm:p-4"
      }`}
      onClick={onClose}
    >
      {!isTvPlayer ? (
        <>
          <div
            className="absolute inset-0 opacity-30 blur-3xl"
            style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }}
          />
          <div className="player-vignette absolute inset-0" />
          <div className="cinema-sweep pointer-events-none absolute inset-x-0 top-0 h-1/2" />
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
            : "h-[92dvh] max-h-[92dvh] max-w-6xl rounded-[1.25rem] border border-[rgba(232,164,74,0.34)] shadow-[0_30px_120px_rgba(0,0,0,0.55)]"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`relative shrink-0 overflow-hidden border-b border-[rgba(201,106,43,0.18)] bg-[linear-gradient(135deg,#fffdf9,#f3ebe0)] ${
            isTvPlayer ? "px-3 py-2 sm:px-4" : "px-4 py-3 sm:px-5"
          }`}
        >
          <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: `url(${heroImage})`, backgroundSize: "cover", backgroundPosition: "center" }} />
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,253,249,0.94),rgba(255,253,249,0.78),rgba(255,253,249,0.94))]" />
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="hidden h-12 w-8 overflow-hidden rounded-md border border-[rgba(201,106,43,0.2)] bg-white shadow-sm sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={posterImage} alt="" className="h-full w-full object-cover" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[rgba(201,106,43,0.35)] bg-[rgba(232,164,74,0.16)] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#9a4f1a]">
                    {playerLabel}
                  </span>
                  {!isTrailer && (
                    <span className="rounded-full border border-[var(--border)] bg-white/80 px-2.5 py-1 text-[9px] uppercase tracking-[0.14em] text-[var(--text-secondary)]">
                      {episodeLabel ?? "HD Stream"}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 truncate font-[var(--font-playfair)] text-xl text-[var(--text-primary)] sm:text-2xl">
                  {movie.title}
                </h2>
                <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-secondary)]">
                  {displayYear ? (
                    <>
                      <span>{displayYear}</span>
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
                  {resumeSeconds && resumeSeconds > 30 ? (
                    <>
                      <span>/</span>
                      <span className="text-[var(--accent-primary)]">Resume {formatResumeTime(resumeSeconds)}</span>
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

        <div className={`flex min-h-0 flex-1 flex-col bg-[linear-gradient(180deg,#faf6ef,#f0e8dc)] ${isTvPlayer ? "p-0" : "p-2 sm:p-3"}`}>
          <div
            className={`flex min-h-0 flex-1 ${isTvPlayer ? "flex-col lg:flex-row lg:gap-0" : "flex-col gap-2 sm:gap-3"}`}
          >
            <div className={`flex min-h-0 min-w-0 flex-1 flex-col ${isTvPlayer ? "p-2 sm:p-3 lg:pr-2" : ""}`}>
              <div
                ref={stageRef}
                className={`player-stage player-screen-glow relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-black ${
                  isTvPlayer ? "rounded-none lg:rounded-xl" : "rounded-xl"
                } ${isTrailer ? "border border-white/10" : "player-cinema-frame"}`}
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
                <div className="absolute top-2 right-2 z-[20] flex items-center gap-2 pointer-events-auto">
                  {!isTrailer ? (
                    <PlayerSubtitlePicker
                      value={subtitleLang}
                      loading={subtitleLoading}
                      disabled={!loaded}
                      tracks={subtitleTracks}
                      autoSinhalaAvailable={autoSinhalaAvailable}
                      onSearch={() => void refreshSubtitleTracks()}
                      onChange={handleSubtitleChange}
                      onTrackSelect={(track) => {
                        void handleSubtitleChange(track.language);
                      }}
                    />
                  ) : null}
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/55 text-white backdrop-blur transition hover:border-[#f4c27a] hover:bg-[#f4c27a] hover:text-stone-950"
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
                        onClick={handleProviderSwitch}
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
                  <iframe
                    ref={iframeRef}
                    key={`${provider}-${season ?? 0}-${episode ?? 0}-${subtitleLang}-${subtitleFile ?? "none"}-${iframeSrc}`}
                    src={iframeSrc}
                    title={isTrailer ? `${movie.title} trailer` : `${movie.title} stream`}
                    tabIndex={0}
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share"
                    allowFullScreen
                    onLoad={() => {
                      recordProviderLoad(provider, Date.now() - loadStartedAtRef.current);
                      setLoaded(true);
                      setLoadFailed(false);
                      setShowKeyboardHint(true);
                      if (loadTimerRef.current) clearTimeout(loadTimerRef.current);
                      if (!isTrailer) {
                        schedulePlaybackWatchdog();
                      }
                    }}
                    onPointerDown={focusPlayer}
                    className="player-embed-iframe absolute inset-0 z-[1] h-full w-full border-0"
                  />
                  {!isTrailer && activeSubtitleCue ? (
                    <div className="pointer-events-none absolute inset-x-0 bottom-[13%] z-[7] flex justify-center px-4 sm:bottom-[11%]">
                      <div className="max-w-[88%] rounded-2xl border border-black/20 bg-black/65 px-4 py-2 text-center shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur-md sm:max-w-3xl sm:px-5 sm:py-3">
                        <p className="whitespace-pre-line font-[var(--font-playfair)] text-[15px] leading-snug text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)] sm:text-[18px]">
                          {activeSubtitleCue.text}
                        </p>
                        <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#f4c27a]/85">
                          {subtitleLang === "si-auto"
                            ? "Sinhala auto translation"
                            : subtitleLang === "si"
                              ? "Sinhala subtitle"
                              : subtitleLabel || "Subtitle"}
                        </p>
                      </div>
                    </div>
                  ) : null}
                  {!isTrailer && loaded && !playerEngaged && (
                    <button
                      type="button"
                      onClick={() => {
                        setPlayerEngaged(true);
                        focusPlayer();
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
                  {isTvPlayer && nextEpisodeTarget ? (
                    <PlayerNextEpisodeOverlay
                      visible={showNextEpisode}
                      showTitle={movie.title}
                      nextSeason={nextEpisodeTarget.season}
                      nextEpisode={nextEpisodeTarget.episode}
                      episode={nextEpisodeSummary}
                      countdown={nextEpisodeCountdown}
                      progress={nextEpisodeProgress}
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
                <p className="mt-2 text-center text-[10px] text-[var(--text-secondary)] lg:text-left">
                  Use the player timeline to jump to any moment. Click inside the video first for keyboard shortcuts.
                </p>
              )}
            </div>

            {!isTrailer && isTvShow(movie) && (
              <PlayerTvSelector
                movie={movie}
                season={season ?? 1}
                episode={episode ?? 1}
                disabled={!loaded && !loadFailed}
                onChange={onSeasonEpisodeChange}
                onSwitchProvider={handleProviderSwitch}
              />
            )}
          </div>
        </div>

        <div
          className={`shrink-0 border-t border-[var(--border-subtle)] bg-[linear-gradient(180deg,var(--bg-card),var(--bg-secondary))] ${
            isTvPlayer ? "flex items-center justify-end gap-2 px-3 py-2 sm:px-4" : "grid gap-3 px-4 py-3 lg:grid-cols-[1fr_auto] lg:px-5"
          }`}
        >
          {!isTvPlayer ? (
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
            {!isTrailer && iframeSrc && (
              <>
              <button
                type="button"
                onClick={handleProviderSwitch}
                className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--text-primary)] hover:bg-[var(--bg-primary)]"
              >
                Not working? Switch
              </button>
              {rawEmbedUrl ? (
                <button
                  type="button"
                  onClick={openStreamInBrowserTab}
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
  const changeSeasonEpisode = useCallback((season: number, episode: number) => {
    setActive((current) =>
      current ? { ...current, season, episode, resumeSeconds: undefined } : current
    );
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
            onSeasonEpisodeChange={changeSeasonEpisode}
          />
        )}
      </AnimatePresence>
    </VideoPlayerContext.Provider>
  );
}
