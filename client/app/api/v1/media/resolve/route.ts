import { enforceRateLimit } from "@/lib/cache/rate-limit";
import { resolveHlsMedia, type HlsStreamCandidate } from "@/lib/media/hls-resolver";
import { isHlsProvider, type StreamProvider } from "@/lib/providers";

interface ResolveQuery {
  provider: string;
  tmdbId: string;
  type: string;
  season?: string;
  episode?: string;
}

function parseQuery(request: Request): ResolveQuery | null {
  const { searchParams } = new URL(request.url);
  const provider = searchParams.get("provider");
  const tmdbId = searchParams.get("tmdbId");
  const type = searchParams.get("type");

  if (!provider || !tmdbId || !type) return null;

  if (type !== "movie" && type !== "tv") return null;

  return {
    provider,
    tmdbId,
    type,
    season: searchParams.get("season") ?? undefined,
    episode: searchParams.get("episode") ?? undefined,
  };
}

function buildProxiedUrl(candidate: HlsStreamCandidate, request: Request): string {
  const proxyBase = new URL("/api/live-tv/stream", request.url).toString();
  const params = new URLSearchParams({ url: candidate.url });
  if (candidate.referer) params.set("referer", candidate.referer);
  if (candidate.origin) params.set("origin", candidate.origin);
  if (candidate.region) params.set("region", candidate.region);
  return `${proxyBase}?${params.toString()}`;
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "media:resolve", 30, 60);
  if (limited) return limited;

  const query = parseQuery(request);
  if (!query) {
    return Response.json({ error: "Missing or invalid parameters. Required: provider, tmdbId, type" }, { status: 400 });
  }

  if (!/^\d+$/.test(query.tmdbId)) {
    return Response.json({ error: "Invalid tmdbId; expected numeric TMDB ID" }, { status: 400 });
  }

  const provider = query.provider as StreamProvider;
  if (!isHlsProvider(provider)) {
    return Response.json(
      { error: `Provider "${query.provider}" does not support backend HLS resolution` },
      { status: 400 }
    );
  }

  const season = query.season ? parseInt(query.season, 10) : undefined;
  const episode = query.episode ? parseInt(query.episode, 10) : undefined;

  if (query.type === "tv" && (isNaN(season as number) || isNaN(episode as number))) {
    return Response.json(
      { error: "TV streams require valid season and episode parameters" },
      { status: 400 }
    );
  }

  try {
    const candidate = await resolveHlsMedia({
      provider,
      tmdbId: query.tmdbId,
      type: query.type as "movie" | "tv",
      season,
      episode,
    });

    if (!candidate) {
      const reason = `HLS_RESOLVE_FAILED: no source found for ${query.tmdbId}`;
      console.error(`[resolve] ${reason}`);
      return Response.json(
        { error: "No HLS stream available for this title", tmdbId: query.tmdbId, reason },
        { status: 404 }
      );
    }

    const playbackUrl = buildProxiedUrl(candidate, request);

    return Response.json(
      {
        type: "hls",
        url: playbackUrl,
        quality: candidate.quality ?? null,
        tmdbId: query.tmdbId,
        mediaType: query.type,
        isGeoBypassed: Boolean(candidate.region),
        isAdStripped: true,
      },
      {
        headers: {
          "Cache-Control": "public, max-age=600, stale-while-revalidate=1800",
        },
      }
    );
  } catch (error) {
    console.error("API Error [/api/v1/media/resolve]:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
