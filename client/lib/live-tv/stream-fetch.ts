import {
  pickRotatedReferer,
  pickUserAgentForAttempt,
  refererToOrigin,
} from "@/lib/live-tv/stream-headers";

export type StreamFetchMode = "document" | "manifest" | "api";

export interface StreamFetchOptions {
  referer?: string;
  origin?: string;
  retries?: number;
  mode?: StreamFetchMode;
  /** Allow decoy referer rotation on retries (document scraping only) */
  rotateReferer?: boolean;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCloudflareChallenge(body: string, status: number): boolean {
  if (status === 403 || status === 503 || status === 429) {
    return (
      body.includes("cf-browser-verification") ||
      body.includes("Just a moment") ||
      body.includes("challenge-platform") ||
      body.includes("cf-challenge") ||
      body.includes("Checking your browser") ||
      body.includes("Attention Required")
    );
  }
  return false;
}

function isGeoBlockPage(body: string, status: number): boolean {
  if (status !== 403) return false;
  return (
    body.includes("Access denied") ||
    body.includes("not available in your region") ||
    body.includes("geo-restrict")
  );
}

function parseExtraHeaders(): Record<string, string> {
  const raw = process.env.STREAM_UPSTREAM_EXTRA_HEADERS;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as Record<string, string>;
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function buildHeaders(options: StreamFetchOptions, attempt: number): HeadersInit {
  const ua = pickUserAgentForAttempt(attempt);
  const mode = options.mode ?? "manifest";
  const allowDecoy = options.rotateReferer ?? mode === "document";
  const referer = pickRotatedReferer(attempt, options.referer, allowDecoy);

  const headers: Record<string, string> = {
    "User-Agent": ua,
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "no-cache",
    Pragma: "no-cache",
  };

  if (mode === "document") {
    headers.Accept =
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8";
    headers["Sec-Fetch-Dest"] = "document";
    headers["Sec-Fetch-Mode"] = "navigate";
    headers["Sec-Fetch-Site"] = options.referer ? "same-origin" : "none";
    headers["Sec-Fetch-User"] = "?1";
    headers["Upgrade-Insecure-Requests"] = "1";
  } else if (mode === "api") {
    headers.Accept = "application/json, text/plain, */*";
    headers["Sec-Fetch-Dest"] = "empty";
    headers["Sec-Fetch-Mode"] = "cors";
    headers["Sec-Fetch-Site"] = options.referer ? "same-origin" : "cross-site";
  } else {
    headers.Accept = "*/*";
    headers["Sec-Fetch-Dest"] = "empty";
    headers["Sec-Fetch-Mode"] = "cors";
    headers["Sec-Fetch-Site"] = options.referer ? "cross-site" : "none";
  }

  if (referer) {
    headers.Referer = referer;
    headers.Origin = options.origin ?? refererToOrigin(referer);
  }

  const cookies = process.env.STREAM_UPSTREAM_COOKIES;
  if (cookies) {
    headers.Cookie = cookies;
  }

  const xff = process.env.STREAM_UPSTREAM_X_FORWARDED_FOR;
  if (xff) {
    headers["X-Forwarded-For"] = xff;
    headers["X-Real-IP"] = xff.split(",")[0]?.trim() ?? xff;
  }

  Object.assign(headers, parseExtraHeaders());

  return headers;
}

/** Fetch upstream stream/manifest with retry + browser-like headers.
 * Optional server env:
 * - STREAM_UPSTREAM_COOKIES — cf_clearance / session cookies for protected origins
 * - STREAM_UPSTREAM_X_FORWARDED_FOR — spoof client IP (Sri Lankan IP when geo-gated)
 * - STREAM_UPSTREAM_EXTRA_HEADERS — JSON object merged into every upstream request
 * - STREAM_HEADER_ROTATION=1 — random UA + decoy referer rotation on scrape retries
 * - HTTP_PROXY / HTTPS_PROXY — route through VPN or proxy (Node native fetch)
 */
export async function fetchStreamResource(
  url: string,
  options: StreamFetchOptions = {}
): Promise<Response> {
  const retries = options.retries ?? 3;
  let lastError: unknown;

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, {
        headers: buildHeaders(options, attempt),
        redirect: "follow",
        signal: AbortSignal.timeout(12_000),
      });

      if (response.ok) return response;

      const body = await response.clone().text().catch(() => "");
      if (isCloudflareChallenge(body, response.status) && attempt < retries - 1) {
        await sleep((attempt + 1) * 1200);
        continue;
      }

      if (isGeoBlockPage(body, response.status) && attempt < retries - 1) {
        await sleep((attempt + 1) * 1000);
        continue;
      }

      if (response.status >= 500 && attempt < retries - 1) {
        await sleep((attempt + 1) * 800);
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt < retries - 1) {
        await sleep((attempt + 1) * 800);
        continue;
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Stream fetch failed after retries");
}

export function inferRefererFromUrl(streamUrl: string): string | undefined {
  try {
    const { protocol, hostname } = new URL(streamUrl);
    if (hostname.includes("akamaized.net") || hostname.includes("cloudfront.net")) {
      return undefined;
    }
    if (hostname.includes("peotv.com")) {
      return "https://webapp.peotv.com/";
    }
    if (hostname.includes("talenttv.lk") || hostname.includes("cast.talenttv.lk")) {
      return "https://talenttv.lk/";
    }
    if (hostname.includes("dialog.lk")) {
      return "https://www.dialog.lk/";
    }
    return `${protocol}//${hostname}/`;
  } catch {
    return undefined;
  }
}
