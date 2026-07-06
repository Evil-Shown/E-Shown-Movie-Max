import { NextResponse } from 'next/server';
import { resolveMovie, getSimilarMovies } from '@/lib/movie-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const limit = Math.max(1, Math.min(20, Number.parseInt(searchParams.get('limit') ?? '8', 10) || 8));

  if (!id) {
    return NextResponse.json({ movies: [] }, { status: 400 });
  }

  try {
    const movie = await resolveMovie(decodeURIComponent(id));
    if (!movie) {
      return NextResponse.json({ movies: [] }, { status: 404 });
    }
    const similar = await getSimilarMovies(movie, limit);
    return NextResponse.json({ movies: similar });
  } catch {
    return NextResponse.json({ movies: [] }, { status: 500 });
  }
}
