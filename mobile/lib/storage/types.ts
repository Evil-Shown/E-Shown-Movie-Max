import type { MediaType } from '../tmdb-types';
import type { StreamProvider } from '../providers';

export interface WatchlistItem {
  id: string;
  title: string;
  posterPath: string;
  mediaType: MediaType;
  tmdbId: string;
  year: number;
  rating: number;
  addedAt: number;
}

export interface ContinueWatchingItem {
  id: string;
  title: string;
  posterPath: string;
  mediaType: MediaType;
  tmdbId: string;
  progress: number; // 0-100
  currentTime: number;
  duration: number;
  season?: number;
  episode?: number;
  provider: StreamProvider;
  updatedAt: number;
}

export function episodeKey(tvId: string, season: number, episode: number): string {
  return `${tvId}:s${season}e${episode}`;
}
