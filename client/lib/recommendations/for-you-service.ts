import {
  discoverMovies,
  discoverTv,
  fetchPopular,
  fetchTrendingDay,
  fetchTvPopular,
  isTmdbConfigured,
} from "@/lib/tmdb/client";
import { mapTmdbListItem, mapTmdbMultiItem, mapTmdbTvListItem } from "@/lib/tmdb/map";
import type { Genre, MediaType, Movie } from "@/lib/types";
import type { GenreWeight, TasteProfilePayload } from "@/lib/recommendations/taste-profile";

function uniqueMovies(movies: Movie[]): Movie[] {
  const seen = new Set<string>();
  return movies.filter((movie) => {
    if (seen.has(movie.id)) return false;
    seen.add(movie.id);
    return true;
  });
}

function scoreCandidate(movie: Movie, weights: Partial<Record<Genre, number>>): number {
  let score = 0;
  for (const genre of movie.genres) {
    score += (weights[genre] ?? 0) * 3;
  }
  score += movie.rating * 0.45;
  if (movie.year >= new Date().getFullYear() - 3) score += 0.35;
  return score;
}

async function fetchCandidatePool(
  topGenres: Genre[],
  mediaPreference: MediaType | "mixed"
): Promise<Movie[]> {
  const fetches: Promise<Movie[]>[] = [];

  const includeMovies = mediaPreference !== "tv";
  const includeTv = mediaPreference !== "movie";

  if (topGenres.length === 0) {
    if (includeMovies) {
      fetches.push(fetchPopular(1).then((r) => r.results.map(mapTmdbListItem)));
    }
    if (includeTv) {
      fetches.push(fetchTvPopular(1).then((r) => r.results.map(mapTmdbTvListItem)));
    }
    fetches.push(
      fetchTrendingDay(1).then((r) =>
        r.results.map(mapTmdbMultiItem).filter((m): m is Movie => m !== null)
      )
    );
  } else {
    for (const genre of topGenres.slice(0, 3)) {
      if (includeMovies) {
        fetches.push(
          discoverMovies({ page: 1, genre, sort: "popular" }).then((r) =>
            r.results.map(mapTmdbListItem)
          )
        );
      }
      if (includeTv) {
        fetches.push(
          discoverTv({ page: 1, genre, sort: "popular" }).then((r) =>
            r.results.map(mapTmdbTvListItem)
          )
        );
      }
    }
  }

  const batches = await Promise.all(fetches);
  return uniqueMovies(batches.flat());
}

export async function getForYouRecommendations(
  profile: TasteProfilePayload,
  limit = 16
): Promise<{ movies: Movie[]; hasSignals: boolean }> {
  if (!isTmdbConfigured()) {
    return { movies: [], hasSignals: profile.hasSignals };
  }

  try {
    const weightMap = Object.fromEntries(
      profile.genreWeights.map((entry: GenreWeight) => [entry.genre, entry.weight])
    ) as Partial<Record<Genre, number>>;

    const topGenres = profile.genreWeights.slice(0, 3).map((entry) => entry.genre);
    const exclude = new Set(profile.excludeIds);

    const pool = await fetchCandidatePool(topGenres, profile.mediaPreference);
    const ranked = pool
      .filter((movie) => !exclude.has(movie.id))
      .map((movie) => ({ movie, score: scoreCandidate(movie, weightMap) }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.movie)
      .slice(0, limit);

    if (ranked.length >= 8) {
      return { movies: ranked, hasSignals: profile.hasSignals };
    }

    const fallback = await fetchCandidatePool([], "mixed");
    const merged = uniqueMovies([
      ...ranked,
      ...fallback.filter((movie) => !exclude.has(movie.id)),
    ]).slice(0, limit);

    return { movies: merged, hasSignals: profile.hasSignals };
  } catch {
    return { movies: [], hasSignals: profile.hasSignals };
  }
}
