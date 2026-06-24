"use client";

import { memo } from "react";
import { LIVE_TV_CATEGORY_LABELS } from "@/lib/live-tv/channels";
import { getChannelPosterStyles } from "@/lib/live-tv/posters";
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
  const posterStyle = getChannelPosterStyles(channel);

  return (
    <button
      type="button"
      onClick={() => onSelect(channel)}
      onMouseEnter={() => prefetchChannelStream(channel.id)}
      onFocus={() => prefetchChannelStream(channel.id)}
      className={`group relative flex w-full flex-col overflow-hidden rounded-xl text-left ${
        compact ? "min-w-[128px]" : ""
      }`}
      aria-pressed={isSelected}
      aria-label={`Watch ${channel.name}`}
      style={{
        backgroundColor: posterStyle.backgroundColor,
        backgroundImage: posterStyle.backgroundImage,
        backgroundSize: "cover",
        backgroundPosition: "center",
        // Premium border: amber/gold glow ring that intensifies on selected
        border: isSelected
          ? "1.5px solid rgba(245,158,11,0.85)"
          : "1.5px solid rgba(245,158,11,0.12)",
        // Layered shadow: depth + outer glow
        boxShadow: isSelected
          ? "0 0 0 3px rgba(245,158,11,0.18), 0 0 18px 4px rgba(234,88,12,0.22), 0 8px 32px rgba(0,0,0,0.55)"
          : "0 2px 8px rgba(0,0,0,0.35)",
        transform: "scale(1)",
        willChange: "transform, box-shadow, border-color",
        transition:
          "transform 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 300ms ease, border-color 300ms ease",
      }}
      // Inline CSS vars for hover — avoids JS and keeps animations CSS-driven
      onMouseEnter={(e) => {
        prefetchChannelStream(channel.id);
        if (!isSelected) {
          const el = e.currentTarget;
          el.style.transform = "scale(1.02)";
          el.style.border = "1.5px solid rgba(245,158,11,0.5)";
          el.style.boxShadow =
            "0 0 0 2px rgba(245,158,11,0.12), 0 0 14px 2px rgba(245,158,11,0.14), 0 10px 36px rgba(0,0,0,0.5)";
        }
      }}
      onMouseLeave={(e) => {
        if (!isSelected) {
          const el = e.currentTarget;
          el.style.transform = "scale(1)";
          el.style.border = "1.5px solid rgba(245,158,11,0.12)";
          el.style.boxShadow = "0 2px 8px rgba(0,0,0,0.35)";
        }
      }}
    >
      {/* Cinematic gradient overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(2,6,23,0.10) 0%, rgba(2,6,23,0.18) 36%, rgba(2,6,23,0.74) 100%)",
        }}
      />

      {/* Selected state: persistent amber/gold inner glow */}
      {isSelected && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-xl"
          style={{
            background:
              "radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.18) 0%, rgba(234,88,12,0.08) 45%, transparent 70%)",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Hover shimmer overlay — CSS group-hover driven, no JS */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 rounded-xl"
        style={{
          background:
            "radial-gradient(ellipse at 50% 15%, rgba(245,158,11,0.10) 0%, rgba(234,88,12,0.05) 50%, transparent 70%)",
          mixBlendMode: "screen",
        }}
      />

      {/* Card body */}
      <div
        className={`relative flex w-full items-center justify-center bg-transparent ${
          compact ? "aspect-square p-3" : "aspect-[4/3] p-4 sm:p-5"
        }`}
      >
        {/* Subtle inner ambient light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(circle at 50% 34%, rgba(255,255,255,0.06), transparent 40%), radial-gradient(circle at 50% 38%, rgba(201, 106, 43, 0.06), transparent 56%)",
          }}
        />

        {/* Channel logo container */}
        <div
          className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-[var(--bg-card)] shadow-sm transition-all duration-300 ${
            compact ? "size-12" : "size-14 sm:size-16"
          } ${
            isSelected
              ? "border-[rgba(245,158,11,0.55)] shadow-[0_0_10px_rgba(245,158,11,0.25)]"
              : "border-[var(--border)] group-hover:border-[rgba(245,158,11,0.3)]"
          }`}
        >
          <ChannelLogo
            channel={channel}
            variant="tile"
            priority={priorityLogo || isSelected}
            className={compact ? "size-9" : "size-10 sm:size-11"}
          />
        </div>

        {/* Stream status dot */}
        <span
          className={`absolute right-2 top-2 h-1.5 w-1.5 rounded-full ring-2 ring-[var(--bg-secondary)] ${
            hasStream ? "bg-emerald-500" : "bg-amber-400"
          }`}
          title={hasStream ? "Stream ready" : "Resolves on play"}
          aria-hidden
        />

        {/* HD badge */}
        {channel.isHd && (
          <span className="absolute left-2 top-2 rounded border border-[var(--border)] bg-[var(--bg-card)]/95 px-1 py-px text-[7px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
            HD
          </span>
        )}

        {/* Selected / Live indicator */}
        {isSelected && (
          <span className="absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--accent-primary)] px-2 py-px text-[7px] font-bold uppercase tracking-wider text-[var(--text-inverse)]">
            Live
          </span>
        )}

        {/* Favorite toggle */}
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
            className={`absolute bottom-2 right-2 flex h-6 w-6 items-center justify-center rounded-full border transition-all duration-200 ${
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

      {/* Channel info footer */}
      <div
        className={`border-t border-white/10 bg-[rgba(2,6,23,0.66)] backdrop-blur-[1px] ${
          compact ? "px-2 py-1.5" : "px-2.5 py-2"
        }`}
      >
        <h3
          className={`truncate font-medium leading-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] ${
            compact ? "text-[10px]" : "text-xs sm:text-[13px]"
          }`}
        >
          {channel.name}
        </h3>
        <p className="mt-0.5 truncate text-[9px] text-white/70">
          {LIVE_TV_CATEGORY_LABELS[channel.category]}
          {channel.region === "local" ? " · LK" : ""}
        </p>
      </div>
    </button>
  );
}

export default memo(LiveTvChannelCard);
