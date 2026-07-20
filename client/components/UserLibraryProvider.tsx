"use client";

import type { Movie } from "@/lib/types";
import type { StreamProvider } from "@/lib/providers";
import { resolveTmdbId } from "@/lib/streaming";
import {
  getContinueItem,
  getContinueWatching,
  clearContinueWatching,
  removeFromContinueWatching,
  upsertContinueWatching,
} from "@/lib/storage/continue-watching";
import {
  countWatchedEpisodes,
  getWatchedEpisodes,
  isEpisodeWatched,
  markEpisodeWatched,
  unmarkEpisodeWatched,
} from "@/lib/storage/episode-progress";
import { getPreferredProvider, setPreferredProvider } from "@/lib/storage/provider-pref";
import { syncDesktopSession } from "@/lib/storage/desktop-session";
import type { ContinueWatchingItem, WatchlistItem } from "@/lib/storage/types";
import { getWatchlist, removeFromWatchlist, toggleWatchlistItem } from "@/lib/storage/watchlist";
import {
  createContext,
  memo,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface Toast {
  id: number;
  message: string;
}

interface WatchlistContextValue {
  hydrated: boolean;
  watchlist: WatchlistItem[];
  watchlistCount: number;
  isWatchlisted: (id: string) => boolean;
  toasts: Toast[];
}

interface PlaybackContextValue {
  hydrated: boolean;
  continueWatching: ContinueWatchingItem[];
  preferredProvider: StreamProvider;
  watchedEpisodes: Record<string, boolean>;
  watchedEpisodeCount: (tvId: string) => number;
  isEpisodeWatched: (tvId: string, season: number, episode: number) => boolean;
}

interface UserLibraryActionsValue {
  toggleWatchlist: (movie: Movie) => void;
  removeWatchlistItem: (id: string) => void;
  savePlayback: (params: {
    movie: Movie;
    provider: StreamProvider;
    season?: number;
    episode?: number;
    currentTime?: number;
    duration?: number;
  }) => void;
  removeContinueItem: (id: string) => void;
  clearContinueWatching: () => void;
  getResumeTime: (id: string) => number;
  setProvider: (provider: StreamProvider) => void;
  toggleEpisodeWatched: (tvId: string, season: number, episode: number) => void;
}

type UserLibraryContextValue = WatchlistContextValue & PlaybackContextValue & UserLibraryActionsValue;

const WatchlistContext = createContext<WatchlistContextValue | null>(null);
const PlaybackContext = createContext<PlaybackContextValue | null>(null);
const UserLibraryActionsContext = createContext<UserLibraryActionsValue | null>(null);

const MemoizedChildren = memo(function MemoizedChildren({ children }: { children: ReactNode }) {
  return <>{children}</>;
});

export function useWatchlistLibrary() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlistLibrary must be used within UserLibraryProvider");
  return ctx;
}

export function usePlaybackLibrary() {
  const ctx = useContext(PlaybackContext);
  if (!ctx) throw new Error("usePlaybackLibrary must be used within UserLibraryProvider");
  return ctx;
}

export function useUserLibraryActions() {
  const ctx = useContext(UserLibraryActionsContext);
  if (!ctx) throw new Error("useUserLibraryActions must be used within UserLibraryProvider");
  return ctx;
}

export function useUserLibrary(): UserLibraryContextValue {
  const watchlist = useWatchlistLibrary();
  const playback = usePlaybackLibrary();
  const actions = useUserLibraryActions();
  return useMemo(
    () => ({
      ...watchlist,
      ...playback,
      ...actions,
    }),
    [watchlist, playback, actions]
  );
}

function movieToWatchlistItem(movie: Movie): WatchlistItem | null {
  const tmdbId = resolveTmdbId(movie) ?? (/^\d+$/.test(movie.id) ? movie.id : null);
  if (!tmdbId && !/^tt\d+$/.test(movie.id)) return null;
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    mediaType: movie.mediaType ?? "movie",
    tmdbId: tmdbId ?? movie.id,
    year: movie.year,
    rating: movie.rating,
    genres: movie.genres.length ? movie.genres : undefined,
    addedAt: Date.now(),
  };
}

