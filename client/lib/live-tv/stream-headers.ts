/** Rotating browser fingerprints — reduces bot-detection on provider pages */

export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_6) AppleWebKit/603.3.8 (KHTML, like Gecko) Version/10.1.2 Safari/603.3.8",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (Windows NT 6.1; WOW64; rv:54.0) Gecko/20100101 Firefox/54.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

/** Decoy referrers used on scrape retries when STREAM_HEADER_ROTATION=1 */
export const DECOY_REFERRERS = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://www.yahoo.com/",
  "https://duckduckgo.com/",
];

export const PROVIDER_REFERRERS = [
  "https://www.dialogtv.lk/",
  "https://www.dialog.lk/",
  "https://webapp.peotv.com/",
  "https://www.peotv.com/",
  "https://peotv.com/",
];

export function pickRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function pickUserAgentForAttempt(attempt: number): string {
  if (process.env.STREAM_HEADER_ROTATION === "1") {
    return pickRandomUserAgent();
  }
  return USER_AGENTS[attempt % USER_AGENTS.length];
}

export function pickRandomDecoyReferrer(): string {
  return DECOY_REFERRERS[Math.floor(Math.random() * DECOY_REFERRERS.length)];
}

/** Rotate referer on retries — keeps provider referer on first attempt for manifest/API */
export function pickRotatedReferer(
  attempt: number,
  primaryReferer?: string,
  allowDecoy = false
): string | undefined {
  if (!primaryReferer) return undefined;
  if (attempt === 0 || process.env.STREAM_HEADER_ROTATION !== "1" || !allowDecoy) {
    return primaryReferer;
  }

  const pool = [primaryReferer, ...PROVIDER_REFERRERS, ...DECOY_REFERRERS];
  return pool[attempt % pool.length];
}

export function refererToOrigin(referer: string): string {
  try {
    return new URL(referer).origin;
  } catch {
    return referer;
  }
}

export function buildRotatedBrowserHeaders(options: {
  referer?: string;
  origin?: string;
  attempt?: number;
  allowDecoyReferer?: boolean;
}): Record<string, string> {
  const attempt = options.attempt ?? 0;
  const referer = pickRotatedReferer(
    attempt,
    options.referer,
    options.allowDecoyReferer
  );

  const headers: Record<string, string> = {
    "User-Agent": pickUserAgentForAttempt(attempt),
    "Accept-Language": "en-US,en;q=0.9",
  };

  if (referer) {
    headers.Referer = referer;
    headers.Origin = options.origin ?? refererToOrigin(referer);
  }

  const cookies = process.env.STREAM_UPSTREAM_COOKIES;
  if (cookies) headers.Cookie = cookies;

  const xff = process.env.STREAM_UPSTREAM_X_FORWARDED_FOR;
  if (xff) {
    headers["X-Forwarded-For"] = xff;
    headers["X-Real-IP"] = xff.split(",")[0]?.trim() ?? xff;
  }

  const extra = process.env.STREAM_UPSTREAM_EXTRA_HEADERS;
  if (extra) {
    try {
      Object.assign(headers, JSON.parse(extra) as Record<string, string>);
    } catch {
      // ignore invalid JSON
    }
  }

  return headers;
}

export function isHeaderRotationEnabled(): boolean {
  return process.env.STREAM_HEADER_ROTATION === "1";
}
