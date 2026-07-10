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
    <div className="section-base min-h-full px-6 py-16">
      <div className="mx-auto max-w-[980px]">
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-0 shadow-[var(--shadow-sm)]">
          <GodsEyeHero />
          <div className="px-5 pb-6 sm:px-6">
            <ContinueWatchingBanner
              continueWatching={magnet.continueWatching}
              startTorrent={magnet.startTorrent}
              clearContinue={magnet.clearContinue}
            />
            <SearchBar {...search} error={displayError} />
          </div>
        </div>

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
