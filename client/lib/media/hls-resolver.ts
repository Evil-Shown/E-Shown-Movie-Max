import type { StreamProvider } from "@/lib/providers";
import { fetchStreamResource, inferRefererFromUrl } from "@/lib/live-tv/stream-fetch";
import { isPlayableManifest } from "@/lib/live-tv/stream-validator";
import { cacheGetJson, cacheSetJson, redisKey } from "@/lib/cache/redis";
import { getManualHlsSources, getHotstarContentId } from "./manual-sources";
import { getRegionalProxy } from "./geo-bypass";

export interface HlsStreamCandidate {
  url: string;
  referer?: string;
  origin?: string;
  proxyUrl?: string;
  region?: string;
  quality?: string;
}

export interface ResolveParams {
  provider: StreamProvider;
  tmdbId: string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  title?: string;
}

type HlsResolverFn = (params: ResolveParams) => Promise<HlsStreamCandidate | null>;

const providerResolvers = new Map<StreamProvider, HlsResolverFn>();

export function registerHlsResolver(provider: StreamProvider, resolver: HlsResolverFn): void {
  providerResolvers.set(provider, resolver);
}

function buildCacheKey(params: ResolveParams): string {
  if (params.type === "movie") {
    return redisKey("stream", params.provider, params.tmdbId, "movie");
  }
  return redisKey(
    "stream",
    params.provider,
    params.tmdbId,
    String(params.season ?? 1),
    String(params.episode ?? 1)
  );
}

const CACHE_TTL_SECONDS = 7200;

async function resolveDynamicHls(params: ResolveParams): Promise<HlsStreamCandidate | null> {
  const manualSources = getManualHlsSources(params.tmdbId);
  if (manualSources && manualSources.length > 0) {
    for (const source of manualSources) {
      try {
        const resp = await fetchStreamResource(source.url, {
          mode: "manifest",
          retries: 1,
          referer: source.referer,
          origin: source.origin,
          proxyUrl: source.proxyUrl,
        });

        if (!resp.ok) continue;

        const contentType = resp.headers.get("content-type");
        const body = await resp.text();

        if (!isPlayableManifest(body, contentType)) continue;

        return {
          url: source.url,
          referer: source.referer ?? inferRefererFromUrl(source.url),
          origin: source.origin,
          proxyUrl: source.proxyUrl,
          region: source.region,
          quality: source.quality,
        };
      } catch {
        continue;
      }
    }

    return null;
  }

  const cacheKey = buildCacheKey(params);

  try {
    const cached = await cacheGetJson<HlsStreamCandidate>(cacheKey);
    if (cached?.url) return cached;
  } catch {
    // Redis unavailable — proceed with live resolution
  }

  const sourceUrls = getConfiguredHlsSources(params);
  if (sourceUrls.length === 0) return null;

  for (const candidate of sourceUrls) {
    try {
      const resp = await fetchStreamResource(candidate.url, {
        mode: "manifest",
        retries: 1,
        referer: candidate.referer,
        origin: candidate.origin,
        proxyUrl: candidate.proxyUrl,
      });

      if (!resp.ok) continue;

      const contentType = resp.headers.get("content-type");
      const body = await resp.text();

      if (!isPlayableManifest(body, contentType)) continue;

      const result: HlsStreamCandidate = {
        url: candidate.url,
        referer: candidate.referer ?? inferRefererFromUrl(candidate.url),
        origin: candidate.origin,
        proxyUrl: candidate.proxyUrl,
        region: candidate.region,
        quality: candidate.quality,
      };

      try {
        await cacheSetJson(cacheKey, result, CACHE_TTL_SECONDS);
      } catch {
        // Cache write failed — non-critical
      }

      return result;
    } catch {
      continue;
    }
  }

  return null;
}

interface ConfiguredSource {
  url: string;
  referer?: string;
  origin?: string;
  proxyUrl?: string;
  region?: string;
  quality?: string;
}

function getConfiguredHlsSources(params: ResolveParams): ConfiguredSource[] {
  const sources: ConfiguredSource[] = [];

  const envSources = process.env.HLS_VOD_SOURCES;
  if (envSources) {
    try {
      const parsed = JSON.parse(envSources) as ConfiguredSource[];
      for (const src of parsed) {
        const resolved = interpolateUrl(src.url, params);
        if (resolved) {
          sources.push({ ...src, url: resolved });
        }
      }
    } catch {
      // Invalid JSON config — ignore
    }
  }

  return sources;
}

