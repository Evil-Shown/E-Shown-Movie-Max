require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const TorrentSearchApi = require("torrent-search-api");

const app = express();

app.use(cors());
app.use(express.json());

const SEARCH_CACHE_TTL_MS = 60 * 1000;
const MAX_QUERY_LENGTH = 120;
const REQUEST_TIMEOUT_MS = 8000;
const RETRY_ATTEMPTS = 1;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 60;
const LOCAL_INDEX_MAX_ENTRIES = 2500;
const BACKGROUND_REFRESH_MS = 10 * 60 * 1000;
const VIRUSTOTAL_API_KEY = process.env.VIRUSTOTAL_API_KEY || "";

const searchCache = new Map();
const inFlightSearches = new Map();
const rateLimitStore = new Map();
const localIndex = new Map();
const analytics = {
    searched: new Map(),
    streamed: new Map(),
    downloaded: new Map()
};

const TORRENT_SEARCH_PROVIDERS = ["1337x", "ThePirateBay", "Yts", "TorrentProject", "Torrentz2"];
for (const provider of TORRENT_SEARCH_PROVIDERS) {
    try {
        TorrentSearchApi.enableProvider(provider);
    } catch {
        // Some providers may be unavailable in current package/runtime.
    }
}

function cleanupRateLimitStore(now) {
    for (const [ip, entry] of rateLimitStore.entries()) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(ip);
        }
    }
}

function rateLimit(req, res, next) {
    const now = Date.now();
    cleanupRateLimitStore(now);
    const ip = req.ip || req.socket?.remoteAddress || "unknown";
    const entry = rateLimitStore.get(ip);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return next();
    }

    if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
        return res.status(429).json({
            error: "Too many requests. Please try again shortly."
        });
    }

    entry.count += 1;
    return next();
}

function sanitizeQuery(query) {
    if (typeof query !== "string") return "";
    return query.replace(/\s+/g, " ").trim();
}

function parsePositiveInt(value, fallbackValue, maxValue) {
    const parsed = Number.parseInt(String(value ?? fallbackValue), 10);
    if (Number.isNaN(parsed) || parsed < 1) return fallbackValue;
    return Math.min(parsed, maxValue);
}

function getCacheKey(query, limit) {
    return `${query.toLowerCase()}::${limit}`;
}

function getCachedResults(key) {
    const cached = searchCache.get(key);
    if (!cached) return null;
    if (Date.now() > cached.expiresAt) {
        searchCache.delete(key);
        return null;
    }
    return cached.value;
}

function setCachedResults(key, value) {
    searchCache.set(key, {
        value,
        expiresAt: Date.now() + SEARCH_CACHE_TTL_MS
    });
}

function incrementAnalytics(map, key) {
    if (!key) return;
    const normalized = key.toLowerCase();
    map.set(normalized, (map.get(normalized) || 0) + 1);
}

