import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { Movie } from '@/lib/tmdb-types';
import type { StreamProvider } from '@/lib/providers';
import { isTvShow, resolveTmdbId } from '@/lib/streaming';
import {
  getContinueItem,
  getContinueWatching,
  removeFromContinueWatching,
  upsertContinueWatching,
} from '@/lib/storage/continue-watching';
import {
  countWatchedEpisodes,
  getWatchedEpisodes,
  isEpisodeWatched as isEpisodeWatchedStorage,
  markEpisodeWatched,
  unmarkEpisodeWatched,
} from '@/lib/storage/episode-progress';
import { getPreferredProvider, setPreferredProvider } from '@/lib/storage/provider-pref';
import { hydratePerformanceCache } from '@/lib/storage/provider-performance';
import type { ContinueWatchingItem, WatchlistItem } from '@/lib/storage/types';
import {
  getWatchlist,
  removeFromWatchlist,
  toggleWatchlistItem,
} from '@/lib/storage/watchlist';
import { colors, radii, shadows, spacing } from '@/constants/theme';

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
  getResumeTime: (id: string) => number;
  preferredProvider: StreamProvider;
  setProvider: (provider: StreamProvider) => void;
  isEpisodeWatched: (tvId: string, season: number, episode: number) => boolean;
  toggleEpisodeWatched: (tvId: string, season: number, episode: number) => void;
  watchedEpisodes: Record<string, boolean>;
  watchedEpisodeCount: (tvId: string) => number;
}

const UserLibraryContext = createContext<UserLibraryContextValue | null>(null);

export function useUserLibrary() {
  const ctx = useContext(UserLibraryContext);
  if (!ctx) throw new Error('useUserLibrary must be used within UserLibraryProvider');
  return ctx;
}

function movieToWatchlistItem(movie: Movie): WatchlistItem | null {
  const tmdbId = resolveTmdbId(movie) ?? (/^\d+$/.test(movie.id) ? movie.id : null);
  if (!tmdbId && !/^tt\d+$/.test(movie.id)) return null;
  return {
    id: movie.id,
    title: movie.title,
    posterPath: movie.posterPath,
    mediaType: movie.mediaType ?? 'movie',
    tmdbId: tmdbId ?? movie.id,
    year: movie.year,
    rating: movie.rating,
    addedAt: Date.now(),
  };
}

