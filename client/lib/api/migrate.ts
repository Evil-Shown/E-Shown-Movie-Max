import { getWatchlist } from "@/lib/storage/watchlist";
import { getContinueWatching } from "@/lib/storage/continue-watching";
import { watchlistApi } from "./watchlist";
import { continueWatchingApi } from "./continue-watching";
import { episodesApi } from "./episodes";
import { syncBackendToLocalStorage } from "./sync";

const MIGRATION_FLAG = "chithra-data-migrated";

export async function migrateLocalStorageToBackend(token: string): Promise<void> {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(MIGRATION_FLAG) === "true") return;

  const watchlist = getWatchlist();
  const continueWatching = getContinueWatching();

  // Migrate watchlist
  for (const item of watchlist) {
    try {
      await watchlistApi(token).add(item);
    } catch (error) {
      console.warn("Failed to migrate watchlist item", item, error);
    }
  }

  // Migrate continue watching
  for (const item of continueWatching) {
    try {
      await continueWatchingApi(token).upsert(item);
    } catch (error) {
      console.warn("Failed to migrate continue watching item", item, error);
    }
  }

  // Migrate watched episodes
  try {
    const raw = localStorage.getItem("chithra-episode-progress");
    if (raw) {
      const allWatched = JSON.parse(raw) as Record<string, boolean>;
      for (const [key, value] of Object.entries(allWatched)) {
        if (value) {
          const match = key.match(/^(.+):s(\d+)e(\d+)$/);
          if (match) {
            const [, tvdbId, season, episode] = match;
            try {
              await episodesApi(token).markWatched(tvdbId, Number(season), Number(episode));
            } catch (error) {
              console.warn("Failed to migrate watched episode", key, error);
            }
          }
        }
      }
    }
  } catch (error) {
    console.warn("Failed to migrate watched episodes", error);
  }

  localStorage.setItem(MIGRATION_FLAG, "true");

  // Also pull any existing backend data down to localStorage
  await syncBackendToLocalStorage(token);
}
