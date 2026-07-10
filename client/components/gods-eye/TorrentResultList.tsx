import EmptyState from "@/components/TBoom/EmptyState";
import SkeletonCard from "@/components/TBoom/SkeletonCard";
import TBoomResultCard from "@/components/TBoom/ResultCard";
import { TRENDING_SEARCHES } from "@/utils/parseQuery";
import { trackResultClick } from "@/utils/tboomAnalytics";
import type { GodsEyeSearch } from "./hooks/useGodsEyeSearch";
import type { MagnetResolverState } from "./hooks/useMagnetResolver";
import { normalizeMagnet } from "./torrent-utils";

type TorrentResultListProps = Pick<
  GodsEyeSearch,
  | "loading"
  | "searched"
  | "error"
  | "groupedResults"
  | "flatResultCount"
  | "expandedGroups"
  | "setExpandedGroups"
  | "resultLimit"
  | "results"
  | "posterMap"
  | "activeQuery"
  | "searchSuggestion"
  | "loadMore"
> &
  Pick<
    MagnetResolverState,
    | "streamingMagnet"
    | "downloadState"
    | "resolvingMagnetName"
    | "checkingSecurityName"
    | "handleDownload"
    | "handleStream"
    | "resolveMagnetForTorrent"
    | "checkSecurityForTorrent"
    | "triggerMagnetDownload"
    | "handleShare"
    | "showActionMessage"
    | "setShowMagnetHelp"
    | "trackAction"
  >;

export default function TorrentResultList({
  loading,
  searched,
  error,
  groupedResults,
  flatResultCount,
  expandedGroups,
  setExpandedGroups,
  resultLimit,
  results,
  posterMap,
  activeQuery,
  searchSuggestion,
  loadMore,
  streamingMagnet,
  downloadState,
  resolvingMagnetName,
  checkingSecurityName,
  handleDownload,
  handleStream,
  resolveMagnetForTorrent,
  checkSecurityForTorrent,
  triggerMagnetDownload,
  handleShare,
  showActionMessage,
  setShowMagnetHelp,
  trackAction,
}: TorrentResultListProps) {
  return (
    <>
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map((row) => (
            <SkeletonCard key={row} />
          ))}
        </div>
      )}

      {groupedResults.map((group) => {
        const expanded = expandedGroups[group.key] ?? false;
        return (
          <article key={group.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-[var(--font-playfair)] text-xl font-semibold text-[var(--text-primary)]">
                  {group.title}
                  {group.year ? ` (${group.year})` : ""}
                </h3>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  {group.uploads.length} uploads grouped by quality.
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(group.qualityCounts).map(([quality, count]) => (
                    <span
                      key={`${group.key}-${quality}`}
                      className="rounded-full bg-[var(--bg-main)] px-2 py-1 text-xs text-[var(--text-secondary)]"
                    >
                      {quality}: {count}
                    </span>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.key]: !expanded }))}
                className="inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
              >
                {expanded ? "Hide uploads" : "Show uploads"}
              </button>
            </div>

            {expanded && (
              <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
                {group.uploads.map((torrent, index) => {
                  const magnetHref = normalizeMagnet(torrent.magnet) || null;
                  const isStreaming = streamingMagnet === magnetHref;
                  const posterUrl = torrent.name ? posterMap[torrent.name] : null;

                  return (
                    <TBoomResultCard
                      key={`${group.key}-${index}`}
                      result={{ ...torrent, posterUrl }}
                      isStreaming={isStreaming}
                      magnetHref={magnetHref}
                      downloadDisabled={
                        downloadState.status === "connecting" ||
                        downloadState.status === "downloading" ||
                        downloadState.status === "finalizing"
                      }
                      resolving={resolvingMagnetName === torrent.name}
                      checkingSecurity={checkingSecurityName === torrent.name}
                      onDownload={() => {
                        trackResultClick(activeQuery, index, "download_click");
                        handleDownload(torrent);
                      }}
                      onStream={() => handleStream(torrent, index)}
                      onCopyMagnet={async () => {
                        if (!magnetHref) return;
                        await navigator.clipboard.writeText(magnetHref);
                        showActionMessage("success", "Copied!");
                      }}
                      onShare={() => handleShare(torrent)}
                      onOpenTorrentApp={() => {
                        if (!magnetHref) return;
                        trackAction("download", activeQuery);
                        triggerMagnetDownload(magnetHref);
                      }}
                      onMagnetHelp={() => setShowMagnetHelp(true)}
                      onSecurityCheck={() => checkSecurityForTorrent(torrent)}
                      onResolveMagnet={() => resolveMagnetForTorrent(torrent)}
                    />
                  );
                })}
              </div>
            )}
          </article>
        );
      })}

      {searched && !loading && !error && flatResultCount === 0 && (
        <EmptyState onTrendingClick={() => searchSuggestion(TRENDING_SEARCHES[0])} />
      )}
      {searched && !loading && !error && results.length >= resultLimit && (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={loadMore}
            className="inline-flex rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
          >
            Load More
          </button>
        </div>
      )}
    </>
  );
}
