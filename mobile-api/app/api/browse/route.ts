import { NextResponse } from 'next/server';
import { browseCatalog, type BrowseSort } from '@/lib/movie-service';
import { allGenres } from '@/lib/movies';
import type { Genre } from '@/lib/types';

const VALID_SORTS: BrowseSort[] = ['popular', 'top_rated', 'now_playing'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const genreParam = searchParams.get('genre');
  const sortParam = searchParams.get('sort') ?? 'popular';

  const sort = (VALID_SORTS.includes(sortParam as BrowseSort)
    ? sortParam
    : 'popular') as BrowseSort;

  const activeGenre =
    genreParam && allGenres.includes(genreParam as Genre) ? (genreParam as Genre) : null;

  try {
    const result = await browseCatalog({ genre: activeGenre, page, pages: 1, sort });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { movies: [], source: 'local', page: 1, totalPages: 1, totalResults: 0, lastLoadedPage: 1 },
      { status: 500 }
    );
  }
}
