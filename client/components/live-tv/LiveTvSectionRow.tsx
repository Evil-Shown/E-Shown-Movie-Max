"use client";

import LiveTvChannelCard from "@/components/live-tv/LiveTvChannelCard";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import { memo, type ReactNode } from "react";

interface LiveTvSectionRowProps {
  title: string;
  subtitle?: string;
  channels: LiveTvChannel[];
  selectedChannelId?: string | null;
  favoriteIds: Set<string>;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite: (channel: LiveTvChannel) => void;
  emptyState?: ReactNode;
}

function LiveTvSectionRow({
  title,
  subtitle,
  channels,
  selectedChannelId,
  favoriteIds,
  onSelect,
  onToggleFavorite,
  emptyState,
}: LiveTvSectionRowProps) {
  if (channels.length === 0) {
    return emptyState ? <div className="mb-10">{emptyState}</div> : null;
  }

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
          )}
        </div>
        <span className="shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1 text-xs text-[var(--text-muted)]">
          {channels.length} channel{channels.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4 pt-1 scrollbar-thin sm:gap-4">
        {channels.map((channel) => (
          <div key={channel.id} className="w-[132px] shrink-0 sm:w-[148px]">
            <LiveTvChannelCard
              channel={channel}
              compact
              isSelected={selectedChannelId === channel.id}
              isFavorite={favoriteIds.has(channel.id)}
              onSelect={onSelect}
              onToggleFavorite={onToggleFavorite}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default memo(LiveTvSectionRow);
