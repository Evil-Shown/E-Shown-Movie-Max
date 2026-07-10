import ErrorState from "@/components/TBoom/ErrorState";
import { TRENDING_SEARCHES } from "@/utils/parseQuery";
import type { GodsEyeSearch } from "./hooks/useGodsEyeSearch";

type SearchBarProps = Pick<
  GodsEyeSearch,
  | "query"
  | "trimmedQuery"
  | "loading"
  | "error"
  | "searched"
  | "suggestions"
  | "recentSearches"
  | "setRecentSearches"
  | "displayTrending"
  | "activeQuery"
  | "activeOperators"
  | "resultLimit"
  | "providerMeta"
  | "searchFocused"
  | "setSearchFocused"
  | "flatResultCount"
  | "groupedResults"
  | "searchInputRef"
  | "handleSearch"
  | "handleQueryChange"
  | "searchSuggestion"
  | "performSearch"
  | "fetchTrendingSearches"
  | "removeOperator"
  | "removeRecentSearch"
>;

export default function SearchBar({
  query,
  trimmedQuery,
  loading,
  error,
  searched,
  suggestions,
  recentSearches,
  setRecentSearches,
  displayTrending,
  activeQuery,
  activeOperators,
  resultLimit,
  providerMeta,
  searchFocused,
  setSearchFocused,
  flatResultCount,
  groupedResults,
  searchInputRef,
  handleSearch,
  handleQueryChange,
  searchSuggestion,
  performSearch,
  fetchTrendingSearches,
  removeOperator,
  removeRecentSearch,
}: SearchBarProps) {
  return (
    <>
      <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          ref={searchInputRef}
          id="search-input"
          type="text"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => {
            setSearchFocused(true);
            fetchTrendingSearches();
          }}
          onBlur={() => window.setTimeout(() => setSearchFocused(false), 150)}
          placeholder="Search movies, TV shows, anime..."
          className="h-12 flex-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-main)] px-4 text-sm text-[var(--text-primary)] outline-none transition focus:border-[var(--accent-primary)]"
        />
        <button
          id="search-button"
          type="submit"
          disabled={loading}
          className="h-12 rounded-xl bg-[var(--accent-primary)] px-6 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => searchSuggestion(suggestion)}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {searchFocused && !trimmedQuery && recentSearches.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">
            Recent Searches
          </p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <span key={item} className="inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2 py-1 text-xs">
                <button
                  type="button"
                  onClick={() => searchSuggestion(item)}
                  className="text-[var(--text-secondary)] transition hover:text-[var(--accent-primary)]"
                >
                  {item}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => setRecentSearches(removeRecentSearch(item))}
                  className="text-[var(--text-secondary)] hover:text-red-500"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">
          Trending Searches
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayTrending.map((item) => (
            <button
              key={item.query}
              type="button"
              onClick={() => searchSuggestion(item.query)}
              className="shrink-0 rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
            >
              {item.query}
              {item.count > 0 ? ` (${item.count})` : ""}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 hidden sm:block">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">
          Popular Streams
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {TRENDING_SEARCHES.slice(0, 4).map((title) => (
            <button
              key={title}
              type="button"
              onClick={() => searchSuggestion(title)}
              className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-left text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)]"
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {loading && trimmedQuery && (
        <p className="mt-4 rounded-lg border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          Searching torrents for &quot;{trimmedQuery}&quot;...
        </p>
      )}
      {searched && !loading && !error && (
        <p className="mt-4 rounded-lg border border-[var(--border-strong)] bg-[var(--bg-main)] px-3 py-2 text-sm text-[var(--text-secondary)]">
          Found {flatResultCount} upload{flatResultCount === 1 ? "" : "s"} in {groupedResults.length} grouped title
          {groupedResults.length === 1 ? "" : "s"} for &quot;{activeQuery}&quot;.
        </p>
      )}
      {providerMeta.providersFailed.length > 0 && (
        <p className="mt-3 text-xs text-[var(--text-secondary)]">
          Some search sources were slow or unavailable — showing the best results we could find.
        </p>
      )}
      {Object.keys(activeOperators).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeOperators.year && (
            <button
              type="button"
              onClick={() => removeOperator("year")}
              className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]"
            >
              year:{activeOperators.year} x
            </button>
          )}
          {activeOperators.quality && (
            <button
              type="button"
              onClick={() => removeOperator("quality")}
              className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]"
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
