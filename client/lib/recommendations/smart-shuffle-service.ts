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

function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

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

function randomPage(): number {
  return Math.floor(Math.random() * 5) + 1;
}

async function fetchShufflePool(
  topGenres: Genre[],
  mediaPreference: MediaType | "mixed"
): Promise<Movie[]> {
  const fetches: Promise<Movie[]>[] = [];

  const includeMovies = mediaPreference !== "tv";
  const includeTv = mediaPreference !== "movie";

  if (topGenres.length === 0) {
    if (includeMovies) {
      fetches.push(fetchPopular(randomPage()).then((r) => r.results.map(mapTmdbListItem)));
    }
    if (includeTv) {
      fetches.push(fetchTvPopular(randomPage()).then((r) => r.results.map(mapTmdbTvListItem)));
    }
    fetches.push(
      fetchTrendingDay(randomPage()).then((r) =>
        r.results.map(mapTmdbMultiItem).filter((m): m is Movie => m !== null)
      )
    );
  } else {
    const shuffledGenres = shuffleArray(topGenres);
    for (const genre of shuffledGenres.slice(0, 3)) {
      if (includeMovies) {
        fetches.push(
          discoverMovies({ page: randomPage(), genre, sort: "popular" }).then((r) =>
            r.results.map(mapTmdbListItem)
          )
        );
      }
      if (includeTv) {
        fetches.push(
          discoverTv({ page: randomPage(), genre, sort: "popular" }).then((r) =>
            r.results.map(mapTmdbTvListItem)
          )
        );
      }
    }
  }

  const batches = await Promise.all(fetches);
  return uniqueMovies(batches.flat());
}

export async function getSmartShuffleRecommendations(
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

    const pool = await fetchShufflePool(topGenres, profile.mediaPreference);
    const filtered = pool
      .filter((movie) => !exclude.has(movie.id))
      .map((movie) => ({ movie, score: scoreCandidate(movie, weightMap) }))
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.movie);

    const shuffled = shuffleArray(filtered).slice(0, limit);

    if (shuffled.length >= 6) {
      return { movies: shuffled, hasSignals: profile.hasSignals };
    }

    const fallback = await fetchShufflePool([], "mixed");
    const merged = uniqueMovies([
      ...shuffled,
      ...fallback.filter((movie) => !exclude.has(movie.id)),
    ]);

    return { movies: shuffleArray(merged).slice(0, limit), hasSignals: profile.hasSignals };
  } catch {
    return { movies: [], hasSignals: profile.hasSignals };
  }
}
