import { env } from "../config/env";

const WYZIE_BASE = "https://sub.wyzie.io";

function resolveWyzieKey(platform?: string): string | undefined {
  switch (platform) {
    case "web":
      return env.WYZIE_API_KEY_WEB || env.WYZIE_API_KEY;
    case "desktop":
      return env.WYZIE_API_KEY_DESKTOP || env.WYZIE_API_KEY;
    case "mobile":
      return env.WYZIE_API_KEY_MOBILE || env.WYZIE_API_KEY;
    default:
      return env.WYZIE_API_KEY;
  }
}

export function isWyzieConfigured(platform?: string): boolean {
  return Boolean(resolveWyzieKey(platform));
}

export async function wyzieSearch(
  params: {
    tmdbId?: string;
    imdbId?: string;
    season?: string;
    episode?: string;
    language?: string;
  },
  options: { platform?: string } = {}
) {
  const apiKey = resolveWyzieKey(options.platform);
  if (!apiKey) {
    return { tracks: [], message: "Subtitle search is not configured." };
  }

  const searchParams = new URLSearchParams();
  searchParams.set("key", apiKey);
  searchParams.set("format", "vtt");
  searchParams.set("id", params.tmdbId ?? params.imdbId ?? "");
  if (params.season) searchParams.set("season", params.season);
  if (params.episode) searchParams.set("episode", params.episode);
  if (params.language && params.language !== "off") searchParams.set("language", params.language);

  const url = `${WYZIE_BASE}/search?${searchParams.toString()}`;
  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    return { tracks: [], message: "Subtitle search failed" };
  }

  const payload = (await response.json()) as
    | Array<{
        id?: string | number;
        url?: string;
        lang?: string;
        language?: string;
        display?: string;
        format?: string;
        encoding?: string;
      }>
    | {
        subtitles?: Array<{
          id?: string | number;
          url?: string;
          lang?: string;
          language?: string;
          display?: string;
          format?: string;
          encoding?: string;
        }>;
      };

  const items = Array.isArray(payload) ? payload : (payload.subtitles ?? []);
  const tracks = items
    .filter((item) => item.url)
    .map((item, index) => {
      const language = (item.lang ?? item.language ?? "und").toLowerCase().split("-")[0] ?? "und";
      return {
        id: String(item.id ?? `${language}-${index}`),
        language,
        label: item.display?.trim() ?? language.toUpperCase(),
        url: item.url,
        format: (item.format ?? "vtt").toLowerCase(),
      };
    });

  return { tracks };
}
