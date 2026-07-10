import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import axios from "axios";
import TorrentSearchApi from "torrent-search-api";
import helmet from "helmet";
import {
  addCorsHeaders,
  getEmbedProxyErrorStatus,
  isAllowedEmbedUrl,
  proxyEmbedUrl,
  stripFrameBlockingHeaders,
} from "./embed-proxy";
import { cacheGetJson, cacheIncr, cacheSetJson, redisKey } from "./redis";

dotenv.config();

type TorrentRecord = {
  name: string;
  seeders: number;
  leechers: number;
  size?: string;
  uploaded?: string;
  magnet?: string;
  link?: string;
  _providers: string[];
  _providerHint?: string;
  _score?: number;
  _indexedAt?: number;
};

type IndexedTorrent = TorrentRecord & {
  _indexedAt: number;
};

type SearchMeta = {
  providersUsed: string[];
  providersFailed: string[];
  degraded: boolean;
};

type SearchPayload = {
  results: TorrentRecord[];
  meta: SearchMeta;
};

type ProviderResult = {
  provider: string;
  items: TorrentRecord[];
};

type TelemetryClient = {
  firstSeen?: string;
  version?: string;
  platform?: string;
  lastSeen?: string;
};

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
  })
);

const allowedOrigins = ["http://127.0.0.1:3000", "http://localhost:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "50kb" }));

const SEARCH_CACHE_TTL_SECONDS = 60;
const MAX_QUERY_LENGTH = 120;
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_ATTEMPTS = 1;
const RATE_LIMIT_WINDOW_SECONDS = 60;
const RATE_LIMIT_MAX_REQUESTS = 60;
const LOCAL_INDEX_MAX_ENTRIES = 2500;
const BACKGROUND_REFRESH_MS = 10 * 60 * 1000;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || "";

const inFlightSearches = new Map<string, Promise<SearchPayload>>();
const localIndex = new Map<string, IndexedTorrent>();
const analytics = {
  searched: new Map<string, number>(),
  streamed: new Map<string, number>(),
  downloaded: new Map<string, number>(),
};

const TORRENT_SEARCH_PROVIDERS = ["1337x", "ThePirateBay", "Yts", "TorrentProject", "Torrentz2"];
for (const provider of TORRENT_SEARCH_PROVIDERS) {
  try {
    TorrentSearchApi.enableProvider(provider);
  } catch {
    // Some providers may be unavailable in current package/runtime.
  }
}

async function rateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  const key = redisKey("ratelimit", "server:api", ip);
  const count = await cacheIncr(key, RATE_LIMIT_WINDOW_SECONDS);

  if (count > RATE_LIMIT_MAX_REQUESTS) {
    res.status(429).json({
      error: "Too many requests. Please try again shortly.",
    });
    return;
  }

  next();
}

function sanitizeQuery(query: unknown): string {
  if (typeof query !== "string") return "";
  return query.replace(/\s+/g, " ").trim();
}

function parsePositiveInt(value: unknown, fallbackValue: number, maxValue: number): number {
  const parsed = Number.parseInt(String(value ?? fallbackValue), 10);
  if (Number.isNaN(parsed) || parsed < 1) return fallbackValue;
  return Math.min(parsed, maxValue);
}

function getCacheKey(query: string, limit: number): string {
  return `${query.toLowerCase()}::${limit}`;
}

function getSearchCacheKey(query: string, limit: number): string {
  return redisKey("search", getCacheKey(query, limit));
}

async function getCachedResults(key: string): Promise<SearchPayload | null> {
  return cacheGetJson<SearchPayload>(key);
}

async function setCachedResults(key: string, value: SearchPayload): Promise<void> {
  await cacheSetJson(key, value, SEARCH_CACHE_TTL_SECONDS);
}

function incrementAnalytics(map: Map<string, number>, key: string): void {
  if (!key) return;
  const normalized = key.toLowerCase();
  map.set(normalized, (map.get(normalized) || 0) + 1);
}

