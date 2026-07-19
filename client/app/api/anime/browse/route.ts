import { browseAnimeCatalog, type AnimeMediaType, type AnimeSort } from "@/lib/movie-service";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const mediaType = searchParams.get("mediaType") === "tv" ? "tv" : "movie";
    const sortParam = searchParams.get("sort") ?? "popular";
    const sort = (["popular", "top_rated", "trending"].includes(sortParam)
      ? sortParam
      : "popular") as AnimeSort;

    const result = await browseAnimeCatalog({
      mediaType: mediaType as AnimeMediaType,
      page,
      pages: 1,
      sort,
    });

    return Response.json(result, {
      headers: {
        "Cache-Control": "public, max-age=900, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("API Error [/api/anime/browse]:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
