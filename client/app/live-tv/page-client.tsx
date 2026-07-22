"use client";

import LiveTvCategoryTabs from "@/components/live-tv/LiveTvCategoryTabs";
import LiveTvChannelGrid from "@/components/live-tv/LiveTvChannelGrid";
import LiveTvEmptyState from "@/components/live-tv/LiveTvEmptyState";
import LiveTvBetaBanner from "@/components/live-tv/LiveTvBetaBanner";
import LiveTvHero from "@/components/live-tv/LiveTvHero";
import LiveTvPlayer from "@/components/live-tv/LiveTvPlayer";
import LiveTvSearchBar from "@/components/live-tv/LiveTvSearchBar";
import LiveTvSectionRow from "@/components/live-tv/LiveTvSectionRow";
import { getFeaturedChannels, LIVE_TV_CHANNELS } from "@/lib/live-tv/channels";
import {
  getContinueWatchingChannels,
  getFavoriteChannelIds,
  toggleFavoriteChannel,
  upsertContinueWatching,
} from "@/lib/live-tv/storage";
import type { LiveTvCategoryFilter, LiveTvChannel } from "@/lib/live-tv/types";
import { filterChannels } from "@/lib/live-tv/utils";
import {
  prefetchChannelLogos,
  prefetchChannelStream,
} from "@/lib/live-tv/stream-cache";
import { useAfterHydration } from "@/lib/hooks/use-after-hydration";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

interface ChannelSectionProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  channels: LiveTvChannel[];
  selectedChannelId?: string | null;
  favoriteIds: Set<string>;
  onSelect: (channel: LiveTvChannel) => void;
  onToggleFavorite: (channel: LiveTvChannel) => void;
}

function ChannelSection({
  title,
  subtitle,
  icon,
  channels,
  selectedChannelId,
  favoriteIds,
  onSelect,
  onToggleFavorite,
}: ChannelSectionProps) {
  if (channels.length === 0) return null;

  return (
    <section className="mb-14">
      <div className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)] text-[var(--accent-primary)]">
              {icon}
            </div>
          )}
          <div>
            <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-sm text-[var(--text-secondary)]">{subtitle}</p>
            )}
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-[var(--bg-secondary)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
          {channels.length}
        </span>
      </div>
      <LiveTvChannelGrid
        channels={channels}
        selectedChannelId={selectedChannelId}
        favoriteIds={favoriteIds}
        onSelect={onSelect}
        onToggleFavorite={onToggleFavorite}
      />
    </section>
  );
}

