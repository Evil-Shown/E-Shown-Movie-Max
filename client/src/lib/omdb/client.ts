import type { OmdbMovieResponse, OmdbSearchResponse } from "./types";

const OMDB_BASE = "https://www.omdbapi.com/";

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

export async function searchOmdb(
  query: string,
  page = 1
): Promise<OmdbSearchResponse> {
  const url = buildUrl({
    s: query.trim(),
    type: "movie",
    page: String(page),
    r: "json",
  });

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`OMDb search failed (${res.status})`);
  return res.json() as Promise<OmdbSearchResponse>;
}

export async function fetchOmdbByImdbId(imdbId: string): Promise<OmdbMovieResponse> {
  const url = buildUrl({
    i: imdbId,
    plot: "full",
    r: "json",
  });

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`OMDb detail failed (${res.status})`);
  return res.json() as Promise<OmdbMovieResponse>;
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

  const url = buildUrl(params);
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`OMDb title lookup failed (${res.status})`);
  return res.json() as Promise<OmdbMovieResponse>;
}
