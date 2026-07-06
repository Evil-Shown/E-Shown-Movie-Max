import { fetchStreamResource } from "@/lib/live-tv/stream-fetch";
import {
  buildDialogTvChannelPages,
  buildPeotvChannelPages,
  buildPeotvApiUrls,
  buildPeotvStreamUrls,
  DIALOG_SCRAPE_PAGES,
  getProviderOrigin,
  getProviderReferer,
  PEOTV_API_ENDPOINTS,
  PEOTV_CHANNEL_IDS,
  PEOTV_ORIGIN,
  PEOTV_REFERER,
  PEOTV_SCRAPE_PAGES,
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
  "talent-tv": { pageUrl: "https://talenttv.lk/", referer: "https://talenttv.lk/" },
  "jaya-tv": { pageUrl: "https://jayatv.lk/", referer: "https://jayatv.lk/" },
  "ada-derana-24": { pageUrl: "https://www.adaderana.lk/", referer: "https://www.adaderana.lk/" },
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

function collectStreamsFromJson(value: unknown, found: Set<string>): void {
  if (!value) return;
  if (typeof value === "string") {
    if (value.includes(".m3u8") && value.startsWith("http")) found.add(value);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStreamsFromJson(item, found);
    return;
  }
  if (typeof value === "object") {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      if (
        typeof nested === "string" &&
        nested.startsWith("http") &&
        (key.toLowerCase().includes("m3u8") ||
          key.toLowerCase().includes("hls") ||
          key.toLowerCase().includes("stream") ||
          nested.includes(".m3u8"))
      ) {
        found.add(nested);
      }
      collectStreamsFromJson(nested, found);
    }
  }
}

/** Fetch page and reverse-engineer stream URLs from embedded scripts */
export async function scrapePage(target: ScrapeTarget): Promise<string[]> {
  try {
    const response = await fetchStreamResource(target.pageUrl, {
      referer: target.referer ?? target.pageUrl,
      origin: target.origin,
      retries: 2,
      mode: "document",
      rotateReferer: true,
    });

    if (!response.ok) return [];

    const html = await response.text();
    return extractStreamUrlsFromContent(html);
  } catch {
    return [];
  }
}

/** Probe PEOTV JSON APIs for channel manifest URLs */
export async function scrapePeotvApis(channelId: string): Promise<string[]> {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  const endpoints = [
    ...PEOTV_API_ENDPOINTS,
    ...buildPeotvApiUrls(channelId),
  ];

  const found = new Set<string>();

  await Promise.all(
    endpoints.map(async (apiUrl) => {
      try {
        const response = await fetchStreamResource(apiUrl, {
          referer: PEOTV_REFERER,
          origin: PEOTV_ORIGIN,
          retries: 1,
          mode: "api",
        });
        if (!response.ok) return;
        const body = await response.text();

        for (const url of extractStreamUrlsFromContent(body)) {
          found.add(url);
        }

        try {
          const json = JSON.parse(body) as unknown;
          collectStreamsFromJson(json, found);
        } catch {
          // not JSON
        }
      } catch {
        // API may be geo-blocked or require auth
      }
    })
  );

  return [...found];
}

async function scrapeWithBrowserIfEnabled(targets: ScrapeTarget[]): Promise<string[]> {
  if (process.env.STREAM_SCRAPER_BROWSER !== "1" || targets.length === 0) return [];
  try {
    const { scrapePagesWithBrowser } = await import("@/lib/live-tv/stream-browser-scraper");
    return scrapePagesWithBrowser(targets);
  } catch {
    return [];
  }
}

/** Known PEOTV / Dialog URL patterns for a channel */
export function getProviderStreamCandidates(channelId: string): string[] {
  return buildPeotvStreamUrls(channelId);
}

/** Pull current cast URL from Talent TV's Angular app bundle */
export async function scrapeTalentTvAppBundle(): Promise<string[]> {
  try {
    const home = await fetchStreamResource("https://talenttv.lk/", {
      referer: "https://talenttv.lk/",
      mode: "document",
      retries: 2,
    });
    if (!home.ok) return [];

    const html = await home.text();
    const mainBundle = html.match(/main-[A-Z0-9]+\.js/)?.[0];
    if (!mainBundle) return [];

    const bundle = await fetchStreamResource(`https://talenttv.lk/${mainBundle}`, {
      referer: "https://talenttv.lk/",
      mode: "manifest",
      retries: 2,
    });
    if (!bundle.ok) return [];

    return extractStreamUrlsFromContent(await bundle.text());
  } catch {
    return [];
  }
}

/** All scrape targets for a channel (broadcaster + provider + per-channel deep links) */
export function getScrapeTargets(channelId: string): ScrapeTarget[] {
  const targets: ScrapeTarget[] = [];
  const seen = new Set<string>();

  const add = (target: ScrapeTarget) => {
    const key = target.pageUrl;
    if (seen.has(key)) return;
    seen.add(key);
    targets.push(target);
  };

  const broadcaster = BROADCASTER_PAGES[channelId];
  if (broadcaster) add(broadcaster);

  for (const page of PROVIDER_SCRAPE_PAGES[channelId] ?? []) add(page);

  if (PEOTV_CHANNEL_IDS[channelId]) {
    for (const page of DIALOG_SCRAPE_PAGES) add(page);
    for (const page of PEOTV_SCRAPE_PAGES) add(page);
    for (const page of buildDialogTvChannelPages(channelId)) add(page);
    for (const page of buildPeotvChannelPages(channelId)) add(page);
  }

  return targets;
}

/** Scrape broadcaster + PEOTV / Dialog provider pages for a channel */
export async function scrapeChannelStreams(channelId: string): Promise<string[]> {
  const providerUrls = getProviderStreamCandidates(channelId);
  const targets = getScrapeTargets(channelId);

  const talentBundle =
    channelId === "talent-tv" ? await scrapeTalentTvAppBundle() : [];

  const [scraped, apiUrls, browserUrls] = await Promise.all([
    Promise.all(targets.map((t) => scrapePage(t))),
    scrapePeotvApis(channelId),
    scrapeWithBrowserIfEnabled(targets),
  ]);

  return [
    ...new Set([
      ...providerUrls,
      ...talentBundle,
      ...apiUrls,
      ...browserUrls,
      ...scraped.flat(),
    ]),
  ];
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
