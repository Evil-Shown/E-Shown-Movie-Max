import { mapTmdbGenreIds } from "@/lib/tmdb/genres";
import { fetchOmdbByTitle, isOmdbConfigured } from "@/lib/omdb/client";
import { mapOmdbDetail } from "@/lib/omdb/map";
import { isTmdbConfigured, searchTmdbMovies } from "@/lib/tmdb/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim() ?? "";
  const year = searchParams.get("year")?.trim() ?? "";

  if (!title) {
    return NextResponse.json(null, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  }

  if (!isTmdbConfigured()) {
    return NextResponse.json(null, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const response = await searchTmdbMovies(title, 1);
    const hit =
      year
        ? response.results.find((item) => item.release_date?.startsWith(year)) ?? response.results[0]
        : response.results[0];

    const payload = hit
      ? {
          poster_path: hit.poster_path ?? null,
          overview: hit.overview ?? "",
          vote_average: hit.vote_average ?? 0,
          genres: mapTmdbGenreIds(hit.genre_ids ?? []),
          externalRatings: await loadExternalRatings(title, year),
        }
      : null;

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(null, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  }
}

async function loadExternalRatings(title: string, year: string) {
  if (!isOmdbConfigured()) return null;

  try {
    const detail = await fetchOmdbByTitle(title, year ? Number(year) : undefined);
    if (detail.Response !== "True") return null;
    const mapped = mapOmdbDetail(detail);
    return mapped.externalRatings ?? null;
  } catch {
    return null;
  }
}
