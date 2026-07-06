import type { Genre } from "@/lib/types";

export const TMDB_GENRE_IDS: Record<Genre, number> = {
  Action: 28,
  Adventure: 12,
  Animation: 16,
  Comedy: 35,
  Crime: 80,
  Drama: 18,
  Fantasy: 14,
  Horror: 27,
  Mystery: 9648,
  Romance: 10749,
  "Sci-Fi": 878,
  Thriller: 53,
};

const ID_TO_GENRE = Object.fromEntries(
  Object.entries(TMDB_GENRE_IDS).map(([name, id]) => [id, name as Genre])
) as Record<number, Genre>;

export function genreToTmdbId(genre: Genre): number {
  return TMDB_GENRE_IDS[genre];
}

export function mapTmdbGenreIds(ids: number[]): Genre[] {
  const genres = ids.map((id) => ID_TO_GENRE[id]).filter(Boolean);
  return genres.length > 0 ? genres : ["Drama"];
}

export function mapTmdbGenreNames(genres: { id: number; name: string }[]): Genre[] {
  const mapped = genres
    .map((g) => {
      const byId = ID_TO_GENRE[g.id];
      if (byId) return byId;
      const byName = g.name as Genre;
      return TMDB_GENRE_IDS[byName as Genre] ? byName : null;
    })
    .filter(Boolean) as Genre[];
  return mapped.length > 0 ? mapped : ["Drama"];
}