function getTopAnalytics(map: Map<string, number>, limit = 10): Array<{ query: string; count: number }> {
  return [...map.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

async function fetch1337xList(query: string, limit: number): Promise<TorrentRecord[]> {
  const response = await axios.get<{ torrents?: TorrentRecord[] }>("https://api.1337x.to/v2/list", {
    params: { q: query },
    timeout: REQUEST_TIMEOUT_MS,
  });

  const torrents = Array.isArray(response.data?.torrents) ? response.data.torrents : [];
  return torrents.slice(0, limit);
}

function normalizeTorrentShape(torrent: Partial<TorrentRecord>, providerName: string): TorrentRecord | null {
  const name = sanitizeQuery(torrent?.name || "");
  if (!name) return null;
  return {
    ...torrent,
    name,
    seeders: Number(torrent?.seeders || 0),
    leechers: Number(torrent?.leechers || 0),
    _providers: Array.isArray(torrent?._providers)
      ? [...new Set([...torrent._providers, providerName])]
      : [providerName],
  };
}

async function runSearchWithRetry<T>(
  query: string,
  limit: number,
  providerFetcher: (q: string, l: number) => Promise<T>
): Promise<T> {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= RETRY_ATTEMPTS) {
    try {
      return await providerFetcher(query, limit);
    } catch (error) {
      lastError = error;
      attempt += 1;
      if (attempt > RETRY_ATTEMPTS) break;
    }
  }

  throw lastError;
}

function mergeAndRankResults(query: string, providerResults: ProviderResult[], limit: number): TorrentRecord[] {
  const map = new Map<string, TorrentRecord>();
  const normalizedQuery = query.toLowerCase();

  for (const { provider, items } of providerResults) {
    for (const item of items) {
      const normalized = normalizeTorrentShape(item, provider);
      if (!normalized) continue;
      const key = normalizeTorrentKey(normalized);
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, normalized);
      } else {
        const existing = map.get(key)!;
        existing._providers = [...new Set([...existing._providers, ...normalized._providers])];
        if ((normalized.seeders || 0) > (existing.seeders || 0)) {
          map.set(key, { ...existing, ...normalized, _providers: existing._providers });
        }
      }
    }
  }

  const scored = [...map.values()].map((item) => {
    const lowerName = item.name.toLowerCase();
    let score = (Number(item.seeders) || 0) * 2 - (Number(item.leechers) || 0);
    if (lowerName.includes(normalizedQuery)) score += 50;
    if (lowerName.startsWith(normalizedQuery)) score += 30;
    if (item._providers.length > 1) score += 10;
    return { ...item, _score: score };
  });

  return scored.sort((a, b) => (b._score || 0) - (a._score || 0)).slice(0, limit);
}

function normalizeTorrentKey(torrent: Partial<TorrentRecord>): string {
  const magnet = sanitizeQuery(torrent?.magnet || "").toLowerCase();
  const name = sanitizeQuery(torrent?.name || "").toLowerCase();
  if (magnet) return `magnet::${magnet}`;
  if (name) return `name::${name}`;
  return "";
}

function storeInLocalIndex(torrents: TorrentRecord[]): void {
  for (const torrent of torrents) {
    const key = normalizeTorrentKey(torrent);
    if (!key) continue;
    localIndex.set(key, {
      ...torrent,
      _indexedAt: Date.now(),
    });
  }

  if (localIndex.size > LOCAL_INDEX_MAX_ENTRIES) {
    const sortedByAge = [...localIndex.entries()].sort((a, b) => (a[1]._indexedAt || 0) - (b[1]._indexedAt || 0));
    const toDelete = sortedByAge.slice(0, localIndex.size - LOCAL_INDEX_MAX_ENTRIES);
    for (const [key] of toDelete) {
      localIndex.delete(key);
    }
  }
}

async function provider1337x(query: string, limit: number): Promise<TorrentRecord[]> {
  return runSearchWithRetry(query, limit, fetch1337xList);
}

async function providerLocalIndex(query: string, limit: number): Promise<TorrentRecord[]> {
  const normalized = query.toLowerCase();
  const hits: TorrentRecord[] = [];

  for (const entry of localIndex.values()) {
    if ((entry.name || "").toLowerCase().includes(normalized)) {
      hits.push(entry);
    }
    if (hits.length >= limit) break;
  }
  return hits;
}

function mapTorrentSearchApiItem(item: {
  title?: string;
  name?: string;
  seeds?: number;
  seeders?: number;
  peers?: number;
  leechers?: number;
  size?: string;
  time?: string;
  uploaded?: string;
  magnet?: string;
  link?: string;
}): TorrentRecord {
  return {
    name: sanitizeQuery(item?.title || item?.name || ""),
    seeders: Number(item?.seeds || item?.seeders || 0),
    leechers: Number(item?.peers || item?.leechers || 0),
    size: item?.size || "",
    uploaded: item?.time || item?.uploaded || "",
    magnet: item?.magnet || "",
    link: item?.link || "",
    _providers: [],
    _providerHint: "provider_torrent_search_api",
  };
}

