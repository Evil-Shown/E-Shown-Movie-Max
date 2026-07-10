import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ContinueWatchingItem } from './types';

const KEY = 'chithra-continue-watching';
const MAX_ITEMS = 20;

async function read(): Promise<ContinueWatchingItem[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContinueWatchingItem[]) : [];
  } catch {
    return [];
  }
}

async function write(items: ContinueWatchingItem[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export async function getContinueWatching(): Promise<ContinueWatchingItem[]> {
  const items = await read();
  return items.sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function upsertContinueWatching(item: ContinueWatchingItem): Promise<void> {
  const items = await read();
  const filtered = items.filter((i) => i.id !== item.id);
  await write([{ ...item, updatedAt: Date.now() }, ...filtered]);
}

export async function removeFromContinueWatching(id: string): Promise<void> {
  const items = await read();
  await write(items.filter((item) => item.id !== id));
}

export async function getContinueItem(id: string): Promise<ContinueWatchingItem | undefined> {
  const items = await read();
  return items.find((item) => item.id === id);
}