export function UserLibraryProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([]);
  const [preferredProvider, setPreferredProviderState] = useState<StreamProvider>('vidsrc');
  const [watchedEpisodes, setWatchedEpisodes] = useState<Record<string, boolean>>({});
  const [resumeTimes, setResumeTimes] = useState<Record<string, number>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Initial hydration from AsyncStorage — async by nature, unlike the web
  // app's synchronous localStorage reads, so this only runs once on mount.
  useEffect(() => {
    (async () => {
      const [wl, cw, pref] = await Promise.all([
        getWatchlist(),
        getContinueWatching(),
        getPreferredProvider(),
        hydratePerformanceCache(),
      ]);
      setWatchlist(wl);
      setContinueWatching(cw);
      setPreferredProviderState(pref);
      setHydrated(true);
    })();
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
        showToast('Cannot add this title to watchlist');
        return;
      }
      (async () => {
        const result = await toggleWatchlistItem(item);
        setWatchlist(await getWatchlist());
        showToast(result === 'added' ? 'Added to Watchlist' : 'Removed from Watchlist');
      })();
    },
    [showToast]
  );

  const removeWatchlistItem = useCallback(
    (id: string) => {
      (async () => {
        await removeFromWatchlist(id);
        setWatchlist(await getWatchlist());
        showToast('Removed from Watchlist');
      })();
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
        mediaType: movie.mediaType ?? 'movie',
        tmdbId,
        progress,
        currentTime,
        duration,
        season,
        episode,
        provider,
        updatedAt: Date.now(),
      };

      (async () => {
        await upsertContinueWatching(item);
        setContinueWatching(await getContinueWatching());
        // Keep a fast in-memory cache of resume times so getResumeTime()
        // can stay synchronous for callers (matches web app's API shape).
        setResumeTimes((prev) => ({ ...prev, [movie.id]: currentTime }));

        if (season && episode && isTvShow(movie)) {
          const tvId = movie.id.startsWith('tv-') ? movie.id.slice(3) : tmdbId;
          await markEpisodeWatched(tvId, season, episode);
          setWatchedEpisodes(await getWatchedEpisodes(tvId));
        }
      })();
    },
    []
  );

  const removeContinueItem = useCallback((id: string) => {
    (async () => {
      await removeFromContinueWatching(id);
      setContinueWatching(await getContinueWatching());
    })();
  }, []);

  // Synchronous lookup matching the web app's API — backed by the in-memory
  // cache populated on hydration + every savePlayback call.
  const getResumeTime = useCallback(
    (id: string) => resumeTimes[id] ?? 0,
    [resumeTimes]
  );

  // Populate the resume-time cache once on hydration so getResumeTime works
  // immediately for previously-saved items, not just ones saved this session.
  useEffect(() => {
    if (!hydrated) return;
    (async () => {
      const items = await getContinueWatching();
      const cache: Record<string, number> = {};
      for (const item of items) cache[item.id] = item.currentTime;
      setResumeTimes((prev) => ({ ...cache, ...prev }));
    })();
  }, [hydrated]);

  const setProvider = useCallback((provider: StreamProvider) => {
    (async () => {
      await setPreferredProvider(provider);
      setPreferredProviderState(provider);
    })();
  }, []);

  const isEpisodeWatched = useCallback(
    (tvId: string, season: number, episode: number) => {
      const key = `${tvId}:s${season}e${episode}`;
      return Boolean(watchedEpisodes[key]);
    },
    [watchedEpisodes]
  );

  const toggleEpisodeWatched = useCallback(
    (tvId: string, season: number, episode: number) => {
      (async () => {
        const watched = await isEpisodeWatchedStorage(tvId, season, episode);
        if (watched) {
          await unmarkEpisodeWatched(tvId, season, episode);
        } else {
          await markEpisodeWatched(tvId, season, episode);
        }
        setWatchedEpisodes(await getWatchedEpisodes(tvId));
      })();
    },
    []
  );

  const watchedEpisodeCount = useCallback((tvId: string) => {
    // Synchronous count derived from the loaded watchedEpisodes map for the
    // currently-viewed show; for an exact cross-show count use the async
    // countWatchedEpisodes() from lib/storage/episode-progress directly.
    const prefix = `${tvId}:`;
    return Object.keys(watchedEpisodes).filter((k) => k.startsWith(prefix)).length;
  }, [watchedEpisodes]);

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
      getResumeTime,
      preferredProvider,
      setProvider,
      isEpisodeWatched,
      toggleEpisodeWatched,
      watchedEpisodes,
      watchedEpisodeCount,
    }),
    [
      hydrated,
      watchlist,
      toggleWatchlist,
      removeWatchlistItem,
      continueWatching,
      savePlayback,
      removeContinueItem,
      getResumeTime,
      preferredProvider,
      setProvider,
      isEpisodeWatched,
      toggleEpisodeWatched,
      watchedEpisodes,
      watchedEpisodeCount,
    ]
  );

  return (
    <UserLibraryContext.Provider value={value}>
      {children}
      <View style={styles.toastStack} pointerEvents="none">
        {toasts.map((toast) => (
          <View key={toast.id} style={styles.toastItem}>
            <Text style={styles.toastText}>{toast.message}</Text>
          </View>
        ))}
      </View>
    </UserLibraryContext.Provider>
  );
}

const styles = StyleSheet.create({
  toastStack: {
    position: 'absolute',
    bottom: spacing.xxl,
    right: spacing.xl,
    left: spacing.xl,
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  toastItem: {
    backgroundColor: colors.bgCard,
    borderRadius: radii.full,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    ...shadows.md,
  },
  toastText: {
    color: colors.textPrimary,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 13,
  },
});
