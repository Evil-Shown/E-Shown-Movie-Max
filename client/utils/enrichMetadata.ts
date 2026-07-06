export type EnrichedMetadata = {
  title: string;
  year: string | null;
  quality: string | null;
  source: string | null;
  codec: string | null;
  group: string | null;
  language: string | null;
  confidence: number;
};

const KNOWN_SOURCES = new Set([
  "bluray",
  "blu-ray",
  "webrip",
  "web-dl",
  "webdl",
  "hdtv",
  "dvdrip",
  "bdrip"
]);
const KNOWN_CODECS = new Set(["x264", "x265", "h264", "h265", "hevc", "av1", "xvid"]);
const KNOWN_GROUPS = new Set([
  "yify",
  "rarbg",
  "cmrg",
  "ettv",
  "sparks",
  "fgt",
  "tigole",
  "qxr"
]);

const YEAR_TOKEN = /^(19|20)\d{2}$/;
const QUALITY_TOKEN = /^(480p|720p|1080p|2160p|4k|hdr|hdr10|hdrx)$/i;
const EP_TOKEN = /^e\d{1,4}$/i;

export function enrichFromFilename(filename: string): EnrichedMetadata {
  const base = filename.replace(/\.(torrent|mkv|mp4|avi)$/i, "");
  const parts = base.split(/[.\-_]+/).filter(Boolean);

  let titleParts: string[] = [];
  let year: string | null = null;
  let quality: string | null = null;
  let source: string | null = null;
  let codec: string | null = null;
  let group: string | null = null;
  let language: string | null = null;

  for (const part of parts) {
    const lower = part.toLowerCase();
    if (!year && YEAR_TOKEN.test(part)) {
      year = part;
      continue;
    }
    if (!quality && QUALITY_TOKEN.test(part)) {
      quality = lower === "4k" ? "2160p" : lower;
      continue;
    }
    if (!source && KNOWN_SOURCES.has(lower)) {
      source = lower;
      continue;
    }
    if (!codec && KNOWN_CODECS.has(lower)) {
      codec = lower;
      continue;
    }
    if (EP_TOKEN.test(part)) {
      titleParts.push(part);
      continue;
    }
    if (!group && (KNOWN_GROUPS.has(lower) || /-[a-z0-9]+$/i.test(part))) {
      group = part;
      continue;
    }
    if (["tamil", "hindi", "telugu", "malayalam", "english", "dual"].includes(lower)) {
      language = lower;
      continue;
    }
    titleParts.push(part);
  }

  const title = titleParts.join(" ").replace(/\s+/g, " ").trim() || base;
  let confidence = 0;
  if (year) confidence += 0.3;
  if (quality) confidence += 0.2;
  if (codec) confidence += 0.2;
  if (group) confidence += 0.15;
  if (source) confidence += 0.15;

  return { title, year, quality, source, codec, group, language, confidence: Math.min(1, confidence) };
}

export type TmdbEnrichment = {
  poster_path: string | null;
  overview: string;
  vote_average: number;
  genres: string[];
};

export async function enrichWithTmdb(
  title: string,
  year: string | null
): Promise<TmdbEnrichment | null> {
  const key =
    process.env.NEXT_PUBLIC_TMDB_KEY ??
    process.env.TMDB_API_KEY;
  if (!key) return null;

  const cacheKey = `tmdb_${title}_${year ?? ""}`;
  if (typeof sessionStorage !== "undefined") {
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {
        /* ignore */
      }
    }
  }

  const params = new URLSearchParams({ api_key: key, query: title });
  if (year) params.set("year", year);

  try {
    const res = await fetch(`https://api.themoviedb.org/3/search/movie?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.results?.[0];
    if (!hit) return null;

    const enriched: TmdbEnrichment = {
      poster_path: hit.poster_path ?? null,
      overview: hit.overview ?? "",
      vote_average: hit.vote_average ?? 0,
      genres: []
    };

    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(cacheKey, JSON.stringify(enriched));
    }
    return enriched;
  } catch {
    return null;
  }
}

export async function enrichResultFromFilename(filename: string) {
  const meta = enrichFromFilename(filename);
  if (meta.confidence < 0.7) return { ...meta, tmdb: null };
  const tmdb = await enrichWithTmdb(meta.title, meta.year);
  return { ...meta, tmdb };
}