async function providerTorrentSearchApi(query: string, limit: number): Promise<TorrentRecord[]> {
  const items = await TorrentSearchApi.search(query, "All", limit);
  const normalized = Array.isArray(items) ? items.map(mapTorrentSearchApiItem).filter((item) => item.name) : [];
  return normalized.slice(0, limit);
}

async function fetchProviderResults(
  query: string,
  limit: number
): Promise<{ successes: ProviderResult[]; failedProviders: string[] }> {
  const providers = [
    { name: "provider_1337x", fetcher: provider1337x },
    { name: "provider_torrent_search_api", fetcher: providerTorrentSearchApi },
    { name: "local_index", fetcher: providerLocalIndex },
  ];

  const settled = await Promise.allSettled(
    providers.map(async (provider) => ({
      provider: provider.name,
      items: await provider.fetcher(query, limit),
    }))
  );

  const successes = settled
    .filter((item): item is PromiseFulfilledResult<ProviderResult> => item.status === "fulfilled")
    .map((item) => item.value);

  const failedProviders = settled
    .map((item, index) => ({ item, provider: providers[index].name }))
    .filter(({ item }) => item.status === "rejected")
    .map(({ provider }) => provider);

  return { successes, failedProviders };
}

async function getSearchResults(query: string, limit = 60): Promise<SearchPayload> {
  const cacheKey = getSearchCacheKey(query, limit);
  const cached = await getCachedResults(cacheKey);
  if (cached) {
    return cached;
  }

  if (inFlightSearches.has(cacheKey)) {
    return inFlightSearches.get(cacheKey)!;
  }

  const searchPromise = fetchProviderResults(query, limit)
    .then(async ({ successes, failedProviders }) => {
      const nonEmptySuccesses = successes.filter((entry) => Array.isArray(entry.items) && entry.items.length > 0);
      const selectedSources = nonEmptySuccesses.length ? nonEmptySuccesses : successes;
      if (!selectedSources.length) {
        return {
          results: [],
          meta: {
            providersUsed: [],
            providersFailed: failedProviders,
            degraded: true,
          },
        };
      }
      const merged = mergeAndRankResults(query, selectedSources, limit);
      storeInLocalIndex(merged);
      const results: SearchPayload = {
        results: merged,
        meta: {
          providersUsed: selectedSources.map((item) => item.provider),
          providersFailed: failedProviders,
          degraded: failedProviders.length > 0,
        },
      };
      await setCachedResults(cacheKey, results);
      return results;
    })
    .finally(() => {
      inFlightSearches.delete(cacheKey);
    });

  inFlightSearches.set(cacheKey, searchPromise);
  return searchPromise;
}

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

app.options("/api/embed/proxy", (_req, res) => {
  res.set(addCorsHeaders({ "Access-Control-Max-Age": "86400" }));
  res.status(204).end();
});

app.get("/api/embed/proxy", rateLimit, async (req, res) => {
  const targetUrl = sanitizeQuery(req.query.url);
  if (!targetUrl) {
    res.status(400).json({ error: "Missing 'url' query parameter." });
    return;
  }

  if (!isAllowedEmbedUrl(targetUrl)) {
    res.status(400).json({ error: "Embed URL host is not allowed." });
    return;
  }

  try {
    const proxied = await proxyEmbedUrl(targetUrl);
    const outgoing = stripFrameBlockingHeaders({
      "Content-Type": proxied.contentType,
      "Cache-Control": proxied.fromCache ? "public, max-age=300" : "public, max-age=120",
      "X-Embed-Proxy-Cache": proxied.fromCache ? "HIT" : "MISS",
    });

    res.set(addCorsHeaders(outgoing));
    if (Buffer.isBuffer(proxied.body)) {
      res.send(proxied.body);
      return;
    }
    res.send(proxied.body);
  } catch (error) {
    const statusCode = getEmbedProxyErrorStatus(error);
    const message = error instanceof Error ? error.message : "Unknown embed proxy error";
    console.error("Embed proxy error:", message);
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502).json({
      error: "Unable to load embed content right now. Try another provider.",
    });
  }
});

app.use("/api", rateLimit);

