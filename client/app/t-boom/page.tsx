"use client";

import GodsEyeHero from "@/components/GodsEyeHero";
import MagnetResolver, { ContinueWatchingBanner } from "@/components/gods-eye/MagnetResolver";
import SearchBar from "@/components/gods-eye/SearchBar";
import TorrentResultList from "@/components/gods-eye/TorrentResultList";
import { useGodsEyeSearch } from "@/components/gods-eye/hooks/useGodsEyeSearch";
import { useMagnetResolver } from "@/components/gods-eye/hooks/useMagnetResolver";

export default function TBoomPage() {
  const search = useGodsEyeSearch();
  const magnet = useMagnetResolver({
    activeQuery: search.activeQuery,
    results: search.results,
    setResults: search.setResults,
    onEscape: search.clearQuery,
  });

  const displayError = search.error || magnet.error;

  return (
    <div className="min-h-full bg-[#FFFFFF]">
      <GodsEyeHero
        query={search.query}
        loading={search.loading}
        displayTrending={search.displayTrending}
        searchInputRef={search.searchInputRef}
        handleSearch={search.handleSearch}
        handleQueryChange={search.handleQueryChange}
        searchSuggestion={search.searchSuggestion}
        fetchTrendingSearches={search.fetchTrendingSearches}
        setSearchFocused={search.setSearchFocused}
      />

      <div className="mx-auto max-w-[980px] px-6 pb-16">
        <ContinueWatchingBanner
          continueWatching={magnet.continueWatching}
          startTorrent={magnet.startTorrent}
          clearContinue={magnet.clearContinue}
        />
        <SearchBar {...search} error={displayError} />

        <div className="mt-8 space-y-4">
          <MagnetResolver {...magnet} />
          <div id="results" className="space-y-4">
            <TorrentResultList {...search} {...magnet} />
          </div>
        </div>
      </div>
    </div>
  );
}
