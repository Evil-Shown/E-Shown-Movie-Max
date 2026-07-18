import { NextResponse } from "next/server";
import { resolveApiBase } from "@/lib/api-base";

export interface SubtitleTrack {
  id: string;
  language: string;
  label: string;
  url: string;
  format: string;
}

const API_BASE = resolveApiBase() || "https://chithra-cinema-api.onrender.com";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tmdbId = searchParams.get("tmdbId");
  const imdbId = searchParams.get("imdbId");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");
  const language = searchParams.get("language");

  const proxyParams = new URLSearchParams();
  if (tmdbId) proxyParams.set("tmdbId", tmdbId);
  if (imdbId) proxyParams.set("imdbId", imdbId);
  if (season) proxyParams.set("season", season);
  if (episode) proxyParams.set("episode", episode);
  if (language && language !== "off") proxyParams.set("language", language);

  try {
    const response = await fetch(`${API_BASE}/api/v1/subtitles/search?${proxyParams.toString()}`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { tracks: [] as SubtitleTrack[], message: "Subtitle search failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400" },
    });
  } catch {
    return NextResponse.json(
      {
        tracks: [] as SubtitleTrack[],
        translationAvailable: false,
        message: "Could not reach subtitle service",
      },
      { status: 502 }
    );
  }
}
