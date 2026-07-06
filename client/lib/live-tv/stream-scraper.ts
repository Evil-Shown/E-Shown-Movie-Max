import { fetchStreamResource } from "@/lib/live-tv/stream-fetch";
import {
  buildPeotvStreamUrls,
  DIALOG_SCRAPE_PAGES,
  getProviderOrigin,
  getProviderReferer,
  PEOTV_CHANNEL_IDS,
  PROVIDER_SCRAPE_PAGES,
} from "@/lib/live-tv/stream-providers";

/** Broadcaster pages to scan for embedded HLS manifests */
export const BROADCASTER_PAGES: Record<string, { pageUrl: string; referer?: string; origin?: string }> = {
  "tv-derana": { pageUrl: "https://www.derana.lk/live", referer: "https://www.derana.lk/" },
  "sirasa-tv": { pageUrl: "https://www.sirasatv.lk/live", referer: "https://www.sirasatv.lk/" },
  "itn": { pageUrl: "https://itn.lk/live/", referer: "https://itn.lk/" },
  "swarnavahini": { pageUrl: "https://swarnavahini.lk/live", referer: "https://swarnavahini.lk/" },
  "rupavahini": { pageUrl: "https://www.rupavahini.lk/live-tv", referer: "https://www.rupavahini.lk/" },
  "vasantham-tv": { pageUrl: "https://vasantham.lk/", referer: "https://vasantham.lk/" },
  "supreme-tv": { pageUrl: "https://tvsupreme.lk/live/", referer: "https://tvsupreme.lk/" },
  "shakthi-tv": { pageUrl: "https://shakthitv.lk/live", referer: "https://shakthitv.lk/" },
  "channel-eye": { pageUrl: "https://www.channeleye.lk/live", referer: "https://www.channeleye.lk/" },
  "hiru-tv": { pageUrl: "https://www.hirutv.lk/live", referer: "https://www.hirutv.lk/" },
};

const M3U8_PATTERN = /https?:\/\/[^\s"'<>\\]+?\.m3u8[^\s"'<>\\]*/gi;
const MPD_PATTERN = /https?:\/\/[^\s"'<>\\]+?\.mpd[^\s"'<>\\]*/gi;
const SOURCE_PATTERN = /(?:src|file|source|url|streamUrl|playbackUrl|hlsUrl)\s*[:=]\s*["']([^"']+)["']/gi;
const VIDEO_SRC_PATTERN = /<(?:video|source)[^>]+(?:src|data-src)=["']([^"']+)["']/gi;
const JSON_STREAM_PATTERN = /"(?:hls|m3u8|stream|manifest)[^"]*"\s*:\s*"(https?:\\\/\\\/[^"']+)"/gi;

const UNRELIABLE = ["allinonereborn", "free.fullspeed.tv", "149.71.34.166", "mini.allinonereborn"];

function isReliableStreamUrl(url: string): boolean {
  if (!url.startsWith("http")) return false;
  return !UNRELIABLE.some((h) => url.includes(h));
}

function normalizeStreamUrl(raw: string): string {
  return raw
    .replace(/\\u0026/g, "&")
    .replace(/\\u002F/g, "/")
    .replace(/\\\//g, "/")
    .replace(/&amp;/g, "&")
    .trim();
}

/** Extract HLS manifest URLs from HTML or JS page source */
export function extractStreamUrlsFromContent(content: string): string[] {
  const found = new Set<string>();

  const collect = (raw: string) => {
    const url = normalizeStreamUrl(raw);
    if (url.includes(".m3u8") && isReliableStreamUrl(url)) found.add(url);
  };

  for (const match of content.matchAll(M3U8_PATTERN)) collect(match[0]);
  for (const match of content.matchAll(MPD_PATTERN)) collect(match[0].replace(".mpd", ".m3u8"));

  for (const match of content.matchAll(SOURCE_PATTERN)) {
    const url = normalizeStreamUrl(match[1]);
    if (url.includes(".m3u8") && isReliableStreamUrl(url)) found.add(url);
  }

  for (const match of content.matchAll(VIDEO_SRC_PATTERN)) {
    const url = normalizeStreamUrl(match[1]);
    if (url.includes(".m3u8") && isReliableStreamUrl(url)) found.add(url);
  }

  for (const match of content.matchAll(JSON_STREAM_PATTERN)) {
    collect(match[1]);
  }

  return [...found];
}

export interface ScrapeTarget {
  pageUrl: string;
  referer?: string;
  origin?: string;
}

/** Fetch page and reverse-engineer stream URLs from embedded scripts */
export async function scrapePage(target: ScrapeTarget): Promise<string[]> {
  try {
    const response = await fetchStreamResource(target.pageUrl, {
      referer: target.referer ?? target.pageUrl,
      origin: target.origin,
      retries: 2,
      mode: "document",
    });

    if (!response.ok) return [];

    const html = await response.text();
    return extractStreamUrlsFromContent(html);
  } catch {
    return [];
  }
}

/** Known PEOTV / Dialog URL patterns for a channel */
export function getProviderStreamCandidates(channelId: string): string[] {
  return buildPeotvStreamUrls(channelId);
}

/** Scrape broadcaster + PEOTV / Dialog provider pages for a channel */
export async function scrapeChannelStreams(channelId: string): Promise<string[]> {
  const providerUrls = getProviderStreamCandidates(channelId);
  const targets: ScrapeTarget[] = [];

  const broadcaster = BROADCASTER_PAGES[channelId];
  if (broadcaster) targets.push(broadcaster);

  for (const page of PROVIDER_SCRAPE_PAGES[channelId] ?? []) {
    targets.push(page);
  }

  if (PEOTV_CHANNEL_IDS[channelId]) {
    for (const dialogPage of DIALOG_SCRAPE_PAGES) {
      targets.push(dialogPage);
    }
  }

  const scraped = await Promise.all(targets.map((t) => scrapePage(t)));
  return [...new Set([...providerUrls, ...scraped.flat()])];
}

export function getScrapeReferer(channelId: string): string | undefined {
  const broadcaster = BROADCASTER_PAGES[channelId];
  return getProviderReferer(channelId) ?? broadcaster?.referer;
}

export function getScrapeOrigin(channelId: string): string | undefined {
  const broadcaster = BROADCASTER_PAGES[channelId];
  return getProviderOrigin(channelId) ?? broadcaster?.origin;
}

export { PEOTV_CHANNEL_IDS };
