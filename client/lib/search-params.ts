import { allGenres } from "@/lib/movies";
import type { SearchMediaFilter, SearchSort } from "@/lib/movie-service";
import type { Genre } from "@/lib/types";

export interface SearchPageParams {
  q: string;
  page: number;
  type: SearchMediaFilter;
  genre: Genre | null;
  year: number | null;
  sort: SearchSort;
  minRating: number | null;
}

const VALID_SORTS: SearchSort[] = ["popular", "top_rated", "newest"];
const VALID_RATINGS = [6, 7, 8, 9];
const CURRENT_YEAR = new Date().getFullYear();

export function parseSearchPageParams(raw: {
  q?: string;
  page?: string;
  type?: string;
  genre?: string;
  year?: string;
  sort?: string;
  rating?: string;
}): SearchPageParams {
  const typeRaw = raw.type;
  const type: SearchMediaFilter =
    typeRaw === "tv" || typeRaw === "all" || typeRaw === "anime" ? typeRaw : "movie";

  const genreParam = raw.genre?.trim();
  const genre =
    genreParam && allGenres.includes(genreParam as Genre) ? (genreParam as Genre) : null;

  const yearParsed = Number.parseInt(raw.year ?? "", 10);
  const year =
    Number.isFinite(yearParsed) && yearParsed >= 1900 && yearParsed <= CURRENT_YEAR + 1
      ? yearParsed
      : null;

  const sort = VALID_SORTS.includes(raw.sort as SearchSort) ? (raw.sort as SearchSort) : "popular";

  const ratingParsed = Number.parseInt(raw.rating ?? "", 10);
  const minRating = VALID_RATINGS.includes(ratingParsed) ? ratingParsed : null;

  return {
    q: raw.q?.trim() ?? "",
    page: Math.max(1, Number.parseInt(raw.page ?? "1", 10) || 1),
    type,
    genre,
    year,
    sort,
    minRating,
  };
}

export function hasActiveSearchFilters(
  params: Pick<SearchPageParams, "genre" | "year" | "sort" | "minRating">
): boolean {
  return Boolean(params.genre || params.year || params.minRating || params.sort !== "popular");
}

export function searchFiltersToQueryRecord(
  params: Pick<SearchPageParams, "q" | "type" | "genre" | "year" | "sort" | "minRating">
): Record<string, string | undefined> {
  return {
    q: params.q || undefined,
    type: params.type !== "movie" ? params.type : undefined,
    genre: params.genre ?? undefined,
    year: params.year ? String(params.year) : undefined,
    sort: params.sort !== "popular" ? params.sort : undefined,
    rating: params.minRating ? String(params.minRating) : undefined,
  };
}

export function buildSearchPath(
  updates: Partial<SearchPageParams>,
  current?: SearchPageParams
): string {
  const merged: SearchPageParams = {
    q: current?.q ?? "",
    page: 1,
    type: current?.type ?? "movie",
    genre: current?.genre ?? null,
    year: current?.year ?? null,
    sort: current?.sort ?? "popular",
    minRating: current?.minRating ?? null,
    ...updates,
  };

  if (updates.q !== undefined || updates.type !== undefined || updates.genre !== undefined) {
    merged.page = 1;
  }
  if (
    updates.genre !== undefined ||
    updates.year !== undefined ||
    updates.sort !== undefined ||
    updates.minRating !== undefined ||
    updates.type !== undefined
  ) {
    merged.page = 1;
  }

  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.type !== "movie") params.set("type", merged.type);
  if (merged.genre) params.set("genre", merged.genre);
  if (merged.year) params.set("year", String(merged.year));
  if (merged.sort !== "popular") params.set("sort", merged.sort);
  if (merged.minRating) params.set("rating", String(merged.minRating));
  if (merged.page > 1) params.set("page", String(merged.page));

  const qs = params.toString();
  return qs ? `/search?${qs}` : "/search";
}

export function yearOptions(): number[] {
  return Array.from({ length: CURRENT_YEAR - 1969 }, (_, i) => CURRENT_YEAR - i);
}

export function searchMediaLabel(filter: SearchMediaFilter = "movie"): string {
  if (filter === "tv") return "TV series";
  if (filter === "all") return "titles";
  if (filter === "anime") return "anime titles";
  return "movies";
}
