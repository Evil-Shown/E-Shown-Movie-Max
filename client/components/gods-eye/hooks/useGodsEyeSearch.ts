import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  isTboomError,
  normalizeSearchPayload,
  tboomSearch,
  tboomSuggest,
  tboomTrending,
} from "@/lib/tboomApi";
import { enrichFromFilename, enrichWithTmdb } from "@/utils/enrichMetadata";
import { TRENDING_SEARCHES, saveRecentSearch as persistRecentSearch, removeRecentSearch } from "@/utils/parseQuery";
import { getCachedSearch, setCachedSearch, shouldBypassCache, stripCacheBypass } from "@/utils/searchCache";
import { trackSearch } from "@/utils/tboomAnalytics";
import { getInitialRecentSearches } from "../storage";
import { groupTorrentResults, parseSearchOperators } from "../torrent-utils";
import type { ParsedOperatorQuery, SearchApiResponse, TorrentResult } from "../types";

export function useGodsEyeSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(getInitialRecentSearches);
  const [trendingSearches, setTrendingSearches] = useState<Array<{ query: string; count: number }>>([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [activeOperators, setActiveOperators] = useState<ParsedOperatorQuery["operators"]>({});
  const [resultLimit, setResultLimit] = useState(30);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [providerMeta, setProviderMeta] = useState<{ providersUsed: string[]; providersFailed: string[] }>({
    providersUsed: [],
    providersFailed: [],
  });
  const [searchFocused, setSearchFocused] = useState(false);
  const [posterMap, setPosterMap] = useState<Record<string, string | null>>({});

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const searchDebounceRef = useRef<number | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const staticTrending = useMemo(
    () => TRENDING_SEARCHES.map((q) => ({ query: q, count: 0 })),
    []
  );

  const displayTrending = trendingSearches.length > 0 ? trendingSearches : staticTrending;

  const groupedResults = useMemo(
    () => groupTorrentResults(results, activeOperators),
    [results, activeOperators]
  );

  const flatResultCount = groupedResults.reduce((total, group) => total + group.uploads.length, 0);

  const addRecentSearch = useCallback((term: string) => {
    const next = persistRecentSearch(term);
    setRecentSearches(next);
  }, []);

  const fetchTrendingSearches = useCallback(async () => {
    try {
      const data = await tboomTrending();
      if (Array.isArray(data) && data.length > 0) {
        setTrendingSearches(data);
      }
    } catch {
      setTrendingSearches([]);
    }
  }, []);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const data = await tboomSuggest(q);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }, []);

  const performSearch = useCallback(
    async (searchQuery: string, options?: { saveRecent?: boolean; limit?: number }) => {
      const normalized = searchQuery.trim();
      const bypass = shouldBypassCache(normalized);
      const cacheKey = bypass ? stripCacheBypass(normalized) : normalized;
      const parsedQuery = parseSearchOperators(cacheKey);
      const providerQuery = parsedQuery.baseQuery || cacheKey;

      if (providerQuery.length < 2) {
        setError("Please enter at least 2 characters.");
        setResults([]);
        setSearched(false);
        return;
      }

      setLoading(true);
      setError("");
      setSearched(false);

      try {
        const effectiveLimit = options?.limit ?? resultLimit;

        if (!bypass) {
          const cached = getCachedSearch<SearchApiResponse>(`${providerQuery}:${effectiveLimit}`);
          if (cached) {
            setActiveQuery(cacheKey);
            setActiveOperators(parsedQuery.operators);
            setResults(Array.isArray(cached.results) ? cached.results : []);
            setProviderMeta({
              providersUsed: cached.meta?.providersUsed ?? [],
              providersFailed: cached.meta?.providersFailed ?? [],
            });
            setSearched(true);
            setExpandedGroups({});
            trackSearch(cacheKey, cached.results?.length ?? 0);
            if (options?.saveRecent) addRecentSearch(cacheKey);
            setLoading(false);
            return;
          }
        }

        const data = await tboomSearch(providerQuery, effectiveLimit);
        if (isTboomError(data)) {
          setResults([]);
          setSearched(true);
          setError(data.message);
          return;
        }

        const normalizedPayload = normalizeSearchPayload(data) as SearchApiResponse;

        setCachedSearch(`${providerQuery}:${effectiveLimit}`, normalizedPayload);
        setActiveQuery(cacheKey);
        setActiveOperators(parsedQuery.operators);
        setResults(Array.isArray(normalizedPayload.results) ? normalizedPayload.results : []);
        setProviderMeta({
          providersUsed: normalizedPayload.meta?.providersUsed ?? [],
          providersFailed: normalizedPayload.meta?.providersFailed ?? [],
        });
        setSearched(true);
        setExpandedGroups({});
        trackSearch(cacheKey, normalizedPayload.results?.length ?? 0);
        if (options?.saveRecent) {
          addRecentSearch(cacheKey);
        }
        fetchTrendingSearches();
      } catch {
        setError("Unable to connect to search service.");
        setResults([]);
        setSearched(true);
      } finally {
        setLoading(false);
      }
    },
    [resultLimit, addRecentSearch, fetchTrendingSearches]
  );

  const handleSearch = useCallback(
    (event?: FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      setResultLimit(30);
      performSearch(trimmedQuery, { saveRecent: true, limit: 30 });
    },
    [trimmedQuery, performSearch]
  );

  const handleQueryChange = useCallback(
    (nextValue: string) => {
      setQuery(nextValue);
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
      searchDebounceRef.current = window.setTimeout(() => {
        const nextQuery = nextValue.trim();
        if (nextQuery.length >= 2) {
          setResultLimit(30);
          performSearch(nextQuery, { limit: 30 });
          fetchSuggestions(nextQuery);
        } else {
          setSuggestions([]);
        }
      }, 300);
    },
    [performSearch, fetchSuggestions]
  );

  const searchSuggestion = useCallback(
    (term: string, saveRecent = true) => {
      setQuery(term);
      setResultLimit(30);
      performSearch(term, { saveRecent, limit: 30 });
    },
    [performSearch]
  );

  const removeOperator = useCallback(
    (kind: "year" | "quality") => {
      const pattern =
        kind === "year" ? /\byear:\d{4}\b/i : /\bquality:(2160p|1080p|720p|480p|4k)\b/i;
      const next = activeQuery.replace(pattern, "").replace(/\s+/g, " ").trim();
      setQuery(next);
      performSearch(next, { saveRecent: true, limit: resultLimit });
    },
    [activeQuery, performSearch, resultLimit]
  );

  const loadMore = useCallback(() => {
    const nextLimit = resultLimit + 30;
    setResultLimit(nextLimit);
    performSearch(activeQuery, { limit: nextLimit });
  }, [resultLimit, activeQuery, performSearch]);

  const clearQuery = useCallback(() => {
    setQuery("");
    setSuggestions([]);
  }, []);

  useEffect(() => {
    fetchTrendingSearches();
  }, [fetchTrendingSearches]);

  useEffect(() => {
    let cancelled = false;
    for (const torrent of results.slice(0, 12)) {
      const name = torrent.name;
      if (!name) continue;
      const meta = enrichFromFilename(name);
      if (meta.confidence < 0.7) continue;
      enrichWithTmdb(meta.title, meta.year).then((tmdb) => {
        if (!cancelled && tmdb?.poster_path) {
          setPosterMap((prev) => {
            if (prev[name]) return prev;
            return {
              ...prev,
              [name]: `https://image.tmdb.org/t/p/w185${tmdb.poster_path}`,
            };
          });
        }
      });
    }
    return () => {
      cancelled = true;
    };
  }, [results]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const typing = target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (event.key === "/" && !typing) {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
    };
  }, []);

  return {
    query,
    setQuery,
    trimmedQuery,
    results,
    setResults,
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
    expandedGroups,
    setExpandedGroups,
    providerMeta,
    searchFocused,
    setSearchFocused,
    posterMap,
    groupedResults,
    flatResultCount,
    searchInputRef,
    handleSearch,
    handleQueryChange,
    searchSuggestion,
    performSearch,
    fetchTrendingSearches,
    removeOperator,
    loadMore,
    clearQuery,
    removeRecentSearch,
  };
}

export type GodsEyeSearch = ReturnType<typeof useGodsEyeSearch>;
