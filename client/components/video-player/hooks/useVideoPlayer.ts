import type { Movie } from "@/lib/types";
import type { StreamProvider } from "@/lib/providers";
import { backdropUrl, formatDisplayYear, posterUrl } from "@/lib/movies";
import { getMovieEmbedUrl, getRawMovieEmbedUrl, isTvShow } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import { isEmbedNearEnd, isEmbedPlaybackEnded } from "@/lib/embed-events";
import {
  exitAnyFullscreen,
  getActiveFullscreenElement,
  requestElementFullscreen,
} from "@/lib/fullscreen";
import {
  getEpisodeSummary,
  getNextEpisodeTarget,
  type TvEpisodeSummary,
  type TvSeasonSummary,
} from "@/lib/tv-episodes";
import { getStabilityTip, isEmbedPlaybackMessage, warmStreamProviders } from "@/lib/stream-optimizer";
import { useCallback, useEffect, useRef, useState } from "react";
import type { PlayerMode } from "../types";
import { NEXT_EPISODE_COUNTDOWN_SECONDS } from "../types";

interface UseVideoPlayerOptions {
  movie: Movie;
  mode: PlayerMode;
  season?: number;
  episode?: number;
  provider: StreamProvider;
  resumeSeconds?: number;
  subtitleLang: string;
  subtitleFile?: string;
  subtitleLabel?: string;
  loaded: boolean;
  playerEngaged: boolean;
  setPlayerEngaged: (engaged: boolean) => void;
  confirmPlayback: () => void;
  onClose: () => void;
  onSeasonEpisodeChange: (season: number, episode: number) => void;
}

export function useVideoPlayer({
  movie,
  mode,
  season,
  episode,
  provider,
  resumeSeconds,
  subtitleLang,
  subtitleFile,
  subtitleLabel,
  loaded,
  playerEngaged,
  setPlayerEngaged,
  confirmPlayback,
  onClose,
  onSeasonEpisodeChange,
}: UseVideoPlayerOptions) {
  const { savePlayback, setProvider } = useUserLibrary();
  const isTrailer = mode === "trailer";
  const isTvPlayer = !isTrailer && isTvShow(movie);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(NEXT_EPISODE_COUNTDOWN_SECONDS);
  const [nextEpisodeProgress, setNextEpisodeProgress] = useState(0);
  const [tvSeasons, setTvSeasons] = useState<TvSeasonSummary[]>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Map<number, TvEpisodeSummary[]>>(new Map());

  const nextEpisodeTriggeredRef = useRef(false);
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
  const displayYear = formatDisplayYear(movie.year);
  const heroImage = backdropUrl(movie.backdropPath || movie.posterPath);
  const posterImage = posterUrl(movie.posterPath);
  const episodeLabel = season && episode ? `S${season} · E${episode}` : null;

  const nextEpisodeTarget =
    isTvPlayer && season && episode
      ? getNextEpisodeTarget(tvSeasons, episodesBySeason, season, episode)
      : null;

  const nextEpisodeSummary = nextEpisodeTarget
    ? getEpisodeSummary(episodesBySeason, nextEpisodeTarget.season, nextEpisodeTarget.episode)
    : null;

  const currentEpisodeSummary =
    season && episode ? getEpisodeSummary(episodesBySeason, season, episode) : null;

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

  const focusPlayer = useCallback(() => {
    iframeRef.current?.focus();
    setShowKeyboardHint(false);
  }, []);

  const toggleFullscreen = useCallback(async () => {
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
  }, [focusPlayer]);

  const openStreamInBrowserTab = useCallback(() => {
    if (!rawEmbedUrl) return;
    window.open(rawEmbedUrl, "_blank", "noopener,noreferrer");
  }, [rawEmbedUrl]);

  const handleIframeLoadComplete = useCallback(() => {
    setShowKeyboardHint(true);
  }, []);

  useEffect(() => {
    warmStreamProviders();
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
  }, [movie.id]);

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
    if (isTrailer) return;

    const onMessage = (event: MessageEvent) => {
      if (isEmbedPlaybackMessage(event.data)) {
        confirmPlayback();
      }
      if (isEmbedPlaybackEnded(event.data) || isEmbedNearEnd(event.data, 0.985)) {
        openNextEpisodeOverlay();
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [confirmPlayback, isTrailer, openNextEpisodeOverlay]);

  useEffect(() => {
    setPlayerEngaged(false);
  }, [season, episode, provider, iframeSrc]);

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

  return {
    isTrailer,
    isTvPlayer,
    isFullscreen,
    showKeyboardHint,
    showNextEpisode,
    nextEpisodeCountdown,
    nextEpisodeProgress,
    nextEpisodeTarget,
    nextEpisodeSummary,
    stabilityTip,
    movieEmbedUrl,
    rawEmbedUrl,
    iframeSrc,
    playerLabel,
    displayYear,
    heroImage,
    posterImage,
    episodeLabel,
    stageRef,
    iframeRef,
    playerEngaged,
    setPlayerEngaged,
    focusPlayer,
    toggleFullscreen,
    openStreamInBrowserTab,
    playNextEpisode,
    dismissNextEpisode,
    handleIframeLoadComplete,
  };
}
