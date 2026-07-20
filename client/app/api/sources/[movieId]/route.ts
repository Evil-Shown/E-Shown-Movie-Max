import { NextResponse } from "next/server";
import {
  buildEmbedUrl,
  PROVIDER_LABELS,
  STREAM_PROVIDERS,
  type SourcesResponse,
  type StreamSource,
} from "@/lib/providers";
import { isTvId, resolveMediaIdFromString } from "@/lib/streaming";

interface RouteParams {
  params: Promise<{ movieId: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { movieId } = await params;
    const { searchParams } = new URL(request.url);

    const typeParam = searchParams.get("type");
    const type: "movie" | "tv" =
      typeParam === "tv" || isTvId(movieId) ? "tv" : "movie";

    const season = Math.max(1, Number.parseInt(searchParams.get("season") ?? "1", 10) || 1);
    const episode = Math.max(1, Number.parseInt(searchParams.get("episode") ?? "1", 10) || 1);
    const seek = Number.parseInt(searchParams.get("seek") ?? "0", 10) || undefined;
    const subtitleLang = searchParams.get("subtitleLang") ?? undefined;
    const subtitleFile = searchParams.get("subtitleFile") ?? undefined;
    const subtitleLabel = searchParams.get("subtitleLabel") ?? undefined;

    const mediaId = resolveMediaIdFromString(decodeURIComponent(movieId));

    if (!mediaId) {
      return NextResponse.json(
        { movieId, mediaId: null, type, sources: [] } satisfies SourcesResponse,
        { status: 404 }
      );
    }

    const sources: StreamSource[] = STREAM_PROVIDERS.map((provider) => ({
      provider,
      label: PROVIDER_LABELS[provider],
      url: buildEmbedUrl(provider, mediaId, type, season, episode, {
        autoPlay: true,
        seek,
        subtitleLang,
        subtitleFile,
        subtitleLabel,
      }),
    }));

    return NextResponse.json(
      { movieId, mediaId, type, sources } satisfies SourcesResponse,
      {
        headers: {
          "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("API Error [/api/sources]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
