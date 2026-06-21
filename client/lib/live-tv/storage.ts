import { getChannelById } from "./channels";
import type { LiveTvChannel, LiveTvContinueEntry, LiveTvRecentEntry } from "./types";

const FAVORITES_KEY = "chithra-live-tv-favorites";
const RECENT_KEY = "chithra-live-tv-recent";
const CONTINUE_KEY = "chithra-live-tv-continue";

const MAX_RECENT = 12;
const MAX_CONTINUE = 8;

function readJson<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function writeJson<T>(key: string, items: T[]) {
  localStorage.setItem(key, JSON.stringify(items));
}

export function getFavoriteChannelIds(): string[] {
  return readJson<string>(FAVORITES_KEY);
}

export function getFavoriteChannels(): LiveTvChannel[] {
  return getFavoriteChannelIds()
    .map((id) => getChannelById(id))
    .filter((ch): ch is LiveTvChannel => Boolean(ch));
}

export function isFavoriteChannel(channelId: string): boolean {
  return getFavoriteChannelIds().includes(channelId);
}

export function toggleFavoriteChannel(channelId: string): boolean {
  const ids = getFavoriteChannelIds();
  const exists = ids.includes(channelId);
  const next = exists ? ids.filter((id) => id !== channelId) : [channelId, ...ids];
  writeJson(FAVORITES_KEY, next);
  return !exists;
}

export function getRecentEntries(): LiveTvRecentEntry[] {
  return readJson<LiveTvRecentEntry>(RECENT_KEY).sort((a, b) => b.viewedAt - a.viewedAt);
}

export function getRecentlyViewedChannels(): LiveTvChannel[] {
  return getRecentEntries()
    .map((entry) => getChannelById(entry.channelId))
    .filter((ch): ch is LiveTvChannel => Boolean(ch));
}

export function recordRecentlyViewed(channelId: string) {
  const entries = getRecentEntries().filter((entry) => entry.channelId !== channelId);
  writeJson(RECENT_KEY, [{ channelId, viewedAt: Date.now() }, ...entries].slice(0, MAX_RECENT));
}

export function getContinueEntries(): LiveTvContinueEntry[] {
  return readJson<LiveTvContinueEntry>(CONTINUE_KEY).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getContinueWatchingChannels(): LiveTvChannel[] {
  return getContinueEntries()
    .map((entry) => getChannelById(entry.channelId))
    .filter((ch): ch is LiveTvChannel => Boolean(ch));
}

export function upsertContinueWatching(channelId: string) {
  const entries = getContinueEntries().filter((entry) => entry.channelId !== channelId);
  writeJson(CONTINUE_KEY, [{ channelId, updatedAt: Date.now() }, ...entries].slice(0, MAX_CONTINUE));
}
