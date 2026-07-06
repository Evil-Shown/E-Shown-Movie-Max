const STORAGE_KEY = "gods_eye_analytics";
const LEGACY_STORAGE_KEY = "tboom_analytics";
const MAX_ENTRIES = 100;

type SearchEntry = {
  query: string;
  timestamp: number;
  resultCount: number;
  clickedIndex?: number;
  action?: "stream_click" | "download_click";
};

type AnalyticsStore = {
  searches: SearchEntry[];
  maxEntries: number;
};

function load(): AnalyticsStore {
  if (typeof localStorage === "undefined") {
    return { searches: [], maxEntries: MAX_ENTRIES };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    if (parsed && Array.isArray(parsed.searches)) {
      if (!localStorage.getItem(STORAGE_KEY)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      }
      return { searches: parsed.searches, maxEntries: MAX_ENTRIES };
    }
  } catch {
    /* ignore */
  }
  return { searches: [], maxEntries: MAX_ENTRIES };
}

function save(store: AnalyticsStore) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function trackSearch(query: string, resultCount: number) {
  const store = load();
  store.searches.unshift({ query, timestamp: Date.now(), resultCount });
  if (store.searches.length > store.maxEntries) {
    store.searches = store.searches.slice(0, store.maxEntries);
  }
  save(store);
}

export function trackResultClick(
  query: string,
  index: number,
  action: "stream_click" | "download_click"
) {
  const store = load();
  const entry = store.searches.find((s) => s.query === query);
  if (entry) {
    entry.clickedIndex = index;
    entry.action = action;
  } else {
    store.searches.unshift({
      query,
      timestamp: Date.now(),
      resultCount: 0,
      clickedIndex: index,
      action
    });
  }
  if (store.searches.length > store.maxEntries) {
    store.searches = store.searches.slice(0, store.maxEntries);
  }
  save(store);
}

export function getPopularSearches(limit = 8): Array<{ query: string; count: number }> {
  const store = load();
  const counts = new Map<string, number>();
  for (const entry of store.searches) {
    counts.set(entry.query, (counts.get(entry.query) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([query, count]) => ({ query, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}
