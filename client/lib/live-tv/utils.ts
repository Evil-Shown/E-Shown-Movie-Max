import { LIVE_TV_CATEGORY_LABELS } from "./channels";
import type { LiveTvCategoryFilter, LiveTvChannel } from "./types";

export function filterChannels(
  channels: LiveTvChannel[],
  query: string,
  category: LiveTvCategoryFilter
): LiveTvChannel[] {
  const normalizedQuery = query.trim().toLowerCase();

  return channels.filter((channel) => {
    const matchesCategory = category === "all" || channel.category === category;
    if (!matchesCategory) return false;

    if (!normalizedQuery) return true;

    const categoryLabel = LIVE_TV_CATEGORY_LABELS[channel.category].toLowerCase();
    const regionLabel = channel.region === "local" ? "local" : "international";

    return (
      channel.name.toLowerCase().includes(normalizedQuery) ||
      categoryLabel.includes(normalizedQuery) ||
      regionLabel.includes(normalizedQuery)
    );
  });
}
