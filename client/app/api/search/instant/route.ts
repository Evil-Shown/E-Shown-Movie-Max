import { searchCatalog } from "@/lib/movie-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] }, {
      headers: {
        "Cache-Control": "public, max-age=300, stale-while-revalidate=86400",
      },
    });
  }

  try {
    const catalog = await searchCatalog(q, 1, "all");
    return NextResponse.json(
      {
        results: catalog.movies.slice(0, 8),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=900, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { results: [] },
      {
        status: 500,
        headers: {
          "Cache-Control": "public, max-age=60, stale-while-revalidate=3600",
        },
      }
    );
  }
}
