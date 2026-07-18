import { env } from "../config/env";

export const TMDB_BASE = "https://api.themoviedb.org/3";
export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

function resolveTmdbKey(platform?: string): string {
  switch (platform) {
    case "web":
      return env.TMDB_API_KEY_WEB || env.TMDB_API_KEY;
    case "desktop":
      return env.TMDB_API_KEY_DESKTOP || env.TMDB_API_KEY;
    case "mobile":
      return env.TMDB_API_KEY_MOBILE || env.TMDB_API_KEY;
    default:
      return env.TMDB_API_KEY;
  }
}

export function getTmdbConfig(platform?: string) {
  const apiKey = resolveTmdbKey(platform);
  if (!apiKey) {
    throw new Error("TMDB_API_KEY not configured on server");
  }
  return {
    apiKey,
    language: "en-US",
    region: "US",
  };
}

export function getTmdbImageUrl(path: string | null | undefined, size: string = "w500"): string | null {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export async function tmdbGet<T>(
  path: string,
  params: Record<string, string> = {},
  options: { region?: string; platform?: string } = {}
): Promise<T> {
  const cfg = getTmdbConfig(options.platform);

  const searchParams: Record<string, string> = {
    api_key: cfg.apiKey,
    language: cfg.language,
    ...params,
  };
  if (options.region) {
    searchParams.region = options.region;
  }

  const url = `${TMDB_BASE}${path}?${new URLSearchParams(searchParams).toString()}`;
  const response = await fetch(url, { method: "GET" });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`TMDB request failed (${response.status}): ${body}`);
  }

  return response.json() as Promise<T>;
}
