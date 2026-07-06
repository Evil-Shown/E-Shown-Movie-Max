import { getChannelById } from "@/lib/live-tv/channels";
import { resolveAllStreamsFromIptvOrg } from "@/lib/live-tv/iptv-org";
import { scrapeChannelStreams, getScrapeReferer, getScrapeOrigin } from "@/lib/live-tv/stream-scraper";
import { getStreamForChannel } from "@/lib/live-tv/streams";
import type { LiveTvStream } from "@/lib/live-tv/types";

const UNRELIABLE_HOSTS = ["allinonereborn", "149.71.34.166", "free.fullspeed.tv"];

function isReliableUrl(url: string): boolean {
  return !UNRELIABLE_HOSTS.some((host) => url.includes(host));
}

function isHlsManifestUrl(url: string): boolean {
  return url.includes(".m3u8");
}

function dedupeUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean))];
}

/** Merge registry + iptv-org + scraped HLS into one stream config */
export async function resolveChannelStream(channelId: string): Promise<LiveTvStream | null> {
  const channel = getChannelById(channelId);
  if (!channel) return null;

  const registry = channel.stream ?? getStreamForChannel(channelId) ?? null;

  const iptvEntries = await resolveAllStreamsFromIptvOrg(
    registry?.iptvChannelId,
    channel.name,
    8
  );

  const iptvUrls = iptvEntries.map((s) => s.url).filter(isReliableUrl).filter(isHlsManifestUrl);

  const scrapedUrls = (await scrapeChannelStreams(channelId))
    .filter(isReliableUrl)
    .filter(isHlsManifestUrl);

  const scrapeReferer = getScrapeReferer(channelId);
  const scrapeOrigin = getScrapeOrigin(channelId);

  if (!registry && iptvUrls.length === 0 && scrapedUrls.length === 0) {
    return null;
  }

  // Keep iframe/youtube embed as primary — scraped PEOTV URLs are often geo-blocked
  const primary =
    registry?.url ?? scrapedUrls[0] ?? iptvUrls[0];

  const hlsExtras = dedupeUrls([
    ...scrapedUrls,
    ...iptvUrls,
    ...(registry?.fallbacks ?? []),
  ]).filter((u) => u !== primary && isHlsManifestUrl(u));

  const fallbacks = dedupeUrls([
    ...(registry?.fallbacks ?? []).filter(isHlsManifestUrl),
    ...hlsExtras,
  ]).filter(isReliableUrl);

  const streamType = registry?.type ?? "hls";

  return {
    type: streamType,
    url: primary,
    fallbacks: streamType === "hls" ? fallbacks : hlsExtras.length ? hlsExtras : fallbacks,
    referer:
      registry?.referer ??
      scrapeReferer ??
      iptvEntries[0]?.referer,
    origin: registry?.origin ?? scrapeOrigin,
    poster: registry?.poster,
    iptvChannelId: registry?.iptvChannelId,
    embedFallback: registry?.type === "iframe" ? registry.url : undefined,
  };
}
