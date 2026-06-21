"use client";

import LiveTvChannelCard from "@/components/live-tv/LiveTvChannelCard";
import type { LiveTvChannel } from "@/lib/live-tv/types";

interface LiveTvChannelGridProps {
  channels: LiveTvChannel[];
  selectedChannelId?: string | null;
  favoriteIds: Set<string>;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite: (channel: LiveTvChannel) => void;
}

export default function LiveTvChannelGrid({
  channels,
  selectedChannelId,
  favoriteIds,
  onSelect,
  onToggleFavorite,
}: LiveTvChannelGridProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {channels.map((channel, index) => (
        <LiveTvChannelCard
          key={channel.id}
          channel={channel}
          isSelected={selectedChannelId === channel.id}
          isFavorite={favoriteIds.has(channel.id)}
          priorityLogo={index < 14}
          onSelect={onSelect}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}
