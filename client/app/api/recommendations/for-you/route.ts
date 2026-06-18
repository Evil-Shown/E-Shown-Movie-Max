import { getForYouRecommendations } from "@/lib/recommendations/for-you-service";
import type { TasteProfilePayload } from "@/lib/recommendations/taste-profile";
import type { Genre } from "@/lib/types";

const VALID_GENRES = new Set<Genre>([
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
]);

function sanitizeProfile(body: unknown): TasteProfilePayload | null {
  if (!body || typeof body !== "object") return null;
  const raw = body as Partial<TasteProfilePayload>;

  const genreWeights = Array.isArray(raw.genreWeights)
    ? raw.genreWeights
        .filter(
          (entry): entry is { genre: Genre; weight: number } =>
            Boolean(entry) &&
            typeof entry === "object" &&
            typeof (entry as { weight?: unknown }).weight === "number" &&
            VALID_GENRES.has((entry as { genre?: string }).genre as Genre)
        )
        .map((entry) => ({ genre: entry.genre, weight: Math.max(0, entry.weight) }))
    : [];

  const excludeIds = Array.isArray(raw.excludeIds)
    ? raw.excludeIds.filter((id): id is string => typeof id === "string").slice(0, 300)
    : [];

  const mediaPreference =
    raw.mediaPreference === "movie" || raw.mediaPreference === "tv" ? raw.mediaPreference : "mixed";

  return {
    genreWeights,
    excludeIds,
    mediaPreference,
    hasSignals: Boolean(raw.hasSignals) || genreWeights.length > 0,
  };
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ movies: [], hasSignals: false }, { status: 400 });
  }

  const profile = sanitizeProfile(body);
  if (!profile) {
    return Response.json({ movies: [], hasSignals: false }, { status: 400 });
  }

  const result = await getForYouRecommendations(profile);

  return Response.json(result, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}
