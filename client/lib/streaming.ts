import type { Movie } from "@/lib/types";

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

function resolveTmdbId(movie: Movie): string | null {
  if (/^\d+$/.test(movie.id)) return movie.id;
  return LOCAL_TMDB_IDS[movie.id] ?? null;
}

export function getMovieEmbedUrl(movie: Movie): string | null {
  const tmdbId = resolveTmdbId(movie);
  if (tmdbId) {
    return `https://vidsrc.cc/v2/embed/movie/${tmdbId}?autoPlay=true`;
  }
  if (movie.imdbId) {
    return `https://vidsrc.cc/v2/embed/movie/${movie.imdbId}?autoPlay=true`;
  }
  return null;
}
