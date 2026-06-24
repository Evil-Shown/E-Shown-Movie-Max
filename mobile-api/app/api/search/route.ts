import { NextResponse } from 'next/server';
import { searchCatalog, type SearchMediaFilter } from '@/lib/movie-service';

const VALID_FILTERS: SearchMediaFilter[] = ['movie', 'tv', 'all'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const mediaParam = searchParams.get('media') ?? 'all';
  const media = (VALID_FILTERS.includes(mediaParam as SearchMediaFilter)
    ? mediaParam
    : 'all') as SearchMediaFilter;

  if (query.length < 2) {
    return NextResponse.json({ movies: [], source: 'local', page: 1, totalPages: 1, totalResults: 0 });
  }

  try {
    const result = await searchCatalog(query, page, media);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { movies: [], source: 'local', page: 1, totalPages: 1, totalResults: 0 },
      { status: 500 }
    );
  }
}
