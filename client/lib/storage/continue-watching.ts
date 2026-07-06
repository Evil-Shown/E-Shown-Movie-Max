const KEY = "chithra-continue-watching";
const MAX_ITEMS = 20;

import type { ContinueWatchingItem } from "./types";

function read(): ContinueWatchingItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ContinueWatchingItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: ContinueWatchingItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export function getContinueWatching(): ContinueWatchingItem[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function upsertContinueWatching(item: ContinueWatchingItem) {
  const items = read().filter((i) => i.id !== item.id);
  write([{ ...item, updatedAt: Date.now() }, ...items]);
}

export function removeFromContinueWatching(id: string) {
  write(read().filter((item) => item.id !== id));
}

export function getContinueItem(id: string): ContinueWatchingItem | undefined {
  return read().find((item) => item.id === id);
}