export default function LiveTvPageClient() {
  const afterHydration = useAfterHydration();
  const playerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<LiveTvCategoryFilter>("all");
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel | null>(() => {
    return LIVE_TV_CHANNELS.find((ch) => ch.id === "hiru-tv") || null;
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<LiveTvChannel[]>([]);
  const [continueWatching, setContinueWatching] = useState<LiveTvChannel[]>([]);

  const refreshLibrary = useCallback(() => {
    setFavoriteIds(new Set(getFavoriteChannelIds()));
    setFavorites(
      getFavoriteChannelIds()
        .map((id) => LIVE_TV_CHANNELS.find((ch) => ch.id === id))
        .filter((ch): ch is LiveTvChannel => Boolean(ch))
    );
    setContinueWatching(getContinueWatchingChannels());
  }, []);

  useEffect(() => {
    refreshLibrary();
  }, [refreshLibrary]);

  const featuredChannels = useMemo(() => getFeaturedChannels(), []);

  const localChannels = useMemo(
    () => LIVE_TV_CHANNELS.filter((ch) => ch.region === "local"),
    []
  );

  const internationalChannels = useMemo(
    () => LIVE_TV_CHANNELS.filter((ch) => ch.region === "international"),
    []
  );

  // Warm default channel + visible logos immediately (no artificial delay)
  useEffect(() => {
    prefetchChannelStream("hiru-tv");
    if (selectedChannel) prefetchChannelStream(selectedChannel.id);
    prefetchChannelLogos(
      [
        ...localChannels.slice(0, 18).map((ch) => ch.id),
        ...featuredChannels.map((ch) => ch.id),
      ],
      28
    );
  }, [localChannels, featuredChannels, selectedChannel]);

  const filteredChannels = useMemo(
    () => filterChannels(LIVE_TV_CHANNELS, searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const handleSelectChannel = useCallback(
    (channel: LiveTvChannel) => {
      prefetchChannelStream(channel.id);
      setSelectedChannel(channel);
      if (afterHydration) {
        upsertContinueWatching(channel.id);
        refreshLibrary();
      }
      requestAnimationFrame(() => {
        playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [afterHydration, refreshLibrary]
  );

  const handleToggleFavorite = useCallback(
    (channel: LiveTvChannel) => {
      toggleFavoriteChannel(channel.id);
      refreshLibrary();
    },
    [refreshLibrary]
  );

  const showSectionRows = !searchQuery.trim() && activeCategory === "all";
  const isFiltering = !showSectionRows;

  const gridProps = {
    selectedChannelId: selectedChannel?.id,
    favoriteIds,
    onSelect: handleSelectChannel,
    onToggleFavorite: handleToggleFavorite,
  };

  return (
    <div>
      {/* Header */}
      <section className="browse-hero-bg px-6 pb-6 pt-10">
        <div className="mx-auto max-w-[1280px]">
          <LiveTvHero />

          <LiveTvBetaBanner />

          <div className="mt-5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)] sm:p-5">
            <LiveTvSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={filteredChannels.length}
            />

            <div className="mt-4 border-t border-[var(--border)] pt-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--text-muted)]">
                Categories
              </p>
              <div className="-mx-1 overflow-x-auto px-1 pb-0.5 scrollbar-hide scroll-mask-right">
                <LiveTvCategoryTabs
                  activeCategory={activeCategory}
                  onCategoryChange={setActiveCategory}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Theater player */}
      <section className="relative px-6 pb-10">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-full max-h-[520px] bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"
          aria-hidden
        />
        <div ref={playerRef} className="relative mx-auto max-w-[1100px] scroll-mt-24">
          <LiveTvPlayer
            channel={selectedChannel}
            isFavorite={selectedChannel ? favoriteIds.has(selectedChannel.id) : false}
            onToggleFavorite={handleToggleFavorite}
          />
          <p className="mt-3 text-center text-xs text-[var(--text-muted)]">
            Drag the bar to rewind · tap <span className="font-semibold text-[var(--accent-primary)]">Go Live</span> to catch up
          </p>
        </div>
      </section>

      {/* Channel grids */}
      <div className="mx-auto max-w-[1280px] px-6 pb-20">
        <>
            {showSectionRows && (
              <div className="mb-12 space-y-2">
                <LiveTvSectionRow
                  title="Featured"
                  subtitle="Hand-picked channels"
                  channels={featuredChannels}
                  {...gridProps}
                />
                <LiveTvSectionRow
                  title="Favorites"
                  channels={favorites}
                  {...gridProps}
                  emptyState={
                    <LiveTvEmptyState
                      title="No favorites yet"
                      description="Tap the heart on any channel to save it here."
                    />
                  }
                />
                <LiveTvSectionRow
                  title="Continue Watching"
                  subtitle="Channels you've watched recently"
                  channels={continueWatching}
                  {...gridProps}
                  emptyState={
                    <LiveTvEmptyState
                      title="Nothing to continue"
                      description="Channels you watch will appear here."
                    />
                  }
                />
              </div>
            )}

            {isFiltering ? (
              <section>
                <div className="mb-6 border-b border-[var(--border)] pb-4">
                  <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                    Search Results
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {filteredChannels.length} channel{filteredChannels.length !== 1 ? "s" : ""} found
                  </p>
                </div>

                {filteredChannels.length === 0 ? (
                  <LiveTvEmptyState
                    title="No channels found"
                    description="Try a different search term or category."
                    actionLabel="Clear filters"
                    onAction={() => {
                      setSearchQuery("");
                      setActiveCategory("all");
                    }}
                  />
                ) : (
                  <LiveTvChannelGrid channels={filteredChannels} {...gridProps} />
                )}
              </section>
            ) : (
              <>
                <ChannelSection
                  title="Sri Lankan Local TV"
                  subtitle="National broadcasters and local networks"
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <polyline points="9 22 9 12 15 12 15 22" />
                    </svg>
                  }
                  channels={localChannels}
                  {...gridProps}
                />

                <ChannelSection
                  title="International Channels"
                  subtitle="Sports, news, entertainment worldwide"
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                    </svg>
                  }
                  channels={internationalChannels}
                  {...gridProps}
                />
              </>
            )}
        </>
      </div>
    </div>
  );
}
