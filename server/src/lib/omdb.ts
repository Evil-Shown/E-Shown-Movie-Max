import { env } from "../config/env";

const OMDB_BASE = "https://www.omdbapi.com/";

function resolveOmdbKey(platform?: string): string | undefined {
  switch (platform) {
    case "web":
      return env.OMDB_API_KEY_WEB || env.OMDB_API_KEY;
    case "desktop":
      return env.OMDB_API_KEY_DESKTOP || env.OMDB_API_KEY;
    case "mobile":
      return env.OMDB_API_KEY_MOBILE || env.OMDB_API_KEY;
    default:
      return env.OMDB_API_KEY;
  }
}

export function isOmdbConfigured(platform?: string): boolean {
  return Boolean(resolveOmdbKey(platform));
}

export async function omdbGet<T>(params: Record<string, string>, options: { platform?: string } = {}): Promise<T> {
  const apiKey = resolveOmdbKey(options.platform);
  if (!apiKey) {
    throw new Error("OMDB_API_KEY not configured on server");
  }

  const searchParams = new URLSearchParams({ apikey: apiKey, ...params });
  const url = `${OMDB_BASE}?${searchParams.toString()}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`OMDb request failed (${response.status})`);
  }

  return response.json() as Promise<T>;
}
