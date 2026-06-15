import { browseCatalog, type BrowseSort } from "@/lib/movie-service";
import { allGenres } from "@/lib/movies";
import type { Genre } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, Number.parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const genreParam = searchParams.get("genre");
  const sortParam = searchParams.get("sort") ?? "popular";
  const sort = (["popular", "top_rated", "now_playing"].includes(sortParam)
    ? sortParam
    : "popular") as BrowseSort;
  const activeGenre =
    genreParam && allGenres.includes(genreParam as Genre) ? (genreParam as Genre) : null;

  const result = await browseCatalog({
    genre: activeGenre,
    page,
    pages: 1,
    sort,
  });

  return Response.json(result);
}
