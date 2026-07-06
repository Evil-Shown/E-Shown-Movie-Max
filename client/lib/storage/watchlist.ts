const KEY = "chithra-watchlist";
const MAX_ITEMS = 100;

import type { WatchlistItem } from "./types";

function read(): WatchlistItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as WatchlistItem[]) : [];
  } catch {
    return [];
  }
}

function write(items: WatchlistItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items.slice(0, MAX_ITEMS)));
}

export function getWatchlist(): WatchlistItem[] {
  return read().sort((a, b) => b.addedAt - a.addedAt);
}

export function isInWatchlist(id: string): boolean {
  return read().some((item) => item.id === id);
}

export function toggleWatchlistItem(item: WatchlistItem): "added" | "removed" {
  const items = read();
  const index = items.findIndex((i) => i.id === item.id);
  if (index >= 0) {
    items.splice(index, 1);
    write(items);
    return "removed";
  }
  write([{ ...item, addedAt: Date.now() }, ...items]);
  return "added";
}

export function removeFromWatchlist(id: string) {
  write(read().filter((item) => item.id !== id));
}
