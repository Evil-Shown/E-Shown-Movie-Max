import {
  getMovieById as getLocalMovieById,
  movies as localMovies,
  searchMovies as searchLocalMovies,
} from "@/lib/movies";
import type { Movie } from "@/lib/types";
import { fetchOmdbByImdbId, isOmdbConfigured, searchOmdb } from "@/lib/omdb/client";
import { mapOmdbDetail, mapOmdbSearchItem } from "@/lib/omdb/map";

export async function resolveMovie(id: string): Promise<Movie | null> {
  const local = getLocalMovieById(id);
  if (local) return local;

  if (!isOmdbConfigured() || !/^tt\d+$/.test(id)) return null;

  try {
    const detail = await fetchOmdbByImdbId(id);
    if (detail.Response !== "True") return null;
    return mapOmdbDetail(detail);
  } catch {
    return null;
  }
}

export async function searchCatalog(query: string): Promise<{
  movies: Movie[];
  source: "local" | "omdb" | "mixed";
  totalResults?: number;
}> {
  const trimmed = query.trim();

  if (!trimmed) {
    return { movies: localMovies, source: "local" };
  }

  const local = searchLocalMovies(trimmed);

  if (!isOmdbConfigured()) {
    return { movies: local, source: "local" };
  }

  try {
    const response = await searchOmdb(trimmed);
    if (response.Response !== "True" || !response.Search?.length) {
      return { movies: local, source: local.length ? "mixed" : "local" };
    }

    const remote = response.Search.filter((item) => item.Type === "movie").map(mapOmdbSearchItem);
    const seen = new Set<string>();
    const merged: Movie[] = [];

    for (const movie of [...local, ...remote]) {
      if (seen.has(movie.id)) continue;
      seen.add(movie.id);
      merged.push(movie);
    }

    return {
      movies: merged,
      source: local.length ? "mixed" : "omdb",
      totalResults: Number.parseInt(response.totalResults ?? "0", 10) || merged.length,
    };
  } catch {
    return { movies: local, source: "local" };
  }
}
