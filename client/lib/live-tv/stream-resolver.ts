import { getChannelById } from "@/lib/live-tv/channels";
import { resolveAllStreamsFromIptvOrg } from "@/lib/live-tv/iptv-org";
import { scrapeChannelStreams, getScrapeReferer, getScrapeOrigin } from "@/lib/live-tv/stream-scraper";
import { getStreamForChannel } from "@/lib/live-tv/streams";
import { pickWorkingStreamUrls } from "@/lib/live-tv/stream-validator";
import { sortByStability } from "@/lib/live-tv/stream-stability";
import type { LiveTvStream } from "@/lib/live-tv/types";

const UNRELIABLE_HOSTS = ["allinonereborn", "149.71.34.166", "free.fullspeed.tv"];
const INTERNATIONAL_SKIP_SCRAPE = new Set([
  "animal-planet", "discovery-channel", "national-geographic", "history-channel",
  "smithsonian", "cartoon-network", "nickelodeon", "disney-channel", "boomerang",
  "pbs-kids", "duck-tv", "baby-tv", "cnn", "cnn-international", "bbc-world-news",
  "fox-news", "espn", "espn2", "eurosport", "mtv", "comedy-central", "warner-tv",
  "axn", "nasa-tv", "euronews", "dw", "nhk-world", "sky-news", "al-jazeera",
]);

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

  const [iptvEntries, scrapedUrls] = await Promise.all([
    resolveAllStreamsFromIptvOrg(registry?.iptvChannelId, channel.name, 10),
    INTERNATIONAL_SKIP_SCRAPE.has(channelId)
      ? Promise.resolve([])
      : scrapeChannelStreams(channelId),
  ]);

  const iptvUrls = iptvEntries
    .map((s) => s.url)
    .filter(isReliableUrl)
    .filter(isHlsManifestUrl)
    .filter((u) => !u.includes("jmp2.uk"));

  const scraped = scrapedUrls.filter(isReliableUrl).filter(isHlsManifestUrl);

  const scrapeReferer = getScrapeReferer(channelId);
  const scrapeOrigin = getScrapeOrigin(channelId);

  const referer =
    registry?.referer ?? scrapeReferer ?? iptvEntries[0]?.referer;
  const origin = registry?.origin ?? scrapeOrigin;

  const candidateUrls = sortByStability(
    dedupeUrls([
      ...(registry ? [registry.url, ...(registry.fallbacks ?? [])] : []),
      ...iptvUrls,
      ...scraped,
    ])
      .filter(isReliableUrl)
      .filter(isHlsManifestUrl)
  );

  if (candidateUrls.length === 0) {
    if (registry?.type === "iframe" || registry?.type === "youtube") return registry;
    return null;
  }

  const ordered = await pickWorkingStreamUrls(candidateUrls, referer, origin);
  const primary = ordered[0];
  const stablePrimary = !primary.includes("jmp2.uk");
  const fallbacks = ordered
    .slice(1)
    .filter((u) => !stablePrimary || !u.includes("jmp2.uk"));

  const streamType = registry?.type === "iframe" || registry?.type === "youtube"
    ? registry.type
    : "hls";

  if (streamType !== "hls") {
    return registry;
  }

  return {
    type: "hls",
    url: primary,
    fallbacks,
    referer,
    origin,
    poster: registry?.poster,
    iptvChannelId: registry?.iptvChannelId,
    embedFallback:
      registry?.embedFallback ??
      (registry?.type === "iframe" ? registry.url : undefined),
  };
}
