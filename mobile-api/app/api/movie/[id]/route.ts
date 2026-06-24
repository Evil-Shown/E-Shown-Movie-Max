import { NextResponse } from 'next/server';
import { resolveMovie } from '@/lib/movie-service';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: 'Missing movie id' }, { status: 400 });
  }

  try {
    const movie = await resolveMovie(decodeURIComponent(id));
    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 });
    }
    return NextResponse.json(movie);
  } catch {
    return NextResponse.json({ error: 'Failed to resolve movie' }, { status: 500 });
  }
}
