import type { Genre, MediaType } from "@/lib/types";

const SEARCH_KEY = "chithra-search-history";
const INTERACTIONS_KEY = "chithra-title-interactions";
const MAX_SEARCH = 40;
const MAX_INTERACTIONS = 150;

export interface SearchHistoryEntry {
  query: string;
  genres?: Genre[];
  at: number;
}

export type TitleInteractionKind = "view" | "quickview" | "dwell";

export interface TitleInteraction {
  id: string;
  title: string;
  genres: Genre[];
  mediaType?: MediaType;
  kind: TitleInteractionKind;
  /** Pre-computed weight for this event */
  weight: number;
  at: number;
}

function readSearch(): SearchHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SEARCH_KEY);
    return raw ? (JSON.parse(raw) as SearchHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function writeSearch(entries: SearchHistoryEntry[]) {
  localStorage.setItem(SEARCH_KEY, JSON.stringify(entries.slice(0, MAX_SEARCH)));
}

function readInteractions(): TitleInteraction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INTERACTIONS_KEY);
    return raw ? (JSON.parse(raw) as TitleInteraction[]) : [];
  } catch {
    return [];
  }
}

function writeInteractions(items: TitleInteraction[]) {
  localStorage.setItem(INTERACTIONS_KEY, JSON.stringify(items.slice(0, MAX_INTERACTIONS)));
}

export function getSearchHistory(): SearchHistoryEntry[] {
  return readSearch().sort((a, b) => b.at - a.at);
}

export function recordSearchQuery(query: string, genres?: Genre[]) {
  const trimmed = query.trim();
  if (!trimmed && !genres?.length) return;

  const entries = readSearch().filter((e) => e.query.toLowerCase() !== trimmed.toLowerCase());
  writeSearch([
    {
      query: trimmed,
      genres: genres?.length ? genres : undefined,
      at: Date.now(),
    },
    ...entries,
  ]);
}

export function getTitleInteractions(): TitleInteraction[] {
  return readInteractions().sort((a, b) => b.at - a.at);
}

function pushInteraction(interaction: Omit<TitleInteraction, "at">) {
  const items = readInteractions();
  writeInteractions([{ ...interaction, at: Date.now() }, ...items]);
}

export function recordTitleView(movie: {
  id: string;
  title: string;
  genres: Genre[];
  mediaType?: MediaType;
}) {
  pushInteraction({
    id: movie.id,
    title: movie.title,
    genres: movie.genres,
    mediaType: movie.mediaType,
    kind: "view",
    weight: 2,
  });
}

export function recordTitleQuickView(movie: {
  id: string;
  title: string;
  genres: Genre[];
  mediaType?: MediaType;
}) {
  pushInteraction({
    id: movie.id,
    title: movie.title,
    genres: movie.genres,
    mediaType: movie.mediaType,
    kind: "quickview",
    weight: 1.5,
  });
}

export function recordPosterDwell(
  movie: { id: string; title: string; genres: Genre[]; mediaType?: MediaType },
  dwellSeconds: number
) {
  if (dwellSeconds < 2) return;
  const weight = Math.min(5, Math.round(dwellSeconds * 0.6 * 10) / 10);
  pushInteraction({
    id: movie.id,
    title: movie.title,
    genres: movie.genres,
    mediaType: movie.mediaType,
    kind: "dwell",
    weight,
  });
}

export function getExcludeTitleIds(): string[] {
  const ids = new Set<string>();
  for (const item of readInteractions()) {
    ids.add(item.id);
  }
  return [...ids];
}