function getTopAnalytics(map, limit = 10) {
    return [...map.entries()]
        .map(([query, count]) => ({ query, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, limit);
}

async function fetch1337xList(query, limit) {
    const response = await axios.get("https://api.1337x.to/v2/list", {
        params: { q: query },
        timeout: REQUEST_TIMEOUT_MS
    });

    const torrents = Array.isArray(response.data?.torrents) ? response.data.torrents : [];
    return torrents.slice(0, limit);
}

function normalizeTorrentShape(torrent, providerName) {
    const name = sanitizeQuery(torrent?.name || "");
    if (!name) return null;
    return {
        ...torrent,
        name,
        seeders: Number(torrent?.seeders || 0),
        leechers: Number(torrent?.leechers || 0),
        _providers: Array.isArray(torrent?._providers) ? [...new Set([...torrent._providers, providerName])] : [providerName]
    };
}

async function runSearchWithRetry(query, limit, providerFetcher) {
    let attempt = 0;
    let lastError;

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

function mergeAndRankResults(query, providerResults, limit) {
    const map = new Map();
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
                const existing = map.get(key);
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

    return scored.sort((a, b) => b._score - a._score).slice(0, limit);
}

function normalizeTorrentKey(torrent) {
    const magnet = sanitizeQuery(torrent?.magnet || "").toLowerCase();
    const name = sanitizeQuery(torrent?.name || "").toLowerCase();
    if (magnet) return `magnet::${magnet}`;
    if (name) return `name::${name}`;
    return "";
}

function storeInLocalIndex(torrents) {
    for (const torrent of torrents) {
        const key = normalizeTorrentKey(torrent);
        if (!key) continue;
        localIndex.set(key, {
            ...torrent,
            _indexedAt: Date.now()
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

async function provider1337x(query, limit) {
    const items = await runSearchWithRetry(query, limit, fetch1337xList);
    return items;
}

async function providerLocalIndex(query, limit) {
    const normalized = query.toLowerCase();
    const hits = [];

    for (const entry of localIndex.values()) {
        if ((entry.name || "").toLowerCase().includes(normalized)) {
            hits.push(entry);
        }
        if (hits.length >= limit) break;
    }
    return hits;
}

function mapTorrentSearchApiItem(item) {
    return {
        name: sanitizeQuery(item?.title || item?.name || ""),
        seeders: Number(item?.seeds || item?.seeders || 0),
        leechers: Number(item?.peers || item?.leechers || 0),
        size: item?.size || "",
        uploaded: item?.time || item?.uploaded || "",
        magnet: item?.magnet || "",
        link: item?.link || "",
        _providerHint: "provider_torrent_search_api"
    };
}

async function providerTorrentSearchApi(query, limit) {
    const items = await TorrentSearchApi.search(query, "All", limit);
    const normalized = Array.isArray(items) ? items.map(mapTorrentSearchApiItem).filter((item) => item.name) : [];
    return normalized.slice(0, limit);
}

async function fetchProviderResults(query, limit) {
    const providers = [
        { name: "provider_1337x", fetcher: provider1337x },
        { name: "provider_torrent_search_api", fetcher: providerTorrentSearchApi },
        { name: "local_index", fetcher: providerLocalIndex }
    ];

    const settled = await Promise.allSettled(
        providers.map(async (provider) => ({
            provider: provider.name,
            items: await provider.fetcher(query, limit)
        }))
    );

    const successes = settled
        .filter((item) => item.status === "fulfilled")
        .map((item) => item.value);

    const failedProviders = settled
        .map((item, index) => ({ item, provider: providers[index].name }))
        .filter(({ item }) => item.status === "rejected")
        .map(({ provider }) => provider);

    return { successes, failedProviders };
}

async function getSearchResults(query, limit = 60) {
    const cacheKey = getCacheKey(query, limit);
    const cached = getCachedResults(cacheKey);
    if (cached) {
        return cached;
    }

    if (inFlightSearches.has(cacheKey)) {
        return inFlightSearches.get(cacheKey);
    }

    const searchPromise = fetchProviderResults(query, limit)
        .then(({ successes, failedProviders }) => {
            const nonEmptySuccesses = successes.filter((entry) => Array.isArray(entry.items) && entry.items.length > 0);
            const selectedSources = nonEmptySuccesses.length ? nonEmptySuccesses : successes;
            if (!selectedSources.length) {
                return {
                    results: [],
                    meta: {
                        providersUsed: [],
                        providersFailed: failedProviders,
                        degraded: true
                    }
                };
            }
            const merged = mergeAndRankResults(query, selectedSources, limit);
            storeInLocalIndex(merged);
            const results = {
                results: merged,
                meta: {
                    providersUsed: selectedSources.map((item) => item.provider),
                    providersFailed: failedProviders,
                    degraded: failedProviders.length > 0
                }
            };
            setCachedResults(cacheKey, results);
            return results;
        })
        .finally(() => {
            inFlightSearches.delete(cacheKey);
        });

    inFlightSearches.set(cacheKey, searchPromise);
    return searchPromise;
}

app.get("/api/health", (req, res) => {
    res.json({
        status: "ok"
    });
});

app.use("/api", rateLimit);

app.get("/api/search", async (req, res) => {
    const query = sanitizeQuery(req.query.q);
    const limit = parsePositiveInt(req.query.limit, 60, 120);

    if (!query || query.length < 2) {
        return res.status(400).json({
            error: "Query parameter 'q' must be at least 2 characters."
        });
    }

    if (query.length > MAX_QUERY_LENGTH) {
        return res.status(400).json({
            error: `Query is too long. Maximum ${MAX_QUERY_LENGTH} characters.`
        });
    }

    try {
        incrementAnalytics(analytics.searched, query);
        const searchPayload = await getSearchResults(query, limit);

        res.json(searchPayload);
    } catch (error) {
        console.error("Search endpoint error:", error.message);
        res.status(502).json({
            error: "Search provider unavailable. Please try again."
        });
    }
});

app.get("/api/search/suggest", async (req, res) => {
    const query = sanitizeQuery(req.query.q);

    if (!query || query.length < 2) {
        return res.json([]);
    }

    try {
        const payload = await getSearchResults(query, 20);
        const results = payload.results || [];
        const suggestions = [];
        const seen = new Set();

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

app.get("/api/search/trending", (req, res) => {
    res.json(getTopAnalytics(analytics.searched, 10));
});

app.get("/api/search/providers", (req, res) => {
    res.json({
        activeProviders: ["provider_1337x", "provider_torrent_search_api", "local_index"],
        localIndexSize: localIndex.size
    });
});

app.get("/api/analytics/summary", (req, res) => {
    res.json({
        mostSearched: getTopAnalytics(analytics.searched, 10),
        mostStreamed: getTopAnalytics(analytics.streamed, 10),
        mostDownloaded: getTopAnalytics(analytics.downloaded, 10)
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
        return res.json({ magnet: existingMagnet });
    }

    if (!name || name.length < 2) {
        return res.status(400).json({ error: "Valid 'name' is required." });
    }

    try {
        if (providerHint === "provider_torrent_search_api" || !providerHint) {
            const candidates = await TorrentSearchApi.search(name, "All", 8);
            for (const candidate of candidates) {
                try {
                    const resolvedMagnet = await TorrentSearchApi.getMagnet(candidate);
                    const normalized = sanitizeQuery(resolvedMagnet);
                    if (normalized.startsWith("magnet:?")) {
                        return res.json({ magnet: normalized });
                    }
                } catch {
                    // Try next candidate.
                }
            }
        }

        return res.status(404).json({ error: "Magnet not found for this upload." });
    } catch (error) {
        console.error("Resolve magnet error:", error.message);
        return res.status(502).json({ error: "Unable to resolve magnet currently." });
    }
});

app.get("/api/security/virustotal/report", async (req, res) => {
    const hash = sanitizeQuery(req.query.hash).toLowerCase();
    if (!hash || hash.length < 20) {
        return res.status(400).json({ error: "Valid torrent hash is required." });
    }

    if (!VIRUSTOTAL_API_KEY) {
        return res.status(503).json({
            error: "VirusTotal is not configured.",
            configured: false
        });
    }

    try {
        const response = await axios.get(`https://www.virustotal.com/api/v3/files/${encodeURIComponent(hash)}`, {
            headers: {
                "x-apikey": VIRUSTOTAL_API_KEY
            },
            timeout: REQUEST_TIMEOUT_MS
        });

        const stats = response.data?.data?.attributes?.last_analysis_stats || {};
        const malicious = Number(stats.malicious || 0);
        const suspicious = Number(stats.suspicious || 0);
        const harmless = Number(stats.harmless || 0);
        const undetected = Number(stats.undetected || 0);

        return res.json({
            configured: true,
            hash,
            verdict: malicious > 0 || suspicious > 0 ? "risky" : "clean_or_unknown",
            stats: { malicious, suspicious, harmless, undetected }
        });
    } catch (error) {
        if (error?.response?.status === 404) {
            return res.status(404).json({
                configured: true,
                hash,
                verdict: "unknown",
                error: "No VirusTotal report found for this hash yet."
            });
        }

        console.error("VirusTotal report error:", error.message);
        return res.status(502).json({
            configured: true,
            error: "Could not fetch VirusTotal report right now."
        });
    }
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