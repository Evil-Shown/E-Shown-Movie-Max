export type ParsedQuery = {
  cleanTitle: string;
  year: string | null;
  quality: string | null;
  language: string | null;
  size: string | null;
  type: "movie" | "series" | "anime" | "unknown";
  season: string | null;
  episode: string | null;
};

const YEAR_RE = /\b(19|20)\d{2}\b/;
const QUALITY_RE =
  /\b(480p|720p|1080p|2160p|4k|hdr|hdrx|bluray|webrip|webdl|web-dl|hdtv)\b/i;
const SEASON_EP_RE = /\bS(\d{1,2})E(\d{1,2})\b/i;
const SEASON_RE = /\b(?:season|s)\s*(\d{1,2})\b/i;
const EPISODE_RE = /\b(?:episode|ep|e)\s*(\d{1,4})\b/i;
const ANIME_HINTS = /\banime\b/i;

const OPERATORS: Array<{ key: keyof ParsedQuery; re: RegExp }> = [
  { key: "year", re: /\byear:(\d{4})\b/i },
  { key: "quality", re: /\bquality:([^\s]+)\b/i },
  { key: "language", re: /\blanguage:([^\s]+)\b/i },
  { key: "type", re: /\btype:(movie|series|anime)\b/i },
  { key: "size", re: /\bsize:([^\s]+)\b/i }
];

function stripToken(text: string, token: string): string {
  return text.replace(new RegExp(`\\b${token}\\b`, "gi"), " ").replace(/\s+/g, " ").trim();
}

export function parseQuery(raw: string): ParsedQuery {
  let q = raw.trim();
  const result: ParsedQuery = {
    cleanTitle: q,
    year: null,
    quality: null,
    language: null,
    size: null,
    type: "unknown",
    season: null,
    episode: null
  };

  for (const { key, re } of OPERATORS) {
    const m = q.match(re);
    if (m) {
      const val = m[1];
      if (key === "type") {
        result.type = val.toLowerCase() as ParsedQuery["type"];
      } else {
        (result as Record<string, string | null>)[key] = val;
      }
      q = q.replace(re, " ").replace(/\s+/g, " ").trim();
    }
  }

  const yearM = q.match(YEAR_RE);
  if (yearM && !result.year) {
    result.year = yearM[0];
    q = stripToken(q, yearM[0]);
  }

  const qualityM = q.match(QUALITY_RE);
  if (qualityM && !result.quality) {
    result.quality = qualityM[0].toLowerCase();
    q = stripToken(q, qualityM[0]);
  }

  const seM = q.match(SEASON_EP_RE);
  if (seM) {
    result.season = `S${seM[1].padStart(2, "0")}`;
    result.episode = `E${seM[2].padStart(2, "0")}`;
    q = stripToken(q, seM[0]);
    result.type = result.type === "unknown" ? "series" : result.type;
  } else {
    const seasonM = q.match(SEASON_RE);
    if (seasonM) {
      result.season = `S${seasonM[1].padStart(2, "0")}`;
      q = stripToken(q, seasonM[0]);
      result.type = result.type === "unknown" ? "series" : result.type;
    }
    const epM = q.match(EPISODE_RE);
    if (epM) {
      result.episode = `E${epM[1].padStart(2, "0")}`;
      q = stripToken(q, epM[0]);
      result.type = result.type === "unknown" ? "series" : result.type;
    }
  }

  if (ANIME_HINTS.test(raw) || result.type === "anime") {
    result.type = "anime";
  } else if (
    result.type === "unknown" &&
    (result.season || result.episode || /\bseason\b|\bepisode\b/i.test(raw))
  ) {
    result.type = "series";
  } else if (result.type === "unknown") {
    result.type = "movie";
  }

  result.cleanTitle = q.replace(/\s+/g, " ").trim();
  return result;
}

export const TRENDING_SEARCHES = [
  "Avengers Endgame",
  "One Piece",
  "Interstellar 4K",
  "Breaking Bad",
  "Dune Part Two",
  "Oppenheimer",
  "Attack on Titan",
  "Inception"
];

export const RECENT_KEY = "gods_eye_recent";
const LEGACY_RECENT_KEY = "tboom_recent";
export const RECENT_MAX = 8;

export function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_KEY) ?? localStorage.getItem(LEGACY_RECENT_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return loadRecentSearches();
  const prev = loadRecentSearches().filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...prev].slice(0, RECENT_MAX);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}

export function removeRecentSearch(query: string): string[] {
  const next = loadRecentSearches().filter((q) => q !== query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  return next;
}
