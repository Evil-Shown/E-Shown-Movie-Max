const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
];

export type StreamFetchMode = "document" | "manifest" | "api";

export interface StreamFetchOptions {
  referer?: string;
  origin?: string;
  retries?: number;
  mode?: StreamFetchMode;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isCloudflareChallenge(body: string, status: number): boolean {
  if (status === 403 || status === 503) {
    return (
      body.includes("cf-browser-verification") ||
      body.includes("Just a moment") ||
      body.includes("challenge-platform")
    );
  }
  return false;
}

function buildHeaders(options: StreamFetchOptions, attempt: number): HeadersInit {
  const ua = USER_AGENTS[attempt % USER_AGENTS.length];
  const mode = options.mode ?? "manifest";
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
  } else {
    headers.Accept = "*/*";
    headers["Sec-Fetch-Dest"] = "empty";
    headers["Sec-Fetch-Mode"] = "cors";
    headers["Sec-Fetch-Site"] = options.referer ? "cross-site" : "none";
  }

  if (options.referer) {
    headers.Referer = options.referer;
    try {
      headers.Origin = options.origin ?? new URL(options.referer).origin;
    } catch {
      // ignore invalid referer
    }
  }

  const cookies = process.env.STREAM_UPSTREAM_COOKIES;
  if (cookies) {
    headers.Cookie = cookies;
  }

  return headers;
}

/** Fetch upstream stream/manifest with retry + browser-like headers.
 * Optional server env:
 * - STREAM_UPSTREAM_COOKIES — cf_clearance / session cookies for protected origins
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
