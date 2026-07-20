"use client";

import { useQuery, type UseQueryResult } from "@tanstack/react-query";

// ── BFF Response Types ────────────────────────────────────────────

export interface MovieSummary {
  id: string;
  title: string;
  posterUrl: string | null;
  year: number;
  rating: number;
  genres: string[];
}

export interface MovieDetail {
  id: string;
  title: string;
  tagline: string;
  overview: string;
  posterUrl: string | null;
  backdropUrl: string | null;
  year: number;
  runtime: number;
  rating: number;
  genres: string[];
  director: string;
  cast: { name: string; role: string }[];
  trailerKey: string | null;
  mediaType: "movie";
}

export interface MoviePageData {
  movie: MovieDetail;
  similar: MovieSummary[];
  meta: { cached: boolean; fetchedAt: string };
}

export interface HomePageData {
  hero: MovieDetail[];
  trending: MovieSummary[];
  trendingDay: MovieSummary[];
  newReleases: MovieSummary[];
  topRated: MovieSummary[];
  popularTv: MovieSummary[];
  meta: { cached: boolean; fetchedAt: string };
}

export interface BrowsePageData {
  movies: MovieSummary[];
  totalPages: number;
  totalResults: number;
  genre: string;
  sort: string;
  meta: { cached: boolean; fetchedAt: string };
}

// ── Fetch Utility ─────────────────────────────────────────────────

interface BffResponse<T> {
  success: boolean;
  data: T;
  error?: { code: string; message: string };
}

async function fetchBffData<T>(path: string): Promise<T> {
  const res = await fetch(path);
  if (!res.ok) {
    throw new Error(`BFF request failed: ${res.status} ${res.statusText}`);
  }
  const json = (await res.json()) as BffResponse<T>;
  if (!json.success) {
    throw new Error(json.error?.message ?? "Unknown BFF error");
  }
  return json.data;
}

// ── Query Keys ────────────────────────────────────────────────────

export const bffKeys = {
  all: ["bff"] as const,
  homePage: () => [...bffKeys.all, "home-page"] as const,
  moviePage: (id: string) => [...bffKeys.all, "movie-page", id] as const,
  browsePage: (genre: string, sort: string, page: number) =>
    [...bffKeys.all, "browse-page", genre, sort, page] as const,
};

// ── Hooks ─────────────────────────────────────────────────────────

const FIVE_MINUTES = 5 * 60 * 1000;
const FIFTEEN_MINUTES = 15 * 60 * 1000;

/**
 * Fetch aggregated home page data.
 * Cached by React Query for 5 minutes (staleTime), Redis for 15 minutes.
 */
export function useHomePage(): UseQueryResult<HomePageData> {
  return useQuery({
    queryKey: bffKeys.homePage(),
    queryFn: () => fetchBffData<HomePageData>("/api/v1/home-page"),
    staleTime: FIVE_MINUTES,
    gcTime: FIFTEEN_MINUTES,
    refetchOnWindowFocus: false,
  });
}

/**
 * Fetch aggregated movie detail page data.
 * Cached by React Query for 5 minutes (staleTime), Redis for 15 minutes.
 */
export function useMoviePage(id: string): UseQueryResult<MoviePageData> {
  return useQuery({
    queryKey: bffKeys.moviePage(id),
    queryFn: () => fetchBffData<MoviePageData>(`/api/v1/movie-page/${id}`),
    staleTime: FIVE_MINUTES,
    gcTime: FIFTEEN_MINUTES,
    refetchOnWindowFocus: false,
    enabled: !!id,
  });
}

/**
 * Fetch aggregated browse page data.
 * Cached by React Query for 5 minutes (staleTime), Redis for 15 minutes.
 */
export function useBrowsePage(
  genre: string = "",
  sort: string = "popular",
  page: number = 1
): UseQueryResult<BrowsePageData> {
  return useQuery({
    queryKey: bffKeys.browsePage(genre, sort, page),
    queryFn: () => {
      const params = new URLSearchParams();
      if (genre) params.set("genre", genre);
      if (sort) params.set("sort", sort);
      params.set("page", String(page));
      return fetchBffData<BrowsePageData>(`/api/v1/browse-page?${params.toString()}`);
    },
    staleTime: FIVE_MINUTES,
    gcTime: FIFTEEN_MINUTES,
    refetchOnWindowFocus: false,
  });
}