export default function UserLibraryProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [preferredProvider, setPreferredProviderState] = useState<StreamProvider>("vidfast");
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, boolean>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      syncDesktopSession();
    } catch (error) {
      console.error("Failed to sync desktop session:", error);
    }
    setWatchlist(getWatchlist());
    setContinueWatching(getContinueWatching());
    setPreferredProviderState(getPreferredProvider());
    setHydrated(true);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }].slice(-3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2800);
  }, []);

  const toggleWatchlist = useCallback(
    (movie: Movie) => {
      const item = movieToWatchlistItem(movie);
      if (!item) {
        showToast("Cannot add this title to watchlist");
        return;
      }
      const result = toggleWatchlistItem(item);
      setWatchlist(getWatchlist());
      showToast(result === "added" ? "Added to Watchlist" : "Removed from Watchlist");
    },
    [showToast]
  );

  const removeWatchlistItem = useCallback(
    (id: string) => {
      removeFromWatchlist(id);
      setWatchlist(getWatchlist());
      showToast("Removed from Watchlist");
    },
    [showToast]
  );

  const savePlayback = useCallback(
    (params: {
      movie: Movie;
      provider: StreamProvider;
      season?: number;
      episode?: number;
      currentTime?: number;
      duration?: number;
    }) => {
      const { movie, provider, season, episode, currentTime = 0, duration = 0 } = params;
      const tmdbId = resolveTmdbId(movie) ?? movie.id;
      const progress = duration > 0 ? Math.min(100, Math.round((currentTime / duration) * 100)) : 0;

      const item: ContinueWatchingItem = {
        id: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        mediaType: movie.mediaType ?? "movie",
        tmdbId,
        genres: movie.genres.length ? movie.genres : undefined,
        year: movie.year,
        voteAverage: movie.rating,
        overview: movie.overview,
        progress,
        currentTime,
        duration,
        season,
        episode,
        provider,
        updatedAt: Date.now(),
      };

      upsertContinueWatching(item);
      setContinueWatching(getContinueWatching());

      if (season && episode && movie.id.startsWith("tv-")) {
        markEpisodeWatched(movie.id.slice(3), season, episode);
        setWatchedEpisodes(getWatchedEpisodes(movie.id.slice(3)));
      }
    },
    []
  );

  const removeContinueItem = useCallback((id: string) => {
    removeFromContinueWatching(id);
    setContinueWatching(getContinueWatching());
  }, []);

  const clearContinueItems = useCallback(() => {
    clearContinueWatching();
    setContinueWatching([]);
  }, []);

  const getResumeTime = useCallback((id: string) => {
    return getContinueItem(id)?.currentTime ?? 0;
  }, []);

  const setProvider = useCallback((provider: StreamProvider) => {
    setPreferredProvider(provider);
    setPreferredProviderState(provider);
  }, []);

  const toggleEpisodeWatched = useCallback((tvId: string, season: number, episode: number) => {
    if (isEpisodeWatched(tvId, season, episode)) {
      unmarkEpisodeWatched(tvId, season, episode);
    } else {
      markEpisodeWatched(tvId, season, episode);
    }
    setWatchedEpisodes(getWatchedEpisodes(tvId));
  }, []);

  const watchlistValue = useMemo<WatchlistContextValue>(
    () => ({
      hydrated,
      watchlist: hydrated ? watchlist : [],
      watchlistCount: hydrated ? watchlist.length : 0,
      isWatchlisted: (id) => (hydrated ? watchlist : []).some((w) => w.id === id),
      toasts,
    }),
    [hydrated, watchlist, toasts]
  );

  const playbackValue = useMemo<PlaybackContextValue>(
    () => ({
      hydrated,
      continueWatching: hydrated ? continueWatching : [],
      preferredProvider,
      watchedEpisodes,
      watchedEpisodeCount: countWatchedEpisodes,
      isEpisodeWatched,
    }),
    [hydrated, continueWatching, preferredProvider, watchedEpisodes]
  );

  const actionsValue = useMemo<UserLibraryActionsValue>(
    () => ({
      toggleWatchlist,
      removeWatchlistItem,
      savePlayback,
      removeContinueItem,
      clearContinueWatching: clearContinueItems,
      getResumeTime,
      setProvider,
      toggleEpisodeWatched,
    }),
    [
      toggleWatchlist,
      removeWatchlistItem,
      savePlayback,
      removeContinueItem,
      clearContinueItems,
      getResumeTime,
      setProvider,
      toggleEpisodeWatched,
    ]
  );

  return (
    <UserLibraryActionsContext.Provider value={actionsValue}>
      <WatchlistContext.Provider value={watchlistValue}>
        <PlaybackContext.Provider value={playbackValue}>
          <MemoizedChildren>{children}</MemoizedChildren>
          <div className="toast-stack" aria-live="polite">
            {toasts.map((toast) => (
              <div key={toast.id} className="toast-item">
                {toast.message}
              </div>
            ))}
          </div>
        </PlaybackContext.Provider>
      </WatchlistContext.Provider>
    </UserLibraryActionsContext.Provider>
  );
}
