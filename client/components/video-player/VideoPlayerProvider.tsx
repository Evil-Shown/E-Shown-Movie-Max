"use client";

import type { Movie } from "@/lib/types";
import type { StreamProvider } from "@/lib/providers";
import { getBestProvider } from "@/lib/storage/provider-performance";
import { warmStreamProvidersForPlayback } from "@/lib/stream-optimizer";
import { isTvShow } from "@/lib/streaming";
import { useAuth } from "@/components/AuthProvider";
import { useAuthModal } from "@/components/AuthModalProvider";
import { useUserLibrary } from "@/components/UserLibraryProvider";
import { AnimatePresence } from "framer-motion";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import VideoPlayerModal from "./VideoPlayerModal";
import type { ActivePlayer, OpenMovieOptions, PlayerMode } from "./types";

interface VideoPlayerContextValue {
  openMovie: (movie: Movie, options?: OpenMovieOptions) => void;
  openTrailer: (movie: Movie) => void;
  closePlayer: () => void;
}

const VideoPlayerContext = createContext<VideoPlayerContextValue | null>(null);

export function useVideoPlayer() {
  const ctx = useContext(VideoPlayerContext);
  if (!ctx) throw new Error("useVideoPlayer must be used within VideoPlayerProvider");
  return ctx;
}

export type { OpenMovieOptions } from "./types";

export default function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, setPendingAction } = useAuth();
  const { openAuthModal } = useAuthModal();
  const { preferredProvider, getResumeTime } = useUserLibrary();
  const [active, setActive] = useState<ActivePlayer | null>(null);

  const doOpenMovie = useCallback(
    (movie: Movie, options?: OpenMovieOptions) => {
      warmStreamProvidersForPlayback();
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

  const openMovie = useCallback(
    (movie: Movie, options?: OpenMovieOptions) => {
      if (!isAuthenticated) {
        setPendingAction({
          type: "watch",
          payload: { movie, options },
        });
        openAuthModal();
        return;
      }
      doOpenMovie(movie, options);
    },
    [isAuthenticated, setPendingAction, openAuthModal, doOpenMovie]
  );

  const openTrailer = useCallback(
    (movie: Movie) => setActive({ movie, mode: "trailer", provider: preferredProvider }),
    [preferredProvider]
  );

  const changeMode = useCallback((mode: PlayerMode) => {
    setActive((current) => (current ? { ...current, mode } : current));
  }, []);

  const changeProvider = useCallback((provider: StreamProvider) => {
    setActive((current) => (current ? { ...current, provider } : current));
  }, []);

  const changeSeasonEpisode = useCallback((season: number, episode: number) => {
    setActive((current) => (current ? { ...current, season, episode, resumeSeconds: undefined } : current));
  }, []);

  const closePlayer = useCallback(() => setActive(null), []);

  // Replay pending watch action after successful auth
  useEffect(() => {
    const handleAuthActionReady = (event: Event) => {
      const pending = (event as CustomEvent).detail;
      if (pending?.type === "watch" && pending?.payload?.movie) {
        doOpenMovie(pending.payload.movie, pending.payload.options);
      }
    };

    window.addEventListener("authActionReady", handleAuthActionReady);
    return () => window.removeEventListener("authActionReady", handleAuthActionReady);
  }, [doOpenMovie]);

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
