import type { Movie } from "@/lib/types";
import { mapTmdbGenreIds, mapTmdbGenreNames } from "./genres";
import type { TmdbMovieDetail, TmdbMovieListItem, TmdbMultiSearchItem, TmdbTvDetail, TmdbTvListItem } from "./types";

function parseYear(releaseDate: string | undefined): number {
  if (!releaseDate) return 0;
  const year = Number.parseInt(releaseDate.slice(0, 4), 10);
  return Number.isFinite(year) ? year : 0;
}

function pickTrailerKey(videos?: TmdbMovieDetail["videos"]): string | undefined {
  const youtube = videos?.results?.filter((v) => v.site === "YouTube") ?? [];
  const trailer =
    youtube.find((v) => v.type === "Trailer" && v.official) ??
    youtube.find((v) => v.type === "Trailer") ??
    youtube[0];
  return trailer?.key;
}

export function mapTmdbListItem(item: TmdbMovieListItem): Movie {
  return {
    id: String(item.id),
    mediaType: "movie",
    title: item.title,
    tagline: "",
    overview: item.overview ?? "",
    posterPath: item.poster_path ?? "",
    backdropPath: item.backdrop_path ?? item.poster_path ?? "",
    rating: Math.round((item.vote_average ?? 0) * 10) / 10,
    year: parseYear(item.release_date),
    runtime: 0,
    genres: mapTmdbGenreIds(item.genre_ids ?? []),
    director: "Unknown",
    cast: [],
  };
}

export function mapTmdbTvListItem(item: TmdbTvListItem): Movie {
  return {
    id: `tv-${item.id}`,
    mediaType: "tv",
    title: item.name,
    tagline: "",
    overview: item.overview ?? "",
    posterPath: item.poster_path ?? "",
    backdropPath: item.backdrop_path ?? item.poster_path ?? "",
    rating: Math.round((item.vote_average ?? 0) * 10) / 10,
    year: parseYear(item.first_air_date),
    runtime: 0,
    genres: mapTmdbGenreIds(item.genre_ids ?? []),
    director: "Unknown",
    cast: [],
  };
}

export function mapTmdbMultiItem(item: TmdbMultiSearchItem): Movie | null {
  if (item.media_type === "movie" && item.title) {
    return mapTmdbListItem({
      id: item.id,
      title: item.title,
      overview: item.overview ?? "",
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      release_date: item.release_date ?? "",
      vote_average: item.vote_average ?? 0,
      genre_ids: item.genre_ids,
    });
  }

  if (item.media_type === "tv" && item.name) {
    return mapTmdbTvListItem({
      id: item.id,
      name: item.name,
      overview: item.overview ?? "",
      poster_path: item.poster_path,
      backdrop_path: item.backdrop_path,
      first_air_date: item.first_air_date ?? "",
      vote_average: item.vote_average ?? 0,
      genre_ids: item.genre_ids,
    });
  }

  return null;
}

export function mapTmdbDetail(data: TmdbMovieDetail): Movie {
  const director =
    data.credits?.crew?.find((member) => member.job === "Director")?.name ?? "Unknown";

  const cast =
    data.credits?.cast?.slice(0, 4).map((member) => ({
      name: member.name,
      role: member.character,
    })) ?? [];

  return {
    id: String(data.id),
    mediaType: "movie",
    title: data.title,
    tagline: data.tagline ?? "",
    overview: data.overview || "No synopsis available.",
    posterPath: data.poster_path ?? "",
    backdropPath: data.backdrop_path ?? data.poster_path ?? "",
    rating: Math.round((data.vote_average ?? 0) * 10) / 10,
    year: parseYear(data.release_date),
    runtime: data.runtime ?? 0,
    genres: mapTmdbGenreNames(data.genres ?? []),
    director,
    cast,
    trailerKey: pickTrailerKey(data.videos),
    imdbId: data.imdb_id ?? undefined,
  };
}

export function mapTmdbTvDetail(data: TmdbTvDetail): Movie {
  const director = data.created_by?.[0]?.name ?? "Unknown";

  const cast =
    data.credits?.cast?.slice(0, 4).map((member) => ({
      name: member.name,
      role: member.character,
    })) ?? [];

  const runtime = data.episode_run_time?.[0] ?? 0;

  return {
    id: `tv-${data.id}`,
    mediaType: "tv",
    title: data.name,
    tagline: data.tagline ?? "",
    overview: data.overview || "No synopsis available.",
    posterPath: data.poster_path ?? "",
    backdropPath: data.backdrop_path ?? data.poster_path ?? "",
    rating: Math.round((data.vote_average ?? 0) * 10) / 10,
    year: parseYear(data.first_air_date),
    runtime,
    genres: mapTmdbGenreNames(data.genres ?? []),
    director,
    cast,
    trailerKey: pickTrailerKey(data.videos),
  };
}
