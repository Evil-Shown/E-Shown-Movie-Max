import { fetchOmdbByImdbId, fetchOmdbByTitle, isOmdbConfigured } from "@/lib/omdb/client";
import { mapOmdbDetail } from "@/lib/omdb/map";
import type { Movie } from "@/lib/types";

export type ExternalRatings = NonNullable<Movie["externalRatings"]>;

export interface ExternalRatingsItem {
  id: string;
  title: string;
  year?: number;
  imdbId?: string;
}

export async function loadExternalRatingsForItem(item: ExternalRatingsItem): Promise<ExternalRatings | null> {
  if (!isOmdbConfigured()) return null;

  try {
    const detail = item.imdbId ? await fetchOmdbByImdbId(item.imdbId) : await fetchOmdbByTitle(item.title, item.year);

    if (detail.Response !== "True") return null;
    return mapOmdbDetail(detail).externalRatings ?? null;
  } catch {
    return null;
  }
}

export async function batchLoadExternalRatings(
  items: ExternalRatingsItem[],
  concurrency = 5
): Promise<Record<string, ExternalRatings>> {
  const unique = [...new Map(items.map((item) => [item.id, item])).values()];
  const ratings: Record<string, ExternalRatings> = {};

  for (let index = 0; index < unique.length; index += concurrency) {
    const chunk = unique.slice(index, index + concurrency);
    const results = await Promise.all(
      chunk.map(async (item) => ({
        id: item.id,
        value: await loadExternalRatingsForItem(item),
      }))
    );

    for (const { id, value } of results) {
      if (value) ratings[id] = value;
    }
  }

  return ratings;
}
