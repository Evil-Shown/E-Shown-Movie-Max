const KEY = "chithra-episode-progress";

import { episodeKey } from "./types";

function read(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function write(data: Record<string, boolean>) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function isEpisodeWatched(tvId: string, season: number, episode: number): boolean {
  return Boolean(read()[episodeKey(tvId, season, episode)]);
}

export function markEpisodeWatched(tvId: string, season: number, episode: number) {
  const data = read();
  data[episodeKey(tvId, season, episode)] = true;
  write(data);
}

export function unmarkEpisodeWatched(tvId: string, season: number, episode: number) {
  const data = read();
  delete data[episodeKey(tvId, season, episode)];
  write(data);
}

export function getWatchedEpisodes(tvId: string): Record<string, boolean> {
  const data = read();
  const prefix = `${tvId}:`;
  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(prefix) && value) result[key] = true;
  }
  return result;
}

export function countWatchedEpisodes(tvId: string): number {
  return Object.keys(getWatchedEpisodes(tvId)).length;
}
