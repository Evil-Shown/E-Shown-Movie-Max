import "server-only";

import type { OmdbMovieResponse, OmdbSearchResponse } from "./types";
import { buildCacheKey, cacheJson } from "@/lib/cache/request-cache";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
const OMDB_PROXY = `${API_BASE}/api/v1/omdb`;
const OMDB_SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OMDB_DETAIL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getCacheTtl(params: Record<string, string>): number {
  if (params.i || params.t) return OMDB_DETAIL_TTL_MS;
  return OMDB_SEARCH_TTL_MS;
}

async function omdbFetch<T>(endpoint: string, cacheScope: string): Promise<T> {
  const url = `${OMDB_PROXY}${endpoint}`;
  const cacheKey = buildCacheKey("omdb", cacheScope, { endpoint });
  const ttlMs = getCacheTtl({});

  return cacheJson(cacheKey, ttlMs, async () => {
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: Math.max(60, Math.floor(ttlMs / 1000)) },
    });

    if (!res.ok) throw new Error(`OMDb proxy request failed (${res.status})`);
    return res.json() as Promise<T>;
  });
}

export function isOmdbConfigured(): boolean {
  return true;
}

export async function searchOmdb(query: string, page = 1): Promise<OmdbSearchResponse> {
  const qs = new URLSearchParams({ q: query.trim(), page: String(page) }).toString();
  return omdbFetch<OmdbSearchResponse>(`/search?${qs}`, "search.movie");
}

export async function searchOmdbSeries(query: string, page = 1): Promise<OmdbSearchResponse> {
  const qs = new URLSearchParams({ q: query.trim(), page: String(page) }).toString();
  return omdbFetch<OmdbSearchResponse>(`/series?${qs}`, "search.series");
}

export async function fetchOmdbByImdbId(imdbId: string): Promise<OmdbMovieResponse> {
  return omdbFetch<OmdbMovieResponse>(`/by-imdb/${imdbId}`, "detail.imdb");
}

export async function fetchOmdbByTitle(title: string, year?: number): Promise<OmdbMovieResponse> {
  const qs = new URLSearchParams({ title, ...(year ? { year: String(year) } : {}) }).toString();
  return omdbFetch<OmdbMovieResponse>(`/by-title?${qs}`, "detail.title");
}
