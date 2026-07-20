import { getHomeCatalog } from "@/lib/movie-service";
import { cacheJson } from "@/lib/cache/request-cache";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const catalog = await cacheJson("home-catalog", 900_000, () => getHomeCatalog());
    return NextResponse.json(catalog, {
      headers: {
        "Cache-Control": "public, max-age=900, stale-while-revalidate=86400",
        "X-Cache": "REDIS",
      },
    });
  } catch (error) {
    console.error("API Error [/api/home]:", error);
    return NextResponse.json({ error: "Failed to load home catalog" }, { status: 500 });
  }
}
