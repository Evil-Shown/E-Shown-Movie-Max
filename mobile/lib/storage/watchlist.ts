import AsyncStorage from '@react-native-async-storage/async-storage';
import type { WatchlistItem } from './types';

const KEY = 'chithra-watchlist';
const MAX_ITEMS = 100;

async function read(): Promise<WatchlistItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
  } catch {
    return [];
  }
}

async function write(items: WatchlistItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export async function getWatchlist(): Promise<WatchlistItem[]> {
  const items = await read();
  return items.sort((a, b) => b.addedAt - a.addedAt);
}

export async function isInWatchlist(id: string): Promise<boolean> {
  const items = await read();
  return items.some((item) => item.id === id);
}

export async function toggleWatchlistItem(
  item: WatchlistItem
): Promise<'added' | 'removed'> {
  const items = await read();
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    items.splice(index, 1);
    await write(items);
    return 'removed';
  }
  await write([{ ...item, addedAt: Date.now() }, ...items]);
  return 'added';
}

export async function removeFromWatchlist(id: string): Promise<void> {
  const items = await read();
  await write(items.filter((item) => item.id !== id));
}
