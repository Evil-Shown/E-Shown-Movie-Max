/** Shared header rotation for probe scripts (mirrors stream-headers.ts) */

export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
];

export const DECOY_REFERRERS = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://www.yahoo.com/",
];

export function pickRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function pickRotatedReferer(primaryReferer, attempt = 0) {
  if (!primaryReferer) return undefined;
  if (process.env.STREAM_HEADER_ROTATION !== "1" || attempt === 0) return primaryReferer;
  const pool = [primaryReferer, ...DECOY_REFERRERS];
  return pool[attempt % pool.length];
}

export function buildProbeHeaders(referer, attempt = 0) {
  const headers = {
    "User-Agent": pickRandomUserAgent(),
    Referer: pickRotatedReferer(referer, attempt) ?? referer,
    Accept: "text/html,application/json,*/*",
    "Accept-Language": "en-US,en;q=0.9",
  };

  const cookies = process.env.STREAM_UPSTREAM_COOKIES;
  if (cookies) headers.Cookie = cookies;

  const xff = process.env.STREAM_UPSTREAM_X_FORWARDED_FOR;
  if (xff) {
    headers["X-Forwarded-For"] = xff;
    headers["X-Real-IP"] = xff.split(",")[0]?.trim() ?? xff;
  }

  return headers;
}

/** PEOTV channel ID map (subset for scripts — full map in stream-providers.ts) */
export const PEOTV_CHANNEL_IDS = {
  "hiru-tv": ["019", "307"],
  "sirasa-tv": ["010", "306"],
  "tv-derana": ["004", "304"],
  "itn": ["003", "303"],
  "swarnavahini": ["006"],
  "rupavahini": ["001", "301"],
  "shakthi-tv": ["011"],
  "vasantham-tv": ["007"],
  "supreme-tv": ["013"],
  "channel-eye": ["119"],
  "siyatha-tv": ["008", "300"],
  "monara-tv": ["104"],
  "star-tamil-tv": ["021"],
  "ada-derana-24": ["014"],
  "jaya-tv": ["094"],
  "shraddha-tv": ["099"],
  "charana-tv": ["005", "305"],
  "the-buddhist": ["096"],
  "tv1": ["012"],
  "art-tv": ["017"],
  "rangiri-tv": ["022"],
  "haritha-tv": ["009"],
  "tv-didula": ["117"],
  "damsathara-tv": ["126"],
  "verbum-tv": ["093"],
};

export function getChannelProbeTargets(channelId) {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  const targets = [];
  const add = (pageUrl, referer, origin) => targets.push({ pageUrl, referer, origin });

  add("https://www.dialogtv.lk/live-tv", "https://www.dialogtv.lk/", "https://www.dialogtv.lk");
  add("https://webapp.peotv.com/", "https://webapp.peotv.com/", "https://webapp.peotv.com");
  add("https://www.peotv.com/live-tv", "https://www.peotv.com/", "https://www.peotv.com");
  add("https://www.dialog.lk/viu-app/livetv", "https://www.dialog.lk/", "https://www.dialog.lk");

  for (const id of ids) {
    const padded = id.padStart(3, "0");
    add(`https://www.dialogtv.lk/live-tv/channel-${padded}`, "https://www.dialogtv.lk/", "https://www.dialogtv.lk");
    add(`https://www.peotv.com/live-tv/channel-${padded}`, "https://www.peotv.com/", "https://www.peotv.com");
    add(`https://live.peotv.com/bpk-tv/${id}/output/index.m3u8`, "https://webapp.peotv.com/", "https://webapp.peotv.com");
    add(`https://webapp.peotv.com/api/channels/${id}`, "https://webapp.peotv.com/", "https://webapp.peotv.com");
  }

  return targets;
}

export const DEFAULT_PROBE_TARGETS = [
  { pageUrl: "https://webapp.peotv.com/", referer: "https://webapp.peotv.com/" },
  { pageUrl: "https://www.dialog.lk/viu-app/livetv", referer: "https://www.dialog.lk/" },
  { pageUrl: "https://dlg.dialog.lk/dialog-television", referer: "https://dlg.dialog.lk/" },
  { pageUrl: "https://www.dialogtv.lk/live-tv", referer: "https://www.dialogtv.lk/" },
  { pageUrl: "https://www.peotv.com/live-tv", referer: "https://www.peotv.com/" },
  {
    pageUrl: "https://live.peotv.com/bpk-tv/019/output/index.m3u8",
    referer: "https://webapp.peotv.com/",
  },
];

const M3U8_RE = /https?:\/\/[^\s"'<>\\]+?\.m3u8[^\s"'<>\\]*/gi;

export function extractM3u8Urls(content) {
  return [...new Set([...content.matchAll(M3U8_RE)].map((m) => m[0]))];
}
