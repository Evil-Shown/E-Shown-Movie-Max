import type { Movie } from "@/lib/types";
import type { StreamProvider } from "@/lib/providers";
import { backdropUrl, formatDisplayYear, posterUrl } from "@/lib/movies";
import { getRawMovieEmbedUrl, isTvShow, type ResolvedMediaStream } from "@/lib/streaming";
import { getTrailerId } from "@/lib/trailers";
import { useUserLibraryActions } from "@/components/UserLibraryProvider";
import {
  getEmbedFullscreenAction,
  isEmbedNearEnd,
  isEmbedPlaybackEnded,
  isEmbedUpNextSignal,
  parseEmbedPlayerEvent,
} from "@/lib/embed-events";
import { installAdPopupBlocker } from "@/lib/block-ad-nav";
import { exitAnyFullscreen, getActiveFullscreenElement, requestElementFullscreen } from "@/lib/fullscreen";
import { syncPlayerViewportVars } from "./usePlayerViewport";
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
  resolvedStream: ResolvedMediaStream | null;
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
  resolvedStream,
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

  const [playbackCurrentTime, setPlaybackCurrentTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const playbackTimeRef = useRef(0);
  const playbackDurationRef = useRef(0);
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastStateUpdateRef = useRef(0);

  const stabilityTip = getStabilityTip();
  const trailerId = movie.trailerKey ?? getTrailerId(movie.id);

  const isHlsStream = resolvedStream?.type === "hls";
  const hlsSrc = isHlsStream ? resolvedStream?.url ?? null : null;
  const movieEmbedUrl = !isTrailer && resolvedStream?.type === "embed" ? resolvedStream.url : null;

  const rawEmbedUrl = isTrailer
    ? null
    : resolvedStream?.type === "embed"
      ? getRawMovieEmbedUrl(movie, provider, {
          season,
          episode,
          seek: resumeSeconds,
        })
      : null;

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

  const loadSeasonEpisodesRef = useRef(loadSeasonEpisodes);
  loadSeasonEpisodesRef.current = loadSeasonEpisodes;

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
      syncPlayerViewportVars();
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
    // Keyboard shortcuts tip is desktop-only — hide on touch phones.
    const touchLike =
      typeof window !== "undefined" &&
      (window.matchMedia("(hover: none)").matches || window.matchMedia("(pointer: coarse)").matches);
    setShowKeyboardHint(!touchLike);
  }, []);

  useEffect(() => {
    warmStreamProviders();
    if (!isHlsStream) warmEmbedUrl(iframeSrc);
    setPlayerEngaged(false);
  }, [movie.id, mode, iframeSrc, setPlayerEngaged, isHlsStream]);

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
    void loadSeasonEpisodesRef.current(season);
  }, [isTvPlayer, season]);

  useEffect(() => {
    if (!nextEpisodeTarget) return;
    void loadSeasonEpisodesRef.current(nextEpisodeTarget.season);
  }, [nextEpisodeTarget]);

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

  // Listen for playback events from the embed — track position for both movies and TV.
  useEffect(() => {
    if (isTrailer) return;

    const onMessage = (event: MessageEvent) => {
      if (isEmbedPlaybackMessage(event.data)) {
        confirmPlayback();
      }

      const parsed = parseEmbedPlayerEvent(event.data);
      if (parsed) {
        if (typeof parsed.currentTime === "number" && typeof parsed.duration === "number") {
          playbackTimeRef.current = parsed.currentTime;
          playbackDurationRef.current = parsed.duration;
          const now = Date.now();
          if (now - lastStateUpdateRef.current >= 1000) {
            lastStateUpdateRef.current = now;
            setPlaybackCurrentTime(parsed.currentTime);
            setPlaybackDuration(parsed.duration);
          }
        }
      }

      if (isEmbedPlaybackEnded(event.data)) {
        if (isTvPlayer) {
          openNextEpisodeOverlay({ auto: true });
        } else {
          savePlayback({
            movie,
            provider,
            season,
            episode,
            currentTime: playbackTimeRef.current || resumeSeconds || 0,
            duration: playbackDurationRef.current || (movie.runtime || 90) * 60,
          });
        }
        return;
      }

      if (isTvPlayer) {
        if (isEmbedUpNextSignal(event.data) || isEmbedNearEnd(event.data, 30)) {
          openNextEpisodeOverlay({ auto: false });
        }
      }
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [confirmPlayback, isTrailer, isTvPlayer, movie, openNextEpisodeOverlay, provider, season, episode, resumeSeconds, savePlayback]);

  useEffect(() => {
    setPlayerEngaged(false);
  }, [season, episode, provider, iframeSrc, setPlayerEngaged]);

  // Periodic save of playback position
  const doSavePlayback = useCallback(() => {
    if (isTrailer) return;
    const ct = playbackTimeRef.current;
    const dur = playbackDurationRef.current || (movie.runtime || 90) * 60;
    if (ct > 0 && dur > 0) {
      savePlayback({ movie, provider, season, episode, currentTime: ct, duration: dur });
    }
  }, [isTrailer, movie, provider, season, episode, savePlayback]);

  useEffect(() => {
    if (isTrailer || !loaded) return;
    doSavePlayback();
    saveIntervalRef.current = setInterval(doSavePlayback, 15000);
    return () => {
      if (saveIntervalRef.current) {
        clearInterval(saveIntervalRef.current);
        saveIntervalRef.current = null;
      }
    };
  }, [isTrailer, loaded, doSavePlayback]);

  useEffect(() => {
    if (isTrailer) return;
    const onUnload = () => doSavePlayback();
    window.addEventListener("beforeunload", onUnload);
    return () => {
      doSavePlayback();
      window.removeEventListener("beforeunload", onUnload);
    };
  }, [isTrailer, doSavePlayback]);

  useEffect(() => {
    if (!isTrailer && loaded && (movieEmbedUrl || hlsSrc)) {
      setProvider(provider);
    }
  }, [isTrailer, loaded, movieEmbedUrl, hlsSrc, provider, setProvider]);

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

  // Keep faux-fullscreen glued to the visual viewport when the phone rotates.
  useEffect(() => {
    if (!isFauxFullscreen) return;

    const sync = () => {
      const vv = window.visualViewport;
      const height = Math.round(vv?.height ?? window.innerHeight);
      const width = Math.round(vv?.width ?? window.innerWidth);
      const top = Math.round(vv?.offsetTop ?? 0);
      const left = Math.round(vv?.offsetLeft ?? 0);
      document.documentElement.style.setProperty("--player-vvh", `${height}px`);
      document.documentElement.style.setProperty("--player-vvw", `${width}px`);
      document.documentElement.style.setProperty("--player-vv-top", `${top}px`);
      document.documentElement.style.setProperty("--player-vv-left", `${left}px`);
      // Nudge layout after iOS orientation settle.
      stageRef.current?.getBoundingClientRect();
    };

    sync();
    const timer = window.setTimeout(sync, 350);
    window.addEventListener("resize", sync);
    window.addEventListener("orientationchange", sync);
    window.visualViewport?.addEventListener("resize", sync);
    window.visualViewport?.addEventListener("scroll", sync);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", sync);
      window.removeEventListener("orientationchange", sync);
      window.visualViewport?.removeEventListener("resize", sync);
      window.visualViewport?.removeEventListener("scroll", sync);
    };
  }, [isFauxFullscreen]);

  return {
    isTrailer,
    isTvPlayer,
    isHlsStream,
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
    hlsSrc,
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
    playbackCurrentTime,
    playbackDuration,
  };
}
