import type { LiveTvStream } from "./types";
import { cacheGetJson, cacheSetJson, redisKey } from "@/lib/cache/redis";

const IPTV_STREAMS_URL = "https://iptv-org.github.io/api/streams.json";
const CACHE_TTL_SECONDS = 60 * 60; // 1 hour
const IPTV_CACHE_KEY = redisKey("iptv", "streams", "all");

interface IptvOrgStream {
  channel: string | null;
  feed: string | null;
  title: string;
  url: string;
  quality: string | null;
  referrer: string | null;
}

let cachedStreams: IptvOrgStream[] | null = null;
let cacheTimestamp = 0;

async function fetchIptvStreams(): Promise<IptvOrgStream[]> {
  const cached = await cacheGetJson<IptvOrgStream[]>(IPTV_CACHE_KEY);
  if (cached) {
    cachedStreams = cached;
    cacheTimestamp = Date.now();
    return cached;
  }

  const now = Date.now();
  if (cachedStreams && now - cacheTimestamp < CACHE_TTL_SECONDS * 1000) {
    return cachedStreams;
  }

  const response = await fetch(IPTV_STREAMS_URL, {
    next: { revalidate: CACHE_TTL_SECONDS },
  });

  if (!response.ok) {
    throw new Error(`iptv-org API error: ${response.status}`);
  }

  cachedStreams = (await response.json()) as IptvOrgStream[];
  cacheTimestamp = now;
  await cacheSetJson(IPTV_CACHE_KEY, cachedStreams, CACHE_TTL_SECONDS);
  return cachedStreams;
}

function toLiveTvStream(entry: IptvOrgStream): LiveTvStream {
  return {
    type: "hls",
    url: entry.url,
    referer: entry.referrer ?? undefined,
    iptvChannelId: entry.channel
      ? entry.feed
        ? `${entry.channel}@${entry.feed}`
        : entry.channel
      : undefined,
  };
}

/** Resolve all matching streams from iptv-org (for fallback chain) */
export async function resolveAllStreamsFromIptvOrg(
  iptvChannelId?: string,
  title?: string,
  limit = 5
): Promise<LiveTvStream[]> {
  try {
    const streams = await fetchIptvStreams();
    const matches: IptvOrgStream[] = [];

    if (iptvChannelId) {
      const [channelId, feed] = iptvChannelId.split("@");
      for (const s of streams) {
        if (!s.channel || !s.url.startsWith("http")) continue;
        const idMatch = feed
          ? s.channel === channelId && s.feed === feed
          : s.channel === channelId || `${s.channel}@${s.feed}` === iptvChannelId;
        if (idMatch) matches.push(s);
      }
    }

    if (matches.length === 0 && title) {
      const normalized = title.toLowerCase();
      for (const s of streams) {
        if (!s.url.startsWith("http")) continue;
        const t = s.title?.toLowerCase() ?? "";
        if (t === normalized || t.includes(normalized)) matches.push(s);
      }
    }

    return matches.slice(0, limit).map(toLiveTvStream);
  } catch {
    return [];
  }
}

/** Resolve stream from iptv-org by channel id (e.g. "HiruTV.lk@SD") or title */
export async function resolveStreamFromIptvOrg(
  iptvChannelId?: string,
  title?: string
): Promise<LiveTvStream | null> {
  const all = await resolveAllStreamsFromIptvOrg(iptvChannelId, title, 1);
  return all[0] ?? null;
}

/** Search iptv-org for streams matching a query — returns up to `limit` results */
export async function searchIptvStreams(
  query: string,
  limit = 5
): Promise<LiveTvStream[]> {
  try {
    const streams = await fetchIptvStreams();
    const q = query.toLowerCase();
    return streams
      .filter((s) => s.title?.toLowerCase().includes(q) && s.url.startsWith("http"))
      .slice(0, limit)
      .map(toLiveTvStream);
  } catch {
    return [];
  }
}
