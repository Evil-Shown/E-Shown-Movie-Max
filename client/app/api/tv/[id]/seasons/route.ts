import { fetchTvSeason, fetchTvSeasons, isTmdbConfigured } from "@/lib/tmdb/client";
import { NextResponse } from "next/server";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { id } = await params;
  const tvId = Number(id.replace(/^tv-/, ""));

  if (!Number.isFinite(tvId) || !isTmdbConfigured()) {
    return NextResponse.json({ seasons: [] }, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const data = await fetchTvSeasons(tvId);
    const seasons = data.seasons.filter((s) => s.season_number > 0);
    return NextResponse.json(
      { seasons },
      {
        headers: {
          "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { seasons: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=3600",
        },
      }
    );
  }
}

export async function POST(request: Request, { params }: RouteParams) {
  const { id } = await params;
  const tvId = Number(id.replace(/^tv-/, ""));
  const body = (await request.json()) as { season?: number };

  if (!Number.isFinite(tvId) || !body.season || !isTmdbConfigured()) {
    return NextResponse.json({ episodes: [] }, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const data = await fetchTvSeason(tvId, body.season);
    return NextResponse.json(
      { episodes: data.episodes },
      {
        headers: {
          "Cache-Control": "public, max-age=21600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { episodes: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=3600",
        },
      }
    );
  }
}
