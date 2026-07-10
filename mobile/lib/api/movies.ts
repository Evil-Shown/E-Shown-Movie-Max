import { apiGet, apiPost } from './client';
import type {
  BrowseResult,
  BrowseSort,
  HomeCatalog,
  SearchMediaFilter,
  SimilarMoviesResult,
  TvEpisodesResult,
  TvSeasonsResult,
} from './types';
import type { Genre, Movie } from '@chithra/core/types';

export async function fetchHomeCatalog(): Promise<HomeCatalog> {
  return apiGet<HomeCatalog>('/api/home');
}

export async function fetchBrowseCatalog(params: {
  page?: number;
  genre?: Genre | null;
  sort?: BrowseSort;
}): Promise<BrowseResult> {
  const search = new URLSearchParams();
  if (params.page) search.set('page', String(params.page));
  if (params.genre) search.set('genre', params.genre);
  if (params.sort) search.set('sort', params.sort);
  return apiGet<BrowseResult>(`/api/browse?${search.toString()}`);
}

export async function searchMovies(
  query: string,
  page = 1,
  media: SearchMediaFilter = 'all'
): Promise<BrowseResult> {
  const search = new URLSearchParams({ q: query, page: String(page), media });
  return apiGet<BrowseResult>(`/api/search?${search.toString()}`);
}

export async function fetchMovieDetail(id: string): Promise<Movie> {
  return apiGet<Movie>(`/api/movie/${encodeURIComponent(id)}`);
}

export async function fetchSimilarMovies(id: string, limit = 8): Promise<Movie[]> {
  const result = await apiGet<SimilarMoviesResult>(
    `/api/movie/${encodeURIComponent(id)}/similar?limit=${limit}`
  );
  return result.movies;
}

export async function fetchTvSeasons(tvId: string): Promise<TvSeasonsResult> {
  return apiGet<TvSeasonsResult>(`/api/tv/${encodeURIComponent(tvId)}/seasons`);
}

export async function fetchTvEpisodes(tvId: string, season: number): Promise<TvEpisodesResult> {
  return apiPost<TvEpisodesResult>(`/api/tv/${encodeURIComponent(tvId)}/seasons`, { season });
}
