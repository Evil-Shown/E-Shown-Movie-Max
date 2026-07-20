import type { Movie } from "@/lib/types";
import type { StreamProvider } from "@/lib/providers";
import { backdropUrl, formatDisplayYear, posterUrl } from "@/lib/movies";
import { getMovieEmbedUrl, getRawMovieEmbedUrl, isTvShow } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibraryActions } from "@/components/UserLibraryProvider";
import {
  getEmbedFullscreenAction,
  isEmbedNearEnd,
  isEmbedPlaybackEnded,
  isEmbedUpNextSignal,
} from "@/lib/embed-events";
import { installAdPopupBlocker } from "@/lib/block-ad-nav";
import { exitAnyFullscreen, getActiveFullscreenElement, requestElementFullscreen } from "@/lib/fullscreen";
import {
  getEpisodeSummary,
  getNextEpisodeTarget,
  type TvEpisodeSummary,
  type TvSeasonSummary,
} from "@/lib/tv-episodes";
import { getStabilityTip, isEmbedPlaybackMessage, warmEmbedUrl, warmStreamProviders } from "@/lib/stream-optimizer";
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
  loaded,
  playerEngaged,
  setPlayerEngaged,
  confirmPlayback,
  onClose,
  onSeasonEpisodeChange,
}: UseVideoPlayerOptions) {
  const { savePlayback, setProvider } = useUserLibraryActions();
  const isTrailer = mode === "trailer";
  const isTvPlayer = !isTrailer && isTvShow(movie);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isFauxFullscreen, setIsFauxFullscreen] = useState(false);
  const [showKeyboardHint, setShowKeyboardHint] = useState(false);
  const [showNextEpisode, setShowNextEpisode] = useState(false);
  /** When true, countdown auto-plays next. When false, user must click Play Now. */
  const [nextEpisodeAuto, setNextEpisodeAuto] = useState(false);
  const [nextEpisodeCountdown, setNextEpisodeCountdown] = useState(NEXT_EPISODE_COUNTDOWN_SECONDS);
  const [nextEpisodeProgress, setNextEpisodeProgress] = useState(0);
  const [tvSeasons, setTvSeasons] = useState<TvSeasonSummary[]>([]);
  const [episodesBySeason, setEpisodesBySeason] = useState<Map<number, TvEpisodeSummary[]>>(new Map());

  const nextEpisodeTriggeredRef = useRef(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const justExitedFullscreenRef = useRef(false);

  const stabilityTip = getStabilityTip();
  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);

  const movieEmbedUrl = isTrailer
    ? null
    : getMovieEmbedUrl(movie, provider, {
        season,
        episode,
        seek: resumeSeconds,
      });

  const rawEmbedUrl = isTrailer
    ? null
    : getRawMovieEmbedUrl(movie, provider, {
        season,
        episode,
        seek: resumeSeconds,
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
    isTvPlayer && season && episode ? getNextEpisodeTarget(tvSeasons, episodesBySeason, season, episode) : null;

  const nextEpisodeSummary = nextEpisodeTarget
    ? getEpisodeSummary(episodesBySeason, nextEpisodeTarget.season, nextEpisodeTarget.episode)
    : null;

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
    setNextEpisodeAuto(false);
    nextEpisodeTriggeredRef.current = false;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setNextEpisodeProgress(0);
    onSeasonEpisodeChange(nextEpisodeTarget.season, nextEpisodeTarget.episode);
  }, [nextEpisodeTarget, onSeasonEpisodeChange]);

  const dismissNextEpisode = useCallback(() => {
    setShowNextEpisode(false);
    setNextEpisodeAuto(false);
    nextEpisodeTriggeredRef.current = true;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setNextEpisodeProgress(0);
  }, []);

  const openNextEpisodeOverlay = useCallback(
    (options?: { auto?: boolean }) => {
      if (!isTvPlayer || !nextEpisodeTarget || nextEpisodeTriggeredRef.current || showNextEpisode) {
        return;
      }
      nextEpisodeTriggeredRef.current = true;
      setNextEpisodeAuto(Boolean(options?.auto));
      setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
      setNextEpisodeProgress(0);
      setShowNextEpisode(true);
      void loadSeasonEpisodes(nextEpisodeTarget.season);
    },
    [isTvPlayer, loadSeasonEpisodes, nextEpisodeTarget, showNextEpisode]
  );

  const focusPlayer = useCallback(() => {
    iframeRef.current?.focus();
    setShowKeyboardHint(false);
  }, []);

  const exitFauxFullscreen = useCallback(() => {
    setIsFauxFullscreen(false);
    setIsFullscreen(false);
  }, []);

  const enterWrapperFullscreen = useCallback(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (getActiveFullscreenElement() || isFauxFullscreen) return;

    const enterFaux = () => {
      setIsFauxFullscreen(true);
      setIsFullscreen(true);
      focusPlayer();
    };

    // Wrapper fullscreen only — never request FS on the cross-origin iframe.
    try {
      const result = requestElementFullscreen(stage);
      if (result && typeof result.then === "function") {
        void result
          .then(() => {
            setIsFullscreen(true);
            setIsFauxFullscreen(false);
            focusPlayer();
          })
          .catch(enterFaux);
        return;
      }
      window.setTimeout(() => {
        if (!getActiveFullscreenElement()) enterFaux();
        else {
          setIsFullscreen(true);
          focusPlayer();
        }
      }, 0);
    } catch {
      enterFaux();
    }
  }, [focusPlayer, isFauxFullscreen]);

  const exitWrapperFullscreen = useCallback(() => {
    if (getActiveFullscreenElement()) void exitAnyFullscreen();
    exitFauxFullscreen();
  }, [exitFauxFullscreen]);

  const toggleFullscreen = useCallback(() => {
    if (getActiveFullscreenElement() || isFauxFullscreen) {
      exitWrapperFullscreen();
      return;
    }
    enterWrapperFullscreen();
  }, [enterWrapperFullscreen, exitWrapperFullscreen, isFauxFullscreen]);

  const openStreamInBrowserTab = useCallback(() => {
    if (!rawEmbedUrl) return;
    window.open(rawEmbedUrl, "_blank", "noopener,noreferrer");
  }, [rawEmbedUrl]);

  const handleIframeLoadComplete = useCallback(() => {
    setShowKeyboardHint(true);
  }, []);

  useEffect(() => {
    warmStreamProviders();
    warmEmbedUrl(iframeSrc);
    setPlayerEngaged(false);
  }, [movie.id, mode, iframeSrc, setPlayerEngaged]);

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
    if (!nextEpisodeTarget) return;
    void loadSeasonEpisodes(nextEpisodeTarget.season);
  }, [loadSeasonEpisodes, nextEpisodeTarget]);

  useEffect(() => {
    setShowNextEpisode(false);
    setNextEpisodeAuto(false);
    nextEpisodeTriggeredRef.current = false;
    setNextEpisodeCountdown(NEXT_EPISODE_COUNTDOWN_SECONDS);
    setNextEpisodeProgress(0);
  }, [season, episode]);

  useEffect(() => {
    setTvSeasons([]);
    setEpisodesBySeason(new Map());
  }, [movie.id]);

  // Auto-countdown only after a real "ended" signal — never for early up-next hints.
  useEffect(() => {
    if (!showNextEpisode || !nextEpisodeAuto) return;
    if (nextEpisodeCountdown <= 0) {
      playNextEpisode();
      return;
    }
    const total = NEXT_EPISODE_COUNTDOWN_SECONDS;
    setNextEpisodeProgress(1 - nextEpisodeCountdown / total);
    const timer = window.setTimeout(() => {
      setNextEpisodeCountdown((current) => current - 1);
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [nextEpisodeAuto, nextEpisodeCountdown, playNextEpisode, showNextEpisode]);

  // Embed in-player FS button → same wrapper fullscreen as the header control.
  useEffect(() => {
    if (isTrailer) return;

    const onMessage = (event: MessageEvent) => {
      const action = getEmbedFullscreenAction(event.data);
      if (!action) return;
      if (action === "enter") enterWrapperFullscreen();
      else exitWrapperFullscreen();
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [enterWrapperFullscreen, exitWrapperFullscreen, isTrailer]);

  // postMessage only — no wall-clock / fake progress timers.
  useEffect(() => {
    if (isTrailer || !isTvPlayer) return;

    const onMessage = (event: MessageEvent) => {
      if (isEmbedPlaybackMessage(event.data)) {
        confirmPlayback();
      }

      // True end → show overlay and auto-advance after countdown.
      if (isEmbedPlaybackEnded(event.data)) {
        openNextEpisodeOverlay({ auto: true });
        return;
      }

      // Up-next / final seconds → show Play Now only (no auto skip).
      if (isEmbedUpNextSignal(event.data) || isEmbedNearEnd(event.data, 30)) {
        openNextEpisodeOverlay({ auto: false });
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [confirmPlayback, isTrailer, isTvPlayer, openNextEpisodeOverlay]);

  useEffect(() => {
    setPlayerEngaged(false);
  }, [season, episode, provider, iframeSrc, setPlayerEngaged]);

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
    const uninstall = installAdPopupBlocker({ strict: true });
    return uninstall;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") {
        const tag = (e.target as HTMLElement | null)?.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
        e.preventDefault();
        toggleFullscreen();
        return;
      }
      if (e.key !== "Escape") return;
      if (isFauxFullscreen) {
        exitFauxFullscreen();
        return;
      }
      if (getActiveFullscreenElement()) return;
      if (justExitedFullscreenRef.current) {
        justExitedFullscreenRef.current = false;
        return;
      }
      onClose();
    };
    const onFullscreenChange = () => {
      const active = Boolean(getActiveFullscreenElement());
      if (!active) {
        justExitedFullscreenRef.current = true;
        window.setTimeout(() => {
          justExitedFullscreenRef.current = false;
        }, 400);
      }
      setIsFullscreen(active || isFauxFullscreen);
      if (active) {
        setIsFauxFullscreen(false);
        window.setTimeout(() => iframeRef.current?.focus(), 50);
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
      setIsFauxFullscreen(false);
    };
  }, [exitFauxFullscreen, isFauxFullscreen, onClose, toggleFullscreen]);

  return {
    isTrailer,
    isTvPlayer,
    isFullscreen: isFullscreen || isFauxFullscreen,
    isFauxFullscreen,
    showKeyboardHint,
    showNextEpisode,
    nextEpisodeCountdown,
    nextEpisodeProgress,
    nextEpisodeTarget,
    nextEpisodeSummary,
    nextEpisodeAuto,
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