function interpolateUrl(pattern: string, params: ResolveParams): string | null {
  try {
    return pattern
      .replace(/\{tmdbId\}/g, params.tmdbId)
      .replace(/\{type\}/g, params.type)
      .replace(/\{season\}/g, String(params.season ?? 1))
      .replace(/\{episode\}/g, String(params.episode ?? 1));
  } catch {
    return null;
  }
}

registerHlsResolver("dynamic_hls", resolveDynamicHls);

async function resolveHotstar(params: ResolveParams): Promise<HlsStreamCandidate | null> {
  console.log("[Hotstar] Starting resolution for", params.tmdbId, params.type, params.season, params.episode);

  const proxyUrl = getRegionalProxy("IN");
  if (!proxyUrl) {
    console.error("[Hotstar] No Indian proxy configured (PROXY_REGION_IN). Aborting.");
    return null;
  }
  console.log("[Hotstar] Proxy configured:", proxyUrl.replace(/\/\/.*@/, "//***@"));

  const season = params.season ?? 1;
  const episode = params.episode ?? 1;

  const streamCacheKey = params.type === "tv"
    ? redisKey("hotstar", "stream", params.tmdbId, `s${season}`, `e${episode}`)
    : redisKey("hotstar", "stream", params.tmdbId, "movie");

  // ── Tier 1: Per-episode stream cache ──
  try {
    const cached = await cacheGetJson<HlsStreamCandidate>(streamCacheKey);
    if (cached?.url) {
      console.log("[Hotstar] Tier 1: stream cache HIT, returning instantly");
      return cached;
    }
    console.log("[Hotstar] Tier 1: stream cache miss");
  } catch {
    console.log("[Hotstar] Tier 1: Redis check failed, continuing");
  }

  const contentIdCacheKey = redisKey("hotstar", "content_id", params.tmdbId, params.type);
  let hotstarContentId: string | null = null;

  // ── Tier 2: Redis content_id cache ──
  try {
    hotstarContentId = await cacheGetJson<string>(contentIdCacheKey);
    if (hotstarContentId) {
      console.log("[Hotstar] Tier 2: content_id cache HIT:", hotstarContentId);
    }
  } catch {
    console.log("[Hotstar] Tier 2: Redis content_id check failed");
  }

  // ── Tier 3: Manual ID map ──
  if (!hotstarContentId) {
    hotstarContentId = getHotstarContentId(params.tmdbId) ?? null;
    if (hotstarContentId) {
      console.log("[Hotstar] Tier 3: manual ID map HIT:", hotstarContentId);
      try {
        await cacheSetJson(contentIdCacheKey, hotstarContentId, 604800);
      } catch {}
    } else {
      console.log("[Hotstar] Tier 3: manual ID map miss");
    }
  }

  // ── Tier 4: Search API ──
  if (!hotstarContentId) {
    const searchTerm = params.title
      ? encodeURIComponent(params.title)
      : params.tmdbId;

    console.log("[Hotstar] Tier 4: searching Hotstar API for:", searchTerm);
    try {
      const searchUrl =
        `https://www.hotstar.com/in/api/v1/old/search?query=${searchTerm}&devicePlatform=web`;
      const resp = await fetchStreamResource(searchUrl, {
        mode: "api",
        retries: 1,
        proxyUrl,
        referer: "https://www.hotstar.com/",
      });

      console.log("[Hotstar] Search response status:", resp.status);

      if (resp.ok) {
        const body = await resp.text();
        // Detect if Hotstar returned an HTML challenge page instead of JSON
        if (body.trim().startsWith("<")) {
          console.error("[Hotstar] Blocked by Akamai/WAF — returned HTML challenge page");
        } else {
          try {
            const data = JSON.parse(body) as {
              data?: {
                items?: Array<{ id?: string; contentId?: string; type?: string; title?: string }>;
              };
            };

            const items = data?.data?.items ?? [];
            console.log("[Hotstar] Search returned", items.length, "items");
            const match = items.find(
              (item) => item.type === "SHOW" || item.type === "MOVIE"
            );
            if (match?.contentId) {
              hotstarContentId = match.contentId;
              console.log("[Hotstar] Found content_id:", hotstarContentId, "title:", match.title);
              try {
                await cacheSetJson(contentIdCacheKey, hotstarContentId, 604800);
              } catch {}
            } else {
              console.error("[Hotstar] Could not extract content_id from", items.length, "results");
            }
          } catch {
            console.error("[Hotstar] Search returned invalid JSON");
          }
        }
      } else {
        console.error("[Hotstar] Search API returned non-200:", resp.status);
      }
    } catch (err) {
      console.error("[Hotstar] Search API request failed:", err);
    }
  }

  if (!hotstarContentId) {
    console.error("[Hotstar] No content_id resolved after all tiers. Aborting.");
    return null;
  }

  // ── Tier 5: Playback API ──
  console.log("[Hotstar] Tier 5: fetching playback URL for content_id:", hotstarContentId);
  try {
    const playbackUrl =
      params.type === "tv"
        ? `https://www.hotstar.com/in/api/v1/content/${hotstarContentId}/playback?season=${season}&episode=${episode}`
        : `https://www.hotstar.com/in/api/v1/content/${hotstarContentId}/playback`;

    const resp = await fetchStreamResource(playbackUrl, {
      mode: "api",
      retries: 2,
      proxyUrl,
      referer: "https://www.hotstar.com/",
    });

    console.log("[Hotstar] Playback response status:", resp.status);

    if (!resp.ok) {
      console.error("[Hotstar] Playback API returned non-200:", resp.status);
      return null;
    }

    const raw = await resp.text();
    if (raw.trim().startsWith("<")) {
      console.error("[Hotstar] Playback API returned HTML (blocked/proxy issue)");
      return null;
    }

    let data: {
      data?: {
        playBackSets?: Array<{
          tagsCombination?: Record<string, unknown>;
          playbackUrl?: string;
        }>;
      };
    };
    try {
      data = JSON.parse(raw);
    } catch {
      console.error("[Hotstar] Playback API returned invalid JSON");
      return null;
    }

    const sets = data?.data?.playBackSets ?? [];
    console.log("[Hotstar] Found", sets.length, "playback sets");

    for (const set of sets) {
      const url = set.playbackUrl;
      if (!url || !url.includes(".m3u8")) {
        console.log("[Hotstar] Skipping non-m3u8 set");
        continue;
      }

      const clientAttributes =
        (set.tagsCombination as { client_attributes?: { drm_type?: string } }) ?? {};
      const drmType = clientAttributes?.client_attributes?.drm_type;
      if (drmType !== "NONE") {
        console.log("[Hotstar] Skipping DRM-encrypted set (drm_type:", drmType, ")");
        continue;
      }

      console.log("[Hotstar] Found unencrypted m3u8:", url.substring(0, 80) + "...");

      const result: HlsStreamCandidate = {
        url,
        referer: "https://www.hotstar.com/",
        origin: "https://www.hotstar.com",
        proxyUrl,
        region: "IN",
        quality: "Unencrypted",
      };

      try {
        await cacheSetJson(streamCacheKey, result, 604800);
      } catch {}

      return result;
    }

    console.error("[Hotstar] No unencrypted m3u8 found in", sets.length, "playback sets");
  } catch (err) {
    console.error("[Hotstar] Playback API error:", err);
  }

  return null;
}

