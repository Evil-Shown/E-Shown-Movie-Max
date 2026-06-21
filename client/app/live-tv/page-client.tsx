"use client";

import LiveTvCategoryTabs from "@/components/live-tv/LiveTvCategoryTabs";
import LiveTvChannelGrid from "@/components/live-tv/LiveTvChannelGrid";
import LiveTvEmptyState from "@/components/live-tv/LiveTvEmptyState";
import LiveTvHero from "@/components/live-tv/LiveTvHero";
import LiveTvPlayer from "@/components/live-tv/LiveTvPlayer";
import LiveTvSearchBar from "@/components/live-tv/LiveTvSearchBar";
import LiveTvSectionRow from "@/components/live-tv/LiveTvSectionRow";
import LiveTvSkeletonGrid, { LiveTvSkeletonPlayer } from "@/components/live-tv/LiveTvSkeletonGrid";
import { getFeaturedChannels, LIVE_TV_CHANNELS } from "@/lib/live-tv/channels";
import {
  getContinueWatchingChannels,
  getFavoriteChannelIds,
  getRecentlyViewedChannels,
  isFavoriteChannel,
  recordRecentlyViewed,
  toggleFavoriteChannel,
  upsertContinueWatching,
} from "@/lib/live-tv/storage";
import type { LiveTvCategoryFilter, LiveTvChannel } from "@/lib/live-tv/types";
import { filterChannels } from "@/lib/live-tv/utils";
import { useAfterHydration } from "@/lib/hooks/use-after-hydration";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function LiveTvPageClient() {
  const afterHydration = useAfterHydration();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<LiveTvCategoryFilter>("all");
  const [selectedChannel, setSelectedChannel] = useState<LiveTvChannel | null>(() => {
    return LIVE_TV_CHANNELS.find((ch) => ch.id === "hiru-tv") || null;
  });
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<LiveTvChannel[]>([]);
  const [continueWatching, setContinueWatching] = useState<LiveTvChannel[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<LiveTvChannel[]>([]);

  const refreshLibrary = useCallback(() => {
    setFavoriteIds(new Set(getFavoriteChannelIds()));
    setFavorites(
      getFavoriteChannelIds()
        .map((id) => LIVE_TV_CHANNELS.find((ch) => ch.id === id))
        .filter((ch): ch is LiveTvChannel => Boolean(ch))
    );
    setContinueWatching(getContinueWatchingChannels());
    setRecentlyViewed(getRecentlyViewedChannels());
  }, []);

  useEffect(() => {
    refreshLibrary();
    const timer = window.setTimeout(() => setLoading(false), 400);
    return () => window.clearTimeout(timer);
  }, [refreshLibrary]);

  const featuredChannels = useMemo(() => getFeaturedChannels(), []);

  const filteredChannels = useMemo(
    () => filterChannels(LIVE_TV_CHANNELS, searchQuery, activeCategory),
    [searchQuery, activeCategory]
  );

  const handleSelectChannel = useCallback(
    (channel: LiveTvChannel) => {
      setSelectedChannel(channel);
      if (afterHydration) {
        recordRecentlyViewed(channel.id);
        upsertContinueWatching(channel.id);
        refreshLibrary();
      }
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

  return (
    <div>
      <section className="browse-hero-bg px-6 py-16">
        <div className="mx-auto max-w-[1280px]">
          <LiveTvHero />

          <div className="mt-6 space-y-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] sm:p-6">
            <LiveTvSearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              resultCount={filteredChannels.length}
            />
            <LiveTvCategoryTabs
              activeCategory={activeCategory}
              onCategoryChange={setActiveCategory}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-10">
        <div className="mb-10">
          {loading ? (
            <LiveTvSkeletonPlayer />
          ) : (
            <LiveTvPlayer
              channel={selectedChannel}
              isFavorite={selectedChannel ? isFavoriteChannel(selectedChannel.id) : false}
              onToggleFavorite={handleToggleFavorite}
            />
          )}
        </div>

        {loading ? (
          <LiveTvSkeletonGrid />
        ) : (
          <>
            {showSectionRows && (
              <>
                <LiveTvSectionRow
                  title="Featured Channels"
                  subtitle="Popular picks across local and international networks"
                  channels={featuredChannels}
                  selectedChannelId={selectedChannel?.id}
                  favoriteIds={favoriteIds}
                  onSelect={handleSelectChannel}
                  onToggleFavorite={handleToggleFavorite}
                />

                <LiveTvSectionRow
                  title="Favorites"
                  channels={favorites}
                  selectedChannelId={selectedChannel?.id}
                  favoriteIds={favoriteIds}
                  onSelect={handleSelectChannel}
                  onToggleFavorite={handleToggleFavorite}
                  emptyState={
                    <LiveTvEmptyState
                      title="No favorites yet"
                      description="Tap the heart icon on any channel to save it here for quick access."
                    />
                  }
                />

                <LiveTvSectionRow
                  title="Continue Watching"
                  subtitle="Pick up where you left off"
                  channels={continueWatching}
                  selectedChannelId={selectedChannel?.id}
                  favoriteIds={favoriteIds}
                  onSelect={handleSelectChannel}
                  onToggleFavorite={handleToggleFavorite}
                  emptyState={
                    <LiveTvEmptyState
                      title="Nothing to continue"
                      description="Select a channel above and it will appear here next time you visit."
                    />
                  }
                />

                <LiveTvSectionRow
                  title="Recently Viewed"
                  channels={recentlyViewed}
                  selectedChannelId={selectedChannel?.id}
                  favoriteIds={favoriteIds}
                  onSelect={handleSelectChannel}
                  onToggleFavorite={handleToggleFavorite}
                  emptyState={
                    <LiveTvEmptyState
                      title="No recent channels"
                      description="Channels you watch will show up here automatically."
                    />
                  }
                />
              </>
            )}

            <section>
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-[var(--font-playfair)] text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
                    {searchQuery.trim() || activeCategory !== "all"
                      ? "Search Results"
                      : "All Channels"}
                  </h2>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    {filteredChannels.length} channel{filteredChannels.length !== 1 ? "s" : ""} available
                  </p>
                </div>
              </div>

              {filteredChannels.length === 0 ? (
                <LiveTvEmptyState
                  title="No channels found"
                  description="Try a different search term or category filter to find what you're looking for."
                  actionLabel="Clear filters"
                  onAction={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                />
              ) : (
                <LiveTvChannelGrid
                  channels={filteredChannels}
                  selectedChannelId={selectedChannel?.id}
                  favoriteIds={favoriteIds}
                  onSelect={handleSelectChannel}
                  onToggleFavorite={handleToggleFavorite}
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
