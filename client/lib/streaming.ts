import type { Movie } from "@/lib/types";
import { buildEmbedUrl, DEFAULT_STREAM_PROVIDER, isHlsProvider, type StreamProvider } from "./providers";
import { proxifyEmbedUrl } from "./embed-proxy";

/** TMDB IDs for curated local slug-based movies */
const LOCAL_TMDB_IDS: Record<string, string> = {
  interstellar: "157336",
  inception: "27205",
  "the-dark-knight": "155",
  "dune-part-two": "693134",
  oppenheimer: "872585",
  parasite: "496243",
  "spider-man-across": "569094",
  "the-matrix": "603",
  "la-la-land": "313369",
  "get-out": "419430",
  "mad-max-fury-road": "76341",
  "everything-everywhere": "545611",
  "the-shawshank-redemption": "278",
  "blade-runner-2049": "335984",
  whiplash: "244786",
  "the-grand-budapest": "120467",
  hereditary: "493922",
  arrival: "329865",
  joker: "475557",
  "avatar-way-of-water": "76600",
};

export function resolveTmdbId(movie: Movie): string | null {
  if (/^\d+$/.test(movie.id)) return movie.id;
  if (movie.id.startsWith("tv-")) {
    const id = movie.id.slice(3);
    if (/^\d+$/.test(id)) return id;
  }
  return LOCAL_TMDB_IDS[movie.id] ?? null;
}

export function resolveImdbId(movie: Movie): string | null {
  if (movie.imdbId) return movie.imdbId;
  if (/^tt\d+$/.test(movie.id)) return movie.id;
  return null;
}

export function resolveMediaId(movie: Movie): string | null {
  return resolveTmdbId(movie) ?? resolveImdbId(movie);
}

export function resolveMediaIdFromString(id: string): string | null {
  if (/^\d+$/.test(id)) return id;
  if (id.startsWith("tv-")) {
    const tvId = id.slice(3);
    if (/^\d+$/.test(tvId)) return tvId;
  }
  if (/^tt\d+$/.test(id)) return id;
  return LOCAL_TMDB_IDS[id] ?? null;
}

export function isTvId(id: string): boolean {
  return id.startsWith("tv-");
}

export function isTvShow(movie: Movie): boolean {
  return movie.mediaType === "tv" || movie.id.startsWith("tv-");
}

export interface StreamEmbedOptions {
  season?: number;
  episode?: number;
  seek?: number;
  subtitleLang?: string;
  subtitleFile?: string;
  subtitleLabel?: string;
}

export function getTvEmbedUrl(
  provider: StreamProvider,
  tmdbId: string,
  season: number,
  episode: number,
  options?: StreamEmbedOptions
): string {
  return proxifyEmbedUrl(
    buildEmbedUrl(provider, tmdbId, "tv", season, episode, {
      autoPlay: true,
      seek: options?.seek,
      subtitleLang: options?.subtitleLang,
      subtitleFile: options?.subtitleFile,
      subtitleLabel: options?.subtitleLabel,
    })
  );
}

export function getMovieEmbedUrl(
  movie: Movie,
  provider: StreamProvider = DEFAULT_STREAM_PROVIDER,
  options?: StreamEmbedOptions
): string | null {
  const raw = getRawMovieEmbedUrl(movie, provider, options);
  if (!raw) return null;
  return proxifyEmbedUrl(raw);
}

/** Direct embed URL (never proxied) — use for opening in a browser tab. */
export function getRawMovieEmbedUrl(
  movie: Movie,
  provider: StreamProvider = DEFAULT_STREAM_PROVIDER,
  options?: StreamEmbedOptions
): string | null {
  const mediaId = resolveMediaId(movie);
  if (!mediaId) return null;

  const embedOptions = {
    autoPlay: true as const,
    seek: options?.seek,
    subtitleLang: options?.subtitleLang,
    subtitleFile: options?.subtitleFile,
    subtitleLabel: options?.subtitleLabel,
  };

  const tv = isTvShow(movie);
  if (tv) {
    const season = options?.season ?? 1;
    const episode = options?.episode ?? 1;
    return buildEmbedUrl(provider, mediaId, "tv", season, episode, embedOptions);
  }

  return buildEmbedUrl(provider, mediaId, "movie", undefined, undefined, embedOptions);
}

export type MediaStreamType = "embed" | "hls";

export interface ResolvedMediaStream {
  type: MediaStreamType;
  url: string;
  isGeoBypassed?: boolean;
  isAdStripped?: boolean;
}

export async function resolveMediaStream(
  movie: Movie,
  provider: StreamProvider = DEFAULT_STREAM_PROVIDER,
  options?: StreamEmbedOptions
): Promise<ResolvedMediaStream | null> {
  const mediaId = resolveMediaId(movie);
  if (!mediaId) return null;

  if (isHlsProvider(provider)) {
    const tv = isTvShow(movie);
    const params = new URLSearchParams({
      provider,
      tmdbId: mediaId,
      type: tv ? "tv" : "movie",
    });
    if (tv) {
      params.set("season", String(options?.season ?? 1));
      params.set("episode", String(options?.episode ?? 1));
    }

    try {
      const res = await fetch(`/api/v1/media/resolve?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const reason = (body as { reason?: string }).reason ?? `HTTP ${res.status}`;
        console.error("[resolveMediaStream] HLS resolution failed:", reason);
        return null;
      }
      const data = (await res.json()) as {
        type: string;
        url: string;
        isGeoBypassed?: boolean;
        isAdStripped?: boolean;
      };
      if (data.type !== "hls" || !data.url) return null;
      return {
        type: "hls",
        url: data.url,
        isGeoBypassed: data.isGeoBypassed,
        isAdStripped: data.isAdStripped,
      };
    } catch {
      return null;
    }
  }

  const embedUrl = getMovieEmbedUrl(movie, provider, options);
  if (!embedUrl) return null;
  return { type: "embed", url: embedUrl };
}