registerHlsResolver("hotstar", resolveHotstar);

export async function resolveHlsMedia(params: ResolveParams): Promise<HlsStreamCandidate | null> {
  const manualSources = getManualHlsSources(params.tmdbId);
  if (manualSources && manualSources.length > 0) {
    console.log("[hls-resolver] Manual source found for TMDB", params.tmdbId, "— bypassing provider resolver");
    for (const source of manualSources) {
      try {
        const proxyUrl = source.proxyUrl ?? (source.region ? getRegionalProxy(source.region) : undefined);
        const resp = await fetchStreamResource(source.url, {
          mode: "manifest",
          retries: 1,
          referer: source.referer,
          origin: source.origin,
          proxyUrl,
        });

        if (!resp.ok) continue;

        const contentType = resp.headers.get("content-type");
        const body = await resp.text();

        if (!isPlayableManifest(body, contentType)) continue;

        return {
          url: source.url,
          referer: source.referer ?? inferRefererFromUrl(source.url),
          origin: source.origin,
          proxyUrl,
          region: source.region,
          quality: source.quality,
        };
      } catch {
        continue;
      }
    }

    console.log("[hls-resolver] Manual source validation failed — falling through to provider resolver");
    return null;
  }

  const resolver = providerResolvers.get(params.provider);
  if (!resolver) return null;
  try {
    return await resolver(params);
  } catch (err) {
    console.error(`[hls-resolver] ${params.provider} resolver threw:`, err);
    return null;
  }
}

export { isPlayableManifest };
