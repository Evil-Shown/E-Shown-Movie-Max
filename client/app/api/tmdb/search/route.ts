import { loadExternalRatingsForItem } from "@/lib/external-ratings";
import { mapTmdbGenreIds } from "@/lib/tmdb/genres";
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
    const hit = year
      ? (response.results.find((item) => item.release_date?.startsWith(year)) ?? response.results[0])
      : response.results[0];

    const payload = hit
      ? {
          poster_path: hit.poster_path ?? null,
          overview: hit.overview ?? "",
          vote_average: hit.vote_average ?? 0,
          genres: mapTmdbGenreIds(hit.genre_ids ?? []),
          externalRatings: await loadExternalRatingsForItem({
            id: title,
            title,
            year: year ? Number(year) : undefined,
          }),
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
