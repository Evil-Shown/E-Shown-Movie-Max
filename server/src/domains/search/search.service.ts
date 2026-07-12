import axios from "axios";
import TorrentSearchApi from "torrent-search-api";
import { cacheGetJson, cacheSetJson, redisKey } from "../../infrastructure/redis";
import { logger } from "../../config/logger";
import { AppError } from "../../utils/response";
import type { TorrentRecord, IndexedTorrent, SearchMeta, SearchPayload, ProviderResult } from "./search.types";

const SEARCH_CACHE_TTL_SECONDS = 60;
const MAX_QUERY_LENGTH = 120;
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_ATTEMPTS = 1;
const LOCAL_INDEX_MAX_ENTRIES = 2500;

const inFlightSearches = new Map<string, Promise<SearchPayload>>();
const localIndex = new Map<string, IndexedTorrent>();

const TORRENT_SEARCH_PROVIDERS = ["1337x", "ThePirateBay", "Yts", "TorrentProject", "Torrentz2"];
for (const provider of TORRENT_SEARCH_PROVIDERS) {
  try {
    TorrentSearchApi.enableProvider(provider);
  } catch {
    // Some providers may be unavailable in current package/runtime.
  }
}

export function sanitizeQuery(query: unknown): string {
  if (typeof query !== "string") return "";
  return query.replace(/\s+/g, " ").trim();
}

export function parsePositiveInt(value: unknown, fallbackValue: number, maxValue: number): number {
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

export function incrementAnalytics(map: Map<string, number>, key: string): void {
  if (!key) return;
  const normalized = key.toLowerCase();
  map.set(normalized, (map.get(normalized) || 0) + 1);
}

export function getTopAnalytics(map: Map<string, number>, limit = 10): Array<{ query: string; count: number }> {
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

const analytics = {
  searched: new Map<string, number>(),
};

export async function getSearchResults(query: string, limit = 60): Promise<SearchPayload> {
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
      incrementAnalytics(analytics.searched, query);
      return results;
    })
    .finally(() => {
      inFlightSearches.delete(cacheKey);
    });

  inFlightSearches.set(cacheKey, searchPromise);
  return searchPromise;
}

export async function getSuggestions(query: string): Promise<string[]> {
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

  return suggestions;
}

export function getTrending() {
  return getTopAnalytics(analytics.searched, 10);
}

export function getProviders() {
  return {
    activeProviders: ["provider_1337x", "provider_torrent_search_api", "local_index"],
    localIndexSize: localIndex.size,
  };
}

export async function resolveMagnet(name: string, providerHint?: string, existingMagnet?: string): Promise<string> {
  if (existingMagnet) {
    return existingMagnet;
  }

  if (!name || name.length < 2) {
    throw new AppError(400, "INVALID_NAME", "Valid 'name' is required.");
  }

  try {
    if (providerHint === "provider_torrent_search_api" || !providerHint) {
      const candidates = await TorrentSearchApi.search(name, "All", 8);
      for (const candidate of candidates) {
        try {
          const resolvedMagnet = await TorrentSearchApi.getMagnet(candidate);
          const normalized = sanitizeQuery(resolvedMagnet);
          if (normalized.startsWith("magnet:?")) {
            return normalized;
          }
        } catch {
          // Try next candidate.
        }
      }
    }

    throw new AppError(404, "MAGNET_NOT_FOUND", "Magnet not found for this upload.");
  } catch (error) {
    if (error instanceof AppError) throw error;
    logger.error({ error }, "Resolve magnet error");
    throw new AppError(502, "RESOLVE_ERROR", "Unable to resolve magnet currently.");
  }
}
