import ErrorState from "@/components/TBoom/ErrorState";
import type { GodsEyeSearch } from "./hooks/useGodsEyeSearch";

type SearchBarProps = Pick<
  GodsEyeSearch,
  | "trimmedQuery"
  | "loading"
  | "error"
  | "searched"
  | "suggestions"
  | "activeQuery"
  | "activeOperators"
  | "resultLimit"
  | "providerMeta"
  | "flatResultCount"
  | "groupedResults"
  | "searchSuggestion"
  | "performSearch"
  | "removeOperator"
>;

export default function SearchBar({
  trimmedQuery,
  loading,
  error,
  searched,
  suggestions,
  activeQuery,
  activeOperators,
  resultLimit,
  providerMeta,
  flatResultCount,
  groupedResults,
  searchSuggestion,
  performSearch,
  removeOperator,
}: SearchBarProps) {
  return (
    <>
      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => searchSuggestion(suggestion)}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-1 text-xs text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:bg-white hover:text-[#E65100] dark:border-[var(--border-strong)] dark:bg-[var(--bg-card)] dark:text-[var(--text-muted)] dark:hover:bg-[var(--panel-white)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {loading && trimmedQuery && (
        <p className="mt-4 rounded-lg border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-2 text-sm text-[#8D6E63] dark:border-[var(--border-strong)] dark:bg-[var(--bg-card)] dark:text-[var(--text-muted)]">
          Searching torrents for &quot;{trimmedQuery}&quot;...
        </p>
      )}
      {searched && !loading && !error && (
        <p className="mt-4 rounded-lg border border-[#3E2723] bg-[#FFFBF5] px-3 py-2 text-sm text-[#3E2723] dark:border-[var(--text-primary)] dark:bg-[var(--bg-card)] dark:text-[var(--text-primary)]">
          Found {flatResultCount} upload{flatResultCount === 1 ? "" : "s"} in {groupedResults.length} grouped title
          {groupedResults.length === 1 ? "" : "s"} for &quot;{activeQuery}&quot;.
        </p>
      )}
      {providerMeta.providersFailed.length > 0 && (
        <p className="mt-3 text-xs text-[#8D6E63] dark:text-[var(--text-muted)]">
          Some search sources were slow or unavailable — showing the best results we could find.
        </p>
      )}
      {Object.keys(activeOperators).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeOperators.year && (
            <button
              type="button"
              onClick={() => removeOperator("year")}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-1 text-xs text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:text-[#E65100] dark:border-[var(--border-strong)] dark:bg-[var(--bg-card)] dark:text-[var(--text-muted)]"
            >
              year:{activeOperators.year} x
            </button>
          )}
          {activeOperators.quality && (
            <button
              type="button"
              onClick={() => removeOperator("quality")}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-1 text-xs text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:text-[#E65100] dark:border-[var(--border-strong)] dark:bg-[var(--bg-card)] dark:text-[var(--text-muted)]"
            >
              quality:{activeOperators.quality} x
            </button>
          )}
        </div>
      )}
      {error && (
        <div className="mt-4">
          <ErrorState
            error={error}
            onRetry={() => performSearch(activeQuery || trimmedQuery, { saveRecent: true, limit: resultLimit })}
          />
        </div>
      )}
    </>
  );
}
