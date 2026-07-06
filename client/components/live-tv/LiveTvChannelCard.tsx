"use client";

import { memo } from "react";
import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import { prefetchChannelStream } from "@/lib/live-tv/stream-cache";
import { getStreamForChannel } from "@/lib/live-tv/streams";
import type { LiveTvChannel } from "@/lib/live-tv/types";
import ChannelLogo from "@/components/live-tv/ChannelLogo";

interface LiveTvChannelCardProps {
  channel: LiveTvChannel;
  isSelected?: boolean;
  isFavorite?: boolean;
  compact?: boolean;
  priorityLogo?: boolean;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite?: (channel: LiveTvChannel) => void;
}

function LiveTvChannelCard({
  channel,
  isSelected = false,
  isFavorite = false,
  compact = false,
  priorityLogo = false,
  onSelect,
  onToggleFavorite,
}: LiveTvChannelCardProps) {
  const hasStream = Boolean(channel.stream ?? getStreamForChannel(channel.id));

  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      onMouseEnter={() => prefetchChannelStream(channel.id)}
      onFocus={() => prefetchChannelStream(channel.id)}
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl border text-left transition-all duration-200 ${
        compact ? "min-w-[128px]" : ""
      } ${
        isSelected
          ? "gold-glow border-[var(--accent-primary)] bg-[var(--bg-card)]"
          : "border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-sm)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md)]"
      }`}
      aria-pressed={isSelected}
      aria-label={`Watch ${channel.name}`}
    >
      {/* Logo stage — matches hero featured tiles */}
      <div
        className={`relative flex w-full items-center justify-center bg-[var(--bg-secondary)] ${
          compact ? "aspect-square p-3" : "aspect-[4/3] p-4 sm:p-5"
        }`}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(circle at 50% 38%, rgba(201, 106, 43, 0.1), transparent 52%)",
          }}
        />

        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-card)] shadow-sm ${
            compact ? "size-12" : "size-14 sm:size-16"
          }`}
        >
          <ChannelLogo
            channel={channel}
            variant="tile"
            priority={priorityLogo || isSelected}
            className={compact ? "size-9" : "size-10 sm:size-11"}
          />
        </div>

        <span
          className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-[var(--bg-secondary)] ${
            hasStream ? "bg-emerald-500" : "bg-amber-400"
          }`}
          title={hasStream ? "Stream ready" : "Resolves on play"}
          aria-hidden
        />

        {channel.isHd && (
          <span className="absolute left-2 top-2 rounded border border-[var(--border)] bg-[var(--bg-card)]/95 px-1 py-px text-[7px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            HD
          </span>
        )}

        {isSelected && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--accent-primary)] px-2 py-px text-[7px] font-bold uppercase tracking-wider text-[var(--text-inverse)]">
            Live
          </span>
        )}

        {onToggleFavorite && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(channel);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite(channel);
              }
            }}
            aria-label={
              isFavorite
                ? `Remove ${channel.name} from favorites`
                : `Add ${channel.name} to favorites`
            }
            className={`absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all ${
              isFavorite
                ? "border-[var(--accent-primary)] bg-[var(--gold-dim)] text-[var(--accent-primary)] opacity-100"
                : "border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] opacity-0 shadow-sm group-hover:opacity-100 hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-3 w-3"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </span>
        )}
      </div>

      <div
        className={`border-t border-[var(--border)] bg-[var(--bg-card)] ${
          compact ? "px-2 py-1.5" : "px-2.5 py-2"
        }`}
      >
        <h3
          className={`truncate font-medium leading-tight text-[var(--text-primary)] ${
            compact ? "text-[10px]" : "text-xs sm:text-[13px]"
          }`}
        >
          {channel.name}
        </h3>
        <p className="mt-0.5 truncate text-[9px] text-[var(--text-muted)]">
          {LIVE_TV_CATEGORY_LABELS[channel.category]}
          {channel.region === "local" ? " · LK" : ""}
        </p>
      </div>
    </button>
  );
}

export default memo(LiveTvChannelCard);
