import { getChannelById } from "@/lib/live-tv/channels";
import { CHANNEL_LOGO_DOMAINS } from "@/lib/live-tv/logos";
import { getStreamForChannel } from "@/lib/live-tv/streams";
import type { LiveTvStream } from "@/lib/live-tv/types";

const CACHE_TTL_MS = 5 * 60 * 1000;

interface CacheEntry {
  stream: LiveTvStream;
  cachedAt: number;
}

const streamCache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<LiveTvStream | null>>();

function resolveLocalStream(channelId: string): LiveTvStream | null {
  const channel = getChannelById(channelId);
  if (!channel) return null;
  return channel.stream ?? getStreamForChannel(channelId) ?? null;
}

function setCache(channelId: string, stream: LiveTvStream) {
  streamCache.set(channelId, { stream, cachedAt: Date.now() });
}

export function getCachedChannelStream(channelId: string): LiveTvStream | null {
  const entry = streamCache.get(channelId);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    streamCache.delete(channelId);
    return null;
  }
  return entry.stream;
}

export function clearChannelStreamCache(channelId: string): void {
  streamCache.delete(channelId);
  inflight.delete(channelId);
}

/** Warm stream config — instant for registry channels, fetch for others */
export function prefetchChannelStream(channelId: string): void {
  const local = resolveLocalStream(channelId);
  if (local) {
    setCache(channelId, local);
    return;
  }

  if (getCachedChannelStream(channelId) || inflight.has(channelId)) return;

  const promise = fetch(`/api/live-tv/resolve?id=${encodeURIComponent(channelId)}`)
    .then((res) => (res.ok ? res.json() : null))
    .then((data) => {
      const stream = (data?.stream as LiveTvStream | undefined) ?? null;
      if (stream) setCache(channelId, stream);
      return stream;
    })
    .catch(() => null)
    .finally(() => {
      inflight.delete(channelId);
    });

  inflight.set(channelId, promise);
}

export async function resolveChannelStreamClient(channelId: string): Promise<LiveTvStream | null> {
  const local = resolveLocalStream(channelId);
  if (local) {
    setCache(channelId, local);
    return local;
  }

  const cached = getCachedChannelStream(channelId);
  if (cached) return cached;

  const pending = inflight.get(channelId);
  if (pending) return pending;

  prefetchChannelStream(channelId);
  return inflight.get(channelId) ?? Promise.resolve(null);
}

/** Preload logo images for visible channels */
export function prefetchChannelLogos(channelIds: string[], limit = 24): void {
  if (typeof window === "undefined") return;

  for (const id of channelIds.slice(0, limit)) {
    const domain = CHANNEL_LOGO_DOMAINS[id];
    if (!domain) continue;

    const img = new Image();
    img.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
}
