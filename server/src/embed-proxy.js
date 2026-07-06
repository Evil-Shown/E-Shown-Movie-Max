const axios = require("axios");

const EMBED_CACHE_TTL_MS = Number(process.env.EMBED_CACHE_TTL_MS) || 60 * 60 * 1000;
const EMBED_REQUEST_TIMEOUT_MS = Number(process.env.EMBED_REQUEST_TIMEOUT_MS) || 15000;
const EMBED_MAX_CACHE_BYTES = Number(process.env.EMBED_MAX_CACHE_BYTES) || 5 * 1024 * 1024;
const EMBED_MAX_RETRIES = 3;

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
];

const REFERRERS = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://search.yahoo.com/",
  "https://duckduckgo.com/",
  "https://www.facebook.com/",
];

const ALLOWED_EMBED_HOSTS = new Set([
  "vsembed.ru",
  "www.vsembed.ru",
  "vidsrc.me",
  "www.vidsrc.me",
  "vidsrc.to",
  "www.vidsrc.to",
  "vidlink.pro",
  "www.vidlink.pro",
  "multiembed.mov",
  "www.multiembed.mov",
  "embed.su",
  "www.embed.su",
  "2embed.skin",
  "www.2embed.skin",
]);

const embedCache = new Map();

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomUserAgent() {
  return pickRandom(USER_AGENTS);
}

function getRandomReferrer() {
  return pickRandom(REFERRERS);
}

function parseProxyList() {
  const raw = process.env.EMBED_PROXY_LIST || "";
  return raw
    .split(/[,\s]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getRandomProxy() {
  const proxies = parseProxyList();
  if (!proxies.length) return null;
  return pickRandom(proxies);
}

function buildAxiosProxyConfig(proxyUrl) {
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

function isAllowedEmbedUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    return ALLOWED_EMBED_HOSTS.has(parsed.hostname.toLowerCase());
  } catch {
    return false;
  }
}

function isCloudflareChallenge(data, headers = {}) {
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

function getCachedEmbed(key) {
  const cached = embedCache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    embedCache.delete(key);
    return null;
  }
  return cached.value;
}

function setCachedEmbed(key, value) {
  embedCache.set(key, {
    value,
    expiresAt: Date.now() + EMBED_CACHE_TTL_MS,
  });
}

function stripFrameBlockingHeaders(headers = {}) {
  const next = { ...headers };
  delete next["x-frame-options"];
  delete next["X-Frame-Options"];
  delete next["content-security-policy"];
  delete next["Content-Security-Policy"];
  delete next["content-security-policy-report-only"];
  delete next["Content-Security-Policy-Report-Only"];
  return next;
}

function addCorsHeaders(headers = {}) {
  return {
    ...headers,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
  };
}

function prepareHtmlBody(html, targetUrl) {
  if (typeof html !== "string") return html;
  const parsed = new URL(targetUrl);
  let out = html;
  out = out.replace(/<meta[^>]+http-equiv=["']content-security-policy["'][^>]*>/gi, "");
  if (!/<base\s/i.test(out)) {
    out = out.replace(/<head([^>]*)>/i, `<head$1><base href="${parsed.origin}/">`);
  }
  return out;
}

function shouldCacheResponse(contentType, byteLength) {
  if (byteLength > EMBED_MAX_CACHE_BYTES) return false;
  const type = String(contentType || "").toLowerCase();
  return (
    type.includes("text/html") ||
    type.includes("application/javascript") ||
    type.includes("text/javascript") ||
    type.includes("text/css") ||
    type.includes("application/json")
  );
}

async function fetchEmbedResource(url, attempt = 0) {
  const userAgent = getRandomUserAgent();
  const referrer = getRandomReferrer();
  const proxyUrl = getRandomProxy();

  const response = await axios.get(url, {
    timeout: EMBED_REQUEST_TIMEOUT_MS,
    maxRedirects: 5,
    responseType: "arraybuffer",
    validateStatus: (status) => status >= 200 && status < 400,
    proxy: buildAxiosProxyConfig(proxyUrl),
    headers: {
      "User-Agent": userAgent,
      Referer: referrer,
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
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
      headers: response.headers,
      fromCache: false,
    };
  }

  if (response.status === 403 && attempt < EMBED_MAX_RETRIES - 1) {
    return fetchEmbedResource(url, attempt + 1);
  }

  return {
    body: buffer,
    contentType,
    headers: response.headers,
    fromCache: false,
  };
}

async function proxyEmbedUrl(url) {
  if (!isAllowedEmbedUrl(url)) {
    const error = new Error("Embed URL host is not allowed.");
    error.statusCode = 400;
    throw error;
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

module.exports = {
  USER_AGENTS,
  REFERRERS,
  getRandomUserAgent,
  getRandomReferrer,
  isAllowedEmbedUrl,
  proxyEmbedUrl,
  stripFrameBlockingHeaders,
  addCorsHeaders,
};
