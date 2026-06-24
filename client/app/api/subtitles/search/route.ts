import { NextResponse } from "next/server";

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  format: string;
}

interface WyzieSubtitle {
  id?: string | number;
  url?: string;
  lang?: string;
  language?: string;
  display?: string;
  format?: string;
  encoding?: string;
}

function normalizeLanguageCode(value: string | undefined): string {
  if (!value) return "und";
  return value.toLowerCase().split("-")[0] ?? "und";
}

function buildTrackLabel(lang: string, display?: string): string {
  const code = normalizeLanguageCode(lang);
  if (display?.trim()) return display.trim();
  return code.toUpperCase();
}

function toTrack(item: WyzieSubtitle, index: number): SubtitleTrack | null {
  if (!item.url) return null;
  const language = normalizeLanguageCode(item.lang ?? item.language);
  return {
    id: String(item.id ?? `${language}-${index}`),
    language,
    label: buildTrackLabel(language, item.display),
    url: item.url,
    format: (item.format ?? "vtt").toLowerCase(),
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const imdbId = searchParams.get("imdbId");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const language = searchParams.get("language");
  const apiKey = process.env.WYZIE_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      {
        tracks: [] as SubtitleTrack[],
        translationAvailable: Boolean(process.env.SUBTITLE_TRANSLATE_API_URL),
        message: "Subtitle search is not configured. Add WYZIE_API_KEY to enable worldwide subtitles.",
      },
      {
        headers: { "Cache-Control": "private, max-age=60" },
      }
    );
  }

  if (!tmdbId && !imdbId) {
    return NextResponse.json({ tracks: [], message: "Missing tmdbId or imdbId" }, { status: 400 });
  }

  const params = new URLSearchParams();
  params.set("key", apiKey);
  params.set("format", "vtt");
  params.set("id", tmdbId ?? imdbId ?? "");
  if (season) params.set("season", season);
  if (episode) params.set("episode", episode);
  if (language && language !== "off") params.set("language", language);

  try {
    const response = await fetch(`https://sub.wyzie.io/search?${params.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { tracks: [], message: "Subtitle search failed" },
        { status: response.status }
      );
    }

    const payload = (await response.json()) as WyzieSubtitle[] | { subtitles?: WyzieSubtitle[] };
    const items = Array.isArray(payload) ? payload : (payload.subtitles ?? []);
    const tracks = items
      .map(toTrack)
      .filter((track): track is SubtitleTrack => Boolean(track));

    return NextResponse.json(
      { tracks, translationAvailable: Boolean(process.env.SUBTITLE_TRANSLATE_API_URL) },
      {
        headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
      }
    );
  } catch {
    return NextResponse.json(
      {
        tracks: [],
        translationAvailable: Boolean(process.env.SUBTITLE_TRANSLATE_API_URL),
        message: "Could not reach subtitle service",
      },
      { status: 502 }
    );
  }
}
