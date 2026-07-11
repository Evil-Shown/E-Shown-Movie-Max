import ErrorState from "@/components/TBoom/ErrorState";
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
      <form
        onSubmit={handleSearch}
        className="mx-auto mt-6 flex max-w-[700px] flex-col gap-0 rounded border border-[#3E2723] bg-[#FFFFFF] p-1.5 shadow-[15px_15px_0px_rgba(230,81,0,0.1)] transition-shadow duration-300 focus-within:shadow-[20px_20px_0px_rgba(230,81,0,0.15)] sm:flex-row"
      >
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
          placeholder="Search for your next obsession..."
          className="h-12 flex-1 bg-transparent px-4 text-sm uppercase tracking-wider text-[#3E2723] outline-none placeholder:text-[#8D6E63] sm:text-base"
          style={{ fontFamily: "var(--font-oswald), var(--font-inter), Inter, sans-serif" }}
        />
        <button
          id="search-button"
          type="submit"
          disabled={loading}
          className="flex h-12 items-center justify-center gap-2.5 rounded-sm bg-[#3E2723] px-6 text-xs font-extrabold uppercase tracking-[0.15em] text-white transition-colors duration-300 hover:bg-[#E65100] disabled:cursor-not-allowed disabled:opacity-70 sm:px-8"
        >
          {loading ? (
            "Searching..."
          ) : (
            <>
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M10 2a8 8 0 015.29 13.71l4.58 4.58a1 1 0 01-1.42 1.42l-4.58-4.58A8 8 0 1110 2zm0 2a6 6 0 100 12 6 6 0 000-12z" />
              </svg>
              Search
            </>
          )}
        </button>
      </form>

      {suggestions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => searchSuggestion(suggestion)}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-1 text-xs text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:bg-white hover:text-[#E65100]"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {searchFocused && !trimmedQuery && recentSearches.length > 0 && (
        <div className="mt-3">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#3E2723]">Recent Searches</p>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-2 py-1 text-xs"
              >
                <button
                  type="button"
                  onClick={() => searchSuggestion(item)}
                  className="text-[#8D6E63] transition-colors duration-300 hover:text-[#E65100]"
                >
                  {item}
                </button>
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => setRecentSearches(removeRecentSearch(item))}
                  className="text-[#8D6E63] transition-colors duration-300 hover:text-[#E65100]"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#3E2723]">Trending:</span>
        {displayTrending.map((item) => (
          <button
            key={item.query}
            type="button"
            onClick={() => searchSuggestion(item.query)}
            className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3.5 py-1.5 text-xs font-medium text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:bg-white hover:text-[#E65100]"
          >
            {item.query}
            {item.count > 0 ? ` (${item.count})` : ""}
          </button>
        ))}
      </div>

      {loading && trimmedQuery && (
        <p className="mt-4 rounded-lg border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-2 text-sm text-[#8D6E63]">
          Searching torrents for &quot;{trimmedQuery}&quot;...
        </p>
      )}
      {searched && !loading && !error && (
        <p className="mt-4 rounded-lg border border-[#3E2723] bg-[#FFFBF5] px-3 py-2 text-sm text-[#3E2723]">
          Found {flatResultCount} upload{flatResultCount === 1 ? "" : "s"} in {groupedResults.length} grouped title
          {groupedResults.length === 1 ? "" : "s"} for &quot;{activeQuery}&quot;.
        </p>
      )}
      {providerMeta.providersFailed.length > 0 && (
        <p className="mt-3 text-xs text-[#8D6E63]">
          Some search sources were slow or unavailable — showing the best results we could find.
        </p>
      )}
      {Object.keys(activeOperators).length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {activeOperators.year && (
            <button
              type="button"
              onClick={() => removeOperator("year")}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-1 text-xs text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:text-[#E65100]"
            >
              year:{activeOperators.year} x
            </button>
          )}
          {activeOperators.quality && (
            <button
              type="button"
              onClick={() => removeOperator("quality")}
              className="rounded-full border border-[#D7CCC8] bg-[#FFFBF5] px-3 py-1 text-xs text-[#8D6E63] transition-colors duration-300 hover:border-[#E65100] hover:text-[#E65100]"
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
