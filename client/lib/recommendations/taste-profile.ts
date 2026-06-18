import { getContinueWatching } from "@/lib/storage/continue-watching";
import {
  getSearchHistory,
  getTitleInteractions,
} from "@/lib/storage/taste-signals";
import { getWatchlist } from "@/lib/storage/watchlist";
import type { Genre, MediaType } from "@/lib/types";

export interface GenreWeight {
  genre: Genre;
  weight: number;
}

export interface TasteProfilePayload {
  genreWeights: GenreWeight[];
  excludeIds: string[];
  mediaPreference: MediaType | "mixed";
  hasSignals: boolean;
}

const ALL_GENRES: Genre[] = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

function addGenreWeight(scores: Partial<Record<Genre, number>>, genres: Genre[] | undefined, weight: number) {
  if (!genres?.length) return;
  for (const genre of genres) {
    scores[genre] = (scores[genre] ?? 0) + weight;
  }
}

function inferGenresFromQuery(query: string): Genre[] {
  const lower = query.toLowerCase();
  const matches: Genre[] = [];
  for (const genre of ALL_GENRES) {
    if (lower.includes(genre.toLowerCase())) {
      matches.push(genre);
    }
  }
  if (/\banime\b/i.test(lower)) matches.push("Animation");
  if (/\bscifi\b|sci-fi|science fiction/i.test(lower)) matches.push("Sci-Fi");
  return [...new Set(matches)];
}

export function buildTasteProfile(): TasteProfilePayload {
  const scores: Partial<Record<Genre, number>> = {};
  const excludeIds = new Set<string>();
  let movieSignals = 0;
  let tvSignals = 0;

  function trackMedia(mediaType?: MediaType, amount = 1) {
    if (mediaType === "tv") tvSignals += amount;
    else movieSignals += amount;
  }

  for (const item of getWatchlist()) {
    excludeIds.add(item.id);
    addGenreWeight(scores, item.genres, 3);
    trackMedia(item.mediaType, 2);
  }

  for (const item of getContinueWatching()) {
    excludeIds.add(item.id);
    addGenreWeight(scores, item.genres, 5);
    trackMedia(item.mediaType, 3);
  }

  for (const entry of getSearchHistory()) {
    const inferred = entry.genres?.length ? entry.genres : inferGenresFromQuery(entry.query);
    addGenreWeight(scores, inferred, 1.5);
  }

  for (const interaction of getTitleInteractions()) {
    excludeIds.add(interaction.id);
    addGenreWeight(scores, interaction.genres, interaction.weight);
    trackMedia(interaction.mediaType, interaction.weight);
  }

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("chithra-episode-progress");
      if (raw) {
        const data = JSON.parse(raw) as Record<string, boolean>;
        for (const key of Object.keys(data)) {
          if (!data[key]) continue;
          const tvId = key.split(":")[0];
          if (!tvId) continue;
          const normalized = tvId.startsWith("tv-") ? tvId : `tv-${tvId}`;
          excludeIds.add(normalized);
          const fromLibrary = [...getWatchlist(), ...getContinueWatching()].find((i) => i.id === normalized);
          if (fromLibrary?.genres?.length) {
            addGenreWeight(scores, fromLibrary.genres, 2);
          } else {
            addGenreWeight(scores, ["Animation", "Drama"], 1);
          }
          tvSignals += 2;
        }
      }
    } catch {
      /* ignore */
    }
  }

  const genreWeights = Object.entries(scores)
    .map(([genre, weight]) => ({ genre: genre as Genre, weight: weight ?? 0 }))
    .filter((entry) => entry.weight > 0)
    .sort((a, b) => b.weight - a.weight);

  const totalWeight = genreWeights.reduce((sum, entry) => sum + entry.weight, 0);
  const hasSignals = totalWeight > 0;

  let mediaPreference: MediaType | "mixed" = "mixed";
  if (movieSignals > tvSignals * 1.4) mediaPreference = "movie";
  else if (tvSignals > movieSignals * 1.4) mediaPreference = "tv";

  return {
    genreWeights,
    excludeIds: [...excludeIds],
    mediaPreference,
    hasSignals,
  };
}
