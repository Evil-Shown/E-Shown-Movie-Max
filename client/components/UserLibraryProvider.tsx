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
import {
  getWatchlist,
  removeFromWatchlist,
  toggleWatchlistItem,
} from "@/lib/storage/watchlist";
import {
  createContext,
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

interface UserLibraryContextValue {
  watchlist: WatchlistItem[];
  watchlistCount: number;
  isWatchlisted: (id: string) => boolean;
  toggleWatchlist: (movie: Movie) => void;
  removeWatchlistItem: (id: string) => void;
  continueWatching: ContinueWatchingItem[];
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
  preferredProvider: StreamProvider;
  setProvider: (provider: StreamProvider) => void;
  isEpisodeWatched: (tvId: string, season: number, episode: number) => boolean;
  toggleEpisodeWatched: (tvId: string, season: number, episode: number) => void;
  watchedEpisodes: Record<string, boolean>;
  watchedEpisodeCount: (tvId: string) => number;
  toasts: Toast[];
}

const UserLibraryContext = createContext<UserLibraryContextValue | null>(null);

export function useUserLibrary() {
  const ctx = useContext(UserLibraryContext);
  if (!ctx) throw new Error("useUserLibrary must be used within UserLibraryProvider");
  return ctx;
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
    syncDesktopSession();
    setWatchlist(getWatchlist());
    setContinueWatching(getContinueWatching());
    setPreferredProviderState(getPreferredProvider());
    setHydrated(true);
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
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

  const removeContinueItem = useCallback(
    (id: string) => {
      removeFromContinueWatching(id);
      setContinueWatching(getContinueWatching());
    },
    []
  );

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

  const value = useMemo<UserLibraryContextValue>(
    () => ({
      watchlist: hydrated ? watchlist : [],
      watchlistCount: watchlist.length,
      isWatchlisted: (id) => watchlist.some((w) => w.id === id),
      toggleWatchlist,
      removeWatchlistItem,
      continueWatching: hydrated ? continueWatching : [],
      savePlayback,
      removeContinueItem,
      clearContinueWatching: clearContinueItems,
      getResumeTime,
      preferredProvider,
      setProvider,
      isEpisodeWatched,
      toggleEpisodeWatched,
      watchedEpisodes,
      watchedEpisodeCount: countWatchedEpisodes,
      toasts,
    }),
    [
      hydrated,
      watchlist,
      toggleWatchlist,
      removeWatchlistItem,
      continueWatching,
      savePlayback,
      removeContinueItem,
      clearContinueItems,
      getResumeTime,
      preferredProvider,
      setProvider,
      toggleEpisodeWatched,
      watchedEpisodes,
      toasts,
    ]
  );

  return (
    <UserLibraryContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast-item">
            {toast.message}
          </div>
        ))}
      </div>
    </UserLibraryContext.Provider>
  );
}
