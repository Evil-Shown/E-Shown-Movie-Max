import type { Genre, Movie } from "@/lib/types";
import type { OmdbMovieResponse, OmdbSearchItem } from "./types";

const GENRE_MAP: Record<string, Genre> = {
  Action: "Action",
  Adventure: "Adventure",
  Animation: "Animation",
  Comedy: "Comedy",
  Crime: "Crime",
  Drama: "Drama",
  Fantasy: "Fantasy",
  Horror: "Horror",
  Mystery: "Mystery",
  Romance: "Romance",
  "Sci-Fi": "Sci-Fi",
  "Science Fiction": "Sci-Fi",
  Thriller: "Thriller",
};

const PLACEHOLDER_POSTER = "";

function parseGenres(raw: string | undefined): Genre[] {
  if (!raw || raw === "N/A") return ["Drama"];
  const mapped = raw
    .split(",")
    .map((g) => g.trim())
    .map((g) => GENRE_MAP[g])
    .filter(Boolean) as Genre[];
  return mapped.length > 0 ? mapped : ["Drama"];
}

function parseRuntime(raw: string | undefined): number {
  if (!raw || raw === "N/A") return 0;
  const match = raw.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function parseRating(raw: string | undefined): number {
  if (!raw || raw === "N/A") return 0;
  const value = Number.parseFloat(raw);
  return Number.isFinite(value) ? value : 0;
}

function parseYear(raw: string | undefined): number {
  if (!raw || raw === "N/A") return 0;
  const match = raw.match(/\d{4}/);
  return match ? Number(match[0]) : 0;
}

function parsePoster(poster: string | undefined): string {
  if (!poster || poster === "N/A") return PLACEHOLDER_POSTER;
  return poster;
}

function parseCast(raw: string | undefined) {
  if (!raw || raw === "N/A") return [];
  return raw.split(",").slice(0, 4).map((name) => ({
    name: name.trim(),
    role: "Cast",
  }));
}

function parseDirector(raw: string | undefined): string {
  if (!raw || raw === "N/A") return "Unknown";
  return raw.split(",")[0]?.trim() || "Unknown";
}

export function mapOmdbSearchItem(item: OmdbSearchItem): Movie {
  const poster = parsePoster(item.Poster);
  const mediaType = item.Type === "series" ? "tv" : "movie";
  return {
    id: item.imdbID,
    mediaType,
    title: item.Title,
    tagline: "",
    overview: "",
    posterPath: poster,
    backdropPath: poster,
    rating: 0,
    year: parseYear(item.Year),
    runtime: 0,
    genres: ["Drama"],
    director: "Unknown",
    cast: [],
  };
}

export function mapOmdbDetail(data: OmdbMovieResponse): Movie {
  const poster = parsePoster(data.Poster);
  const awards = data.Awards && data.Awards !== "N/A" ? data.Awards : "";
  const rottenTomatoes = data.Ratings?.find((rating) => rating.Source === "Rotten Tomatoes")?.Value;

  return {
    id: data.imdbID,
    mediaType: data.Type === "series" ? "tv" : "movie",
    title: data.Title,
    tagline: awards ? awards.split(".")[0] : "",
    overview: data.Plot && data.Plot !== "N/A" ? data.Plot : "No synopsis available.",
    posterPath: poster,
    backdropPath: poster,
    rating: parseRating(data.imdbRating),
    year: parseYear(data.Year),
    runtime: parseRuntime(data.Runtime),
    genres: parseGenres(data.Genre),
    director: parseDirector(data.Director),
    cast: parseCast(data.Actors),
    externalRatings: {
      imdb: parseRating(data.imdbRating) || undefined,
      rottenTomatoes: rottenTomatoes ? Number.parseInt(rottenTomatoes, 10) || undefined : undefined,
      metascore: parseRating(data.Metascore) || undefined,
    },
  };
}
