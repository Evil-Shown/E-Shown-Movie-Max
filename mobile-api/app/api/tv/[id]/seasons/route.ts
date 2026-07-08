import { NextResponse } from 'next/server';
import { fetchTvSeason, fetchTvSeasons, isTmdbConfigured } from '@/lib/tmdb/client';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const tvId = Number(id.replace(/^tv-/, ''));

  if (!Number.isFinite(tvId) || !isTmdbConfigured()) {
    return NextResponse.json({ seasons: [] });
  }

  try {
    const data = await fetchTvSeasons(tvId);
    const seasons = data.seasons.filter((s) => s.season_number > 0);
    return NextResponse.json({ seasons });
  } catch {
    return NextResponse.json({ seasons: [] }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const tvId = Number(id.replace(/^tv-/, ''));
  try {
    const body = (await request.json()) as { season?: number };
    if (!Number.isFinite(tvId) || body.season == null || !isTmdbConfigured()) {
      return NextResponse.json({ episodes: [] });
    }
    const data = await fetchTvSeason(tvId, body.season);
    return NextResponse.json({ episodes: data.episodes });
  } catch {
    return NextResponse.json({ episodes: [] }, { status: 500 });
  }
}