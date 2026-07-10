import { getHomeCatalog } from "@/lib/movie-service";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const catalog = await getHomeCatalog();
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "public, max-age=900, stale-while-revalidate=86400",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load home catalog" },
      { status: 500 }
    );
  }
}
