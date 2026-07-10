import type { Movie } from "@/lib/types";
import { isTvShow } from "@/lib/streaming";
import { warmStreamProvidersForPlayback } from "@/lib/stream-optimizer";

const prefetchedKeys = new Set<string>();

/**
 * Warm DNS/TLS to embed hosts and prefetch the cached sources API response
 * before the user opens the player.
 */
export function prefetchMovieStream(movie: Movie, options?: { season?: number; episode?: number; seek?: number }) {
  if (typeof window === "undefined") return;

  warmStreamProvidersForPlayback();

  const season = options?.season ?? (isTvShow(movie) ? 1 : undefined);
  const episode = options?.episode ?? (isTvShow(movie) ? 1 : undefined);
  const key = `${movie.id}:${season ?? 0}:${episode ?? 0}:${options?.seek ?? 0}`;
  if (prefetchedKeys.has(key)) return;
  prefetchedKeys.add(key);

  const params = new URLSearchParams();
  params.set("type", isTvShow(movie) ? "tv" : "movie");
  if (season) params.set("season", String(season));
  if (episode) params.set("episode", String(episode));
  if (options?.seek && options.seek > 0) params.set("seek", String(options.seek));

  void fetch(`/api/sources/${encodeURIComponent(movie.id)}?${params.toString()}`, {
    cache: "force-cache",
  }).catch(() => undefined);
}