app.get("/api/search", async (req, res) => {
  const query = sanitizeQuery(req.query.q);
  const limit = parsePositiveInt(req.query.limit, 60, 120);

  if (!query || query.length < 2) {
    res.status(400).json({
      error: "Query parameter 'q' must be at least 2 characters.",
    });
    return;
  }

  if (query.length > MAX_QUERY_LENGTH) {
    res.status(400).json({
      error: `Query is too long. Maximum ${MAX_QUERY_LENGTH} characters.`,
    });
    return;
  }

  try {
    incrementAnalytics(analytics.searched, query);
    const searchPayload = await getSearchResults(query, limit);

    res.json(searchPayload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown search error";
    console.error("Search endpoint error:", message);
    res.status(502).json({
      error: "Search provider unavailable. Please try again.",
    });
  }
});

app.get("/api/search/suggest", async (req, res) => {
  const query = sanitizeQuery(req.query.q);

  if (!query || query.length < 2) {
    res.json([]);
    return;
  }

  try {
    const payload = await getSearchResults(query, 20);
    const results = payload.results || [];
    const suggestions: string[] = [];
    const seen = new Set<string>();

    for (const torrent of results) {
      const name = sanitizeQuery(torrent?.name);
      if (!name) continue;
      const normalized = name.toLowerCase();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      suggestions.push(name);
      if (suggestions.length >= 6) break;
    }

    res.json(suggestions);
  } catch {
    res.json([]);
  }
});

app.get("/api/search/trending", (_req, res) => {
  res.json(getTopAnalytics(analytics.searched, 10));
});

app.get("/api/search/providers", (_req, res) => {
  res.json({
    activeProviders: ["provider_1337x", "provider_torrent_search_api", "local_index"],
    localIndexSize: localIndex.size,
  });
});

app.get("/api/analytics/summary", (_req, res) => {
  res.json({
    mostSearched: getTopAnalytics(analytics.searched, 10),
    mostStreamed: getTopAnalytics(analytics.streamed, 10),
    mostDownloaded: getTopAnalytics(analytics.downloaded, 10),
  });
});

app.post("/api/analytics/stream", (req, res) => {
  const query = sanitizeQuery(req.body?.query);
  incrementAnalytics(analytics.streamed, query);
  res.json({ ok: true });
});

app.post("/api/analytics/download", (req, res) => {
  const query = sanitizeQuery(req.body?.query);
  incrementAnalytics(analytics.downloaded, query);
  res.json({ ok: true });
});

app.post("/api/search/resolve-magnet", async (req, res) => {
  const name = sanitizeQuery(req.body?.name);
  const providerHint = sanitizeQuery(req.body?.providerHint);
  const existingMagnet = sanitizeQuery(req.body?.magnet);

  if (existingMagnet) {
    res.json({ magnet: existingMagnet });
    return;
  }

  if (!name || name.length < 2) {
    res.status(400).json({ error: "Valid 'name' is required." });
    return;
  }

  try {
    if (providerHint === "provider_torrent_search_api" || !providerHint) {
      const candidates = await TorrentSearchApi.search(name, "All", 8);
      for (const candidate of candidates) {
        try {
          const resolvedMagnet = await TorrentSearchApi.getMagnet(candidate);
          const normalized = sanitizeQuery(resolvedMagnet);
          if (normalized.startsWith("magnet:?")) {
            res.json({ magnet: normalized });
            return;
          }
        } catch {
          // Try next candidate.
        }
      }
    }

    res.status(404).json({ error: "Magnet not found for this upload." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown resolve error";
    console.error("Resolve magnet error:", message);
    res.status(502).json({ error: "Unable to resolve magnet currently." });
  }
});

app.get("/api/security/virustotal/report", async (req, res) => {
  const hash = sanitizeQuery(req.query.hash).toLowerCase();
  if (!hash || hash.length < 20) {
    res.status(400).json({ error: "Valid torrent hash is required." });
    return;
  }

  if (!VIRUSTOTAL_API_KEY) {
    res.status(503).json({
      error: "VirusTotal is not configured.",
      configured: false,
    });
    return;
  }

  try {
    const response = await axios.get(`https://www.virustotal.com/api/v3/files/${encodeURIComponent(hash)}`, {
      headers: {
        "x-apikey": VIRUSTOTAL_API_KEY,
      },
      timeout: REQUEST_TIMEOUT_MS,
    });

    const stats = response.data?.data?.attributes?.last_analysis_stats || {};
    const malicious = Number(stats.malicious || 0);
    const suspicious = Number(stats.suspicious || 0);
    const harmless = Number(stats.harmless || 0);
    const undetected = Number(stats.undetected || 0);

    res.json({
      configured: true,
      hash,
      verdict: malicious > 0 || suspicious > 0 ? "risky" : "clean_or_unknown",
      stats: { malicious, suspicious, harmless, undetected },
    });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      res.status(404).json({
        configured: true,
        hash,
        verdict: "unknown",
        error: "No VirusTotal report found for this hash yet.",
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Unknown VirusTotal error";
    console.error("VirusTotal report error:", message);
    res.status(502).json({
      configured: true,
      error: "Could not fetch VirusTotal report right now.",
    });
  }
});

const telemetryFile = path.join(process.env.USER_DATA_PATH || process.cwd(), "telemetry.json");

const telemetryClients = new Map<string, TelemetryClient>();

function loadTelemetry(): void {
  try {
    if (fs.existsSync(telemetryFile)) {
      const data = JSON.parse(fs.readFileSync(telemetryFile, "utf8")) as Record<string, TelemetryClient>;
      for (const [clientId, info] of Object.entries(data)) {
        telemetryClients.set(clientId, info);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown telemetry load error";
    console.error("Failed to load telemetry:", message);
  }
}

function saveTelemetry(): void {
  try {
    const data = Object.fromEntries(telemetryClients);
    fs.writeFileSync(telemetryFile, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown telemetry save error";
    console.error("Failed to save telemetry:", message);
  }
}

loadTelemetry();

app.post("/api/telemetry/ping", (req, res) => {
  const { clientId, version, platform } = req.body as {
    clientId?: string;
    version?: string;
    platform?: string;
  };
  if (!clientId) {
    res.status(400).json({ error: "Missing clientId" });
    return;
  }
  const now = new Date().toISOString();
  const existing = telemetryClients.get(clientId) || { firstSeen: now };

  telemetryClients.set(clientId, {
    ...existing,
    version: version || "unknown",
    platform: platform || "unknown",
    lastSeen: now,
  });

  saveTelemetry();
  res.json({ ok: true });
});

app.post("/api/telemetry/heartbeat", (req, res) => {
  const { clientId } = req.body as { clientId?: string };
  if (!clientId) {
    res.status(400).json({ error: "Missing clientId" });
    return;
  }
  const existing = telemetryClients.get(clientId);
  if (existing) {
    existing.lastSeen = new Date().toISOString();
    telemetryClients.set(clientId, existing);
    saveTelemetry();
  }
  res.json({ ok: true });
});

app.get("/api/telemetry/stats", (req, res) => {
  const adminSecret = process.env.ADMIN_TELEMETRY_KEY || "chithra-telemetry-secret-1029";
  const providedSecret = req.query.secret || req.headers["x-admin-secret"];

  if (providedSecret !== adminSecret) {
    res.status(403).json({ error: "Unauthorized access to telemetry statistics." });
    return;
  }

  const now = Date.now();
  const fiveMinutesAgo = now - 5 * 60 * 1000;
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  let totalClients = 0;
  let onlineNow = 0;
  const versionBreakdown: Record<string, number> = {};
  const platformBreakdown: Record<string, number> = {};

  for (const info of telemetryClients.values()) {
    const lastSeenTime = info.lastSeen ? new Date(info.lastSeen).getTime() : 0;

    if (lastSeenTime >= thirtyDaysAgo) {
      totalClients++;

      const isOnline = lastSeenTime >= fiveMinutesAgo;
      if (isOnline) {
        onlineNow++;
      }

      const version = info.version || "unknown";
      versionBreakdown[version] = (versionBreakdown[version] || 0) + 1;

      const platform = info.platform || "unknown";
      platformBreakdown[platform] = (platformBreakdown[platform] || 0) + 1;
    }
  }

  res.json({
    totalClients,
    onlineNow,
    offlineCount: Math.max(0, totalClients - onlineNow),
    versionBreakdown,
    platformBreakdown,
  });
});

const PORT = Number(process.env.PORT) || 5000;

setInterval(async () => {
  const topQueries = getTopAnalytics(analytics.searched, 5).map((item) => item.query);
  for (const query of topQueries) {
    try {
      await getSearchResults(query, 40);
    } catch {
      // Ignore background refresh errors.
    }
  }
}, BACKGROUND_REFRESH_MS);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
