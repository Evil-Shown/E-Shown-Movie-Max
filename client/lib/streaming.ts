import type { Movie } from "@/lib/types";
import { buildEmbedUrl, type StreamProvider } from "./providers";
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

export function isTvShow(movie: Movie): boolean {
  return movie.mediaType === "tv" || movie.id.startsWith("tv-");
}

export function getTvEmbedUrl(
  provider: StreamProvider,
  tmdbId: string,
  season: number,
  episode: number,
  options?: { seek?: number }
): string {
  return proxifyEmbedUrl(
    buildEmbedUrl(provider, tmdbId, "tv", season, episode, {
      autoPlay: true,
      seek: options?.seek,
    })
  );
}

export function getMovieEmbedUrl(
  movie: Movie,
  provider: StreamProvider = "vidsrc",
  options?: { season?: number; episode?: number; seek?: number }
): string | null {
  const mediaId = resolveMediaId(movie);
  if (!mediaId) return null;

  const tv = isTvShow(movie);
  if (tv) {
    const season = options?.season ?? 1;
    const episode = options?.episode ?? 1;
    return proxifyEmbedUrl(
      buildEmbedUrl(provider, mediaId, "tv", season, episode, {
        autoPlay: true,
        seek: options?.seek,
      })
    );
  }

  return proxifyEmbedUrl(
    buildEmbedUrl(provider, mediaId, "movie", undefined, undefined, {
      autoPlay: true,
      seek: options?.seek,
    })
  );
}
