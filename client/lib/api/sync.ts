import { getWatchlist, toggleWatchlistItem } from "@/lib/storage/watchlist";
import { getContinueWatching, upsertContinueWatching } from "@/lib/storage/continue-watching";
import { watchlistApi } from "./watchlist";
import { continueWatchingApi } from "./continue-watching";

export async function syncBackendToLocalStorage(token: string): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const watchlistResult = await watchlistApi(token).getAll();
    if (watchlistResult.success && watchlistResult.data) {
      const existingIds = new Set(getWatchlist().map((item) => item.tmdbId));
      for (const item of watchlistResult.data) {
        if (!existingIds.has(item.tmdbId)) {
          toggleWatchlistItem({
            id: item.tmdbId,
            title: item.title,
            posterPath: item.posterPath || "",
            mediaType: item.mediaType as "movie" | "tv",
            tmdbId: item.tmdbId,
            year: item.year || 0,
            rating: item.rating || 0,
            genres: item.genres?.split(",").map((g) => ({ id: 0, name: g.trim() })) as unknown as never,
            addedAt: new Date(item.addedAt).getTime(),
          });
        }
      }
    }
  } catch (error) {
    console.warn("Failed to sync watchlist from backend", error);
  }

  try {
    const continueResult = await continueWatchingApi(token).getAll();
    if (continueResult.success && continueResult.data) {
      const existingIds = new Set(getContinueWatching().map((item) => `${item.tmdbId}:${item.season}:${item.episode}`));
      for (const item of continueResult.data) {
        const key = `${item.tmdbId}:${item.season}:${item.episode}`;
        if (!existingIds.has(key)) {
          upsertContinueWatching({
            id: item.tmdbId,
            title: item.title,
            posterPath: item.posterPath || "",
            mediaType: item.mediaType as "movie" | "tv",
            tmdbId: item.tmdbId,
            progress: item.progress,
            currentTime: item.currentTime,
            duration: item.duration,
            season: item.season ?? undefined,
            episode: item.episode ?? undefined,
            provider: (item.provider || "vidfast") as never,
            updatedAt: new Date(item.updatedAt).getTime(),
          });
        }
      }
    }
  } catch (error) {
    console.warn("Failed to sync continue watching from backend", error);
  }

  try {
    // We don't have a bulk endpoint for episodes, so we skip initial sync
    // and rely on per-show fetches when needed.
  } catch (error) {
    console.warn("Failed to sync episodes from backend", error);
  }
}
