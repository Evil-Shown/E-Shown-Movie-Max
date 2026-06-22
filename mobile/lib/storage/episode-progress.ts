import AsyncStorage from '@react-native-async-storage/async-storage';
import { episodeKey } from './types';

const KEY = 'chithra-episode-progress';

async function read(): Promise<Record<string, boolean>> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

async function write(data: Record<string, boolean>): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(data));
}

export async function isEpisodeWatched(
  tvId: string,
  season: number,
  episode: number
): Promise<boolean> {
  const data = await read();
  return Boolean(data[episodeKey(tvId, season, episode)]);
}

export async function markEpisodeWatched(
  tvId: string,
  season: number,
  episode: number
): Promise<void> {
  const data = await read();
  data[episodeKey(tvId, season, episode)] = true;
  await write(data);
}

export async function unmarkEpisodeWatched(
  tvId: string,
  season: number,
  episode: number
): Promise<void> {
  const data = await read();
  delete data[episodeKey(tvId, season, episode)];
  await write(data);
}

export async function getWatchedEpisodes(tvId: string): Promise<Record<string, boolean>> {
  const data = await read();
  const prefix = `${tvId}:`;
  const result: Record<string, boolean> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key.startsWith(prefix) && value) result[key] = true;
  }
  return result;
}

export async function countWatchedEpisodes(tvId: string): Promise<number> {
  const watched = await getWatchedEpisodes(tvId);
  return Object.keys(watched).length;
}
