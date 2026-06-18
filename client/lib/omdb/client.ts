import type { OmdbMovieResponse, OmdbSearchResponse } from "./types";
import { buildCacheKey, cacheJson } from "@/lib/cache/request-cache";

const OMDB_BASE = "https://www.omdbapi.com/";
const OMDB_SEARCH_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const OMDB_DETAIL_TTL_MS = 30 * 24 * 60 * 60 * 1000;

function getApiKey(): string | undefined {
  return process.env.OMDB_API_KEY;
}

export function isOmdbConfigured(): boolean {
  return Boolean(getApiKey());
}

function buildUrl(params: Record<string, string>): string {
  const key = getApiKey();
  if (!key) throw new Error("OMDB_API_KEY is not configured");

  const search = new URLSearchParams({ apikey: key, ...params });
  return `${OMDB_BASE}?${search.toString()}`;
}

function getCacheTtl(params: Record<string, string>): number {
  if (params.i || params.t) return OMDB_DETAIL_TTL_MS;
  return OMDB_SEARCH_TTL_MS;
}

async function omdbFetch<T>(params: Record<string, string>, cacheScope: string): Promise<T> {
  const url = buildUrl(params);
  const ttlMs = getCacheTtl(params);
  const cacheKey = buildCacheKey("omdb", cacheScope, params);

  return cacheJson(cacheKey, ttlMs, async () => {
    const res = await fetch(url, {
      cache: "force-cache",
      next: { revalidate: Math.max(60, Math.floor(ttlMs / 1000)) },
    });

    if (!res.ok) throw new Error(`OMDb request failed (${res.status})`);
    return res.json() as Promise<T>;
  });
}

export async function searchOmdb(
  query: string,
  page = 1
): Promise<OmdbSearchResponse> {
  return omdbFetch<OmdbSearchResponse>({
    s: query.trim(),
    type: "movie",
    page: String(page),
    r: "json",
  }, "search.movie");
}

export async function searchOmdbSeries(
  query: string,
  page = 1
): Promise<OmdbSearchResponse> {
  return omdbFetch<OmdbSearchResponse>({
    s: query.trim(),
    type: "series",
    page: String(page),
    r: "json",
  }, "search.series");
}

export async function fetchOmdbByImdbId(imdbId: string): Promise<OmdbMovieResponse> {
  return omdbFetch<OmdbMovieResponse>({
    i: imdbId,
    plot: "full",
    r: "json",
  }, "detail.imdb");
}

export async function fetchOmdbByTitle(
  title: string,
  year?: number
): Promise<OmdbMovieResponse> {
  const params: Record<string, string> = {
    t: title,
    plot: "full",
    r: "json",
  };
  if (year) params.y = String(year);
  return omdbFetch<OmdbMovieResponse>(params, "detail.title");
}
