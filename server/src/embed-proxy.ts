import axios, { type AxiosProxyConfig } from "axios";
import { env } from "./config/env";

const EMBED_CACHE_TTL_MS = env.EMBED_CACHE_TTL_MS;
const EMBED_REQUEST_TIMEOUT_MS = env.EMBED_REQUEST_TIMEOUT_MS;
const EMBED_MAX_CACHE_BYTES = env.EMBED_MAX_CACHE_BYTES;
const EMBED_MAX_RETRIES = 3;

export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

export const REFERRERS = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://search.yahoo.com/",
  "https://duckduckgo.com/",
  "https://www.facebook.com/",
];

const ALLOWED_EMBED_HOSTS = new Set([
  "vidfast.pro",
  "www.vidfast.pro",
  "vidsrc.cc",
  "www.vidsrc.cc",
  "vidsrc.pm",
  "www.vidsrc.pm",
  "vidsrc.in",
  "www.vidsrc.in",
  "vidlink.pro",
  "www.vidlink.pro",
  "multiembed.mov",
  "www.multiembed.mov",
  "autoembed.co",
  "www.autoembed.co",
  "2embed.skin",
  "www.2embed.skin",
]);

type EmbedCacheEntry = {
  body: Buffer | string;
  contentType: string;
  headers: Record<string, unknown>;
};

type EmbedFetchResult = EmbedCacheEntry & {
  fromCache: boolean;
};

type HeaderMap = Record<string, string>;

const embedCache = new Map<string, { value: EmbedCacheEntry; expiresAt: number }>();

class EmbedProxyError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function getRandomUserAgent(): string {
  return pickRandom(USER_AGENTS);
}

export function getRandomReferrer(): string {
  return pickRandom(REFERRERS);
}

function parseProxyList(): string[] {
  const raw = env.EMBED_PROXY_LIST || "";
  return raw
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getRandomProxy(): string | null {
  const proxies = parseProxyList();
  if (!proxies.length) return null;
  return pickRandom(proxies);
}

function buildAxiosProxyConfig(proxyUrl: string | null): AxiosProxyConfig | undefined {
  if (!proxyUrl) return undefined;
  try {
    const parsed = new URL(proxyUrl);
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || (parsed.protocol === "https:" ? 443 : 80),
      protocol: parsed.protocol.replace(":", ""),
    };
  } catch {
    return undefined;
  }
}

export function isAllowedEmbedUrl(urlString: string): boolean {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return ALLOWED_EMBED_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function isCloudflareChallenge(data: unknown, headers: Record<string, unknown> = {}): boolean {
  const body = typeof data === "string" ? data : "";
  const server = String(headers.server || headers.Server || "").toLowerCase();
  return (
    Boolean(headers["cf-ray"] || headers["CF-RAY"]) ||
    server.includes("cloudflare") ||
    body.includes("cf-browser-verification") ||
    body.includes("challenge-platform") ||
    body.includes("Just a moment")
  );
}

function getCachedEmbed(key: string): EmbedCacheEntry | null {
  const cached = embedCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    embedCache.delete(key);
    return null;
  }
  return cached.value;
}

function setCachedEmbed(key: string, value: EmbedCacheEntry): void {
  embedCache.set(key, {
    value,
    expiresAt: Date.now() + EMBED_CACHE_TTL_MS,
  });
}

export function stripFrameBlockingHeaders(headers: HeaderMap = {}): HeaderMap {
  const next = { ...headers };
  delete next["x-frame-options"];
  delete next["X-Frame-Options"];
  delete next["content-security-policy"];
  delete next["Content-Security-Policy"];
  delete next["content-security-policy-report-only"];
  delete next["Content-Security-Policy-Report-Only"];
  return next;
}

export function addCorsHeaders(headers: HeaderMap = {}): HeaderMap {
  return {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function prepareHtmlBody(html: string, targetUrl: string): string {
  const parsed = new URL(targetUrl);
  let out = html;
  out = out.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");
  if (!/<base\s/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${parsed.origin}/">`);
  }
  return out;
}

function shouldCacheResponse(contentType: string, byteLength: number): boolean {
  if (byteLength > EMBED_MAX_CACHE_BYTES) return false;
  const type = contentType.toLowerCase();
  return (
    type.includes("text/html") ||
    type.includes("application/javascript") ||
    type.includes("text/javascript") ||
    type.includes("text/css") ||
    type.includes("application/json")
  );
}

async function fetchEmbedResource(url: string, attempt = 0): Promise<EmbedFetchResult> {
  const userAgent = getRandomUserAgent();
  const referrer = getRandomReferrer();
  const proxyUrl = getRandomProxy();

  const response = await axios.get<ArrayBuffer>(url, {
    timeout: EMBED_REQUEST_TIMEOUT_MS,
    maxRedirects: 5,
    responseType: "arraybuffer",
    validateStatus: (status) => status >= 200 && status < 400,
    proxy: buildAxiosProxyConfig(proxyUrl),
    headers: {
      "User-Agent": userAgent,
      Referer: referrer,
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "en-US,en;q=0.9",
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      "Sec-Fetch-Dest": "iframe",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-Site": "cross-site",
      "Upgrade-Insecure-Requests": "1",
    },
  });

  const contentType = String(response.headers["content-type"] || "application/octet-stream");
  const buffer = Buffer.from(response.data);
  const isHtml = contentType.includes("text/html");

  if (isHtml) {
    const html = buffer.toString("utf8");
    if (isCloudflareChallenge(html, response.headers) && attempt < EMBED_MAX_RETRIES - 1) {
      return fetchEmbedResource(url, attempt + 1);
    }
    return {
      body: prepareHtmlBody(html, url),
      contentType,
      headers: response.headers as Record<string, unknown>,
      fromCache: false,
    };
  }

  if (response.status === 403 && attempt < EMBED_MAX_RETRIES - 1) {
    return fetchEmbedResource(url, attempt + 1);
  }

  return {
    body: buffer,
    contentType,
    headers: response.headers as Record<string, unknown>,
    fromCache: false,
  };
}

export async function proxyEmbedUrl(url: string): Promise<EmbedFetchResult> {
  if (!isAllowedEmbedUrl(url)) {
    throw new EmbedProxyError("Embed URL host is not allowed.", 400);
  }

  const cached = getCachedEmbed(url);
  if (cached) {
    return { ...cached, fromCache: true };
  }

  const fetched = await fetchEmbedResource(url);
  const byteLength = Buffer.isBuffer(fetched.body)
    ? fetched.body.length
    : Buffer.byteLength(String(fetched.body), "utf8");

  if (shouldCacheResponse(fetched.contentType, byteLength)) {
    setCachedEmbed(url, {
      body: fetched.body,
      contentType: fetched.contentType,
      headers: fetched.headers,
    });
  }

  return fetched;
}

export function getEmbedProxyErrorStatus(error: unknown, fallback = 502): number {
  if (error instanceof EmbedProxyError) return error.statusCode;
  if (axios.isAxiosError(error) && error.response?.status) return error.response.status;
  return fallback;
}
