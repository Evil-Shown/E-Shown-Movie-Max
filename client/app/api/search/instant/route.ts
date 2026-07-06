import { searchCatalog } from "@/lib/movie-service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const catalog = await searchCatalog(q, 1, "all");
    return NextResponse.json({
      results: catalog.movies.slice(0, 8),
    });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
