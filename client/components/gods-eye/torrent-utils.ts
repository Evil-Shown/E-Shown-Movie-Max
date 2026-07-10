import { enrichFromFilename } from "@/utils/enrichMetadata";
import type { EnrichedTorrent, GroupedTorrentResult, ParsedOperatorQuery, ParsedTitle, TorrentResult } from "./types";

export function parseTorrentTitle(rawTitle?: string): ParsedTitle {
  const value = rawTitle ?? "";
  const normalized = value.replace(/[._]/g, " ").replace(/\s+/g, " ").trim();
  const yearMatch = normalized.match(/\b(19|20)\d{2}\b/);
  const qualityMatch = normalized.match(/\b(2160p|1080p|720p|480p|4k)\b/i);
  const sourceMatch = normalized.match(/\b(BluRay|WEB[- ]DL|WEBRip|HDRip|DVDRip|CAM|HDTV)\b/i);
  const codecMatch = normalized.match(/\b(x265|x264|h\.?265|h\.?264|HEVC|AV1)\b/i);
  const languageMatch = normalized.match(/\b(English|Hindi|Tamil|Sinhala|Japanese|Korean)\b/i);
  const titleCutoff = yearMatch?.index ?? normalized.length;
  const cleanTitle = normalized.slice(0, titleCutoff).replace(/[-[(]$/, "").trim() || normalized;

  return {
    cleanTitle,
    year: yearMatch?.[0] ?? null,
    quality: qualityMatch?.[0]?.toUpperCase() ?? null,
    source: sourceMatch?.[0] ?? null,
    codec: codecMatch?.[0] ?? null,
    language: languageMatch?.[0] ?? null,
  };
}

export function parseSearchOperators(input: string): ParsedOperatorQuery {
  const operators: ParsedOperatorQuery["operators"] = {};
  let working = input;

  const yearMatch = working.match(/\byear:(\d{4})\b/i);
  if (yearMatch) {
    operators.year = yearMatch[1];
    working = working.replace(yearMatch[0], " ");
  }

  const qualityMatch = working.match(/\bquality:(2160p|1080p|720p|480p|4k)\b/i);
  if (qualityMatch) {
    operators.quality = qualityMatch[1].toUpperCase();
    working = working.replace(qualityMatch[0], " ");
  }

  const languageMatch = working.match(/\blanguage:(english|hindi|tamil|sinhala|japanese|korean)\b/i);
  if (languageMatch) {
    operators.language = languageMatch[1].toLowerCase();
    working = working.replace(languageMatch[0], " ");
  }

  const typeMatch = working.match(/\btype:(movie|tv|anime)\b/i);
  if (typeMatch) {
    operators.type = typeMatch[1].toLowerCase() as "movie" | "tv" | "anime";
    working = working.replace(typeMatch[0], " ");
  }

  const sizeMatch = working.match(/\bsize:(<=|>=|<|>)(\d+(?:\.\d+)?)gb\b/i);
  if (sizeMatch) {
    operators.size = {
      op: sizeMatch[1] as "<" | ">" | "<=" | ">=",
      valueGb: Number(sizeMatch[2]),
    };
    working = working.replace(sizeMatch[0], " ");
  }

  return {
    baseQuery: working.replace(/\s+/g, " ").trim(),
    operators,
  };
}

export function toNumber(value: number | string | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

export function getHealthScoreLabel(seeders: number) {
  if (seeders > 100) return "Excellent";
  if (seeders >= 20) return "Good";
  return "Weak";
}

export function getReadinessLabel(seeders: number) {
  if (seeders > 50) return "Stream Ready";
  if (seeders >= 10) return "Slow Start";
  return "Download Recommended";
}

export function parseSizeToGb(size?: string) {
  if (!size) return null;
  const normalized = size.toLowerCase().replace(/\s+/g, "");
  const match = normalized.match(/(\d+(?:\.\d+)?)(gb|mb)/);
  if (!match) return null;
  const value = Number(match[1]);
  const unit = match[2];
  if (!Number.isFinite(value)) return null;
  return unit === "mb" ? value / 1024 : value;
}

function matchesType(title: string, type: "movie" | "tv" | "anime") {
  const lower = title.toLowerCase();
  if (type === "anime") {
    return /(anime|subbed|dual audio|japanese)/i.test(title);
  }
  if (type === "tv") {
    return /\b(s\d{1,2}e\d{1,2}|season|episode|complete series|tv)\b/i.test(lower);
  }
  return !/\b(s\d{1,2}e\d{1,2}|season|episode|complete series)\b/i.test(lower);
}

export function groupTorrentResults(
  results: TorrentResult[],
  activeOperators: ParsedOperatorQuery["operators"]
): GroupedTorrentResult[] {
  const enriched: EnrichedTorrent[] = results.map((torrent) => {
    const parsed = parseTorrentTitle(torrent.name);
    const fileMeta = enrichFromFilename(torrent.name || "");
    const seedersNumber = toNumber(torrent.seeders);
    const leechersNumber = toNumber(torrent.leechers);
    return {
      ...torrent,
      parsed: { ...parsed, group: fileMeta.group },
      seedersNumber,
      leechersNumber,
      health: getHealthScoreLabel(seedersNumber),
      readiness: getReadinessLabel(seedersNumber),
    };
  });

  const filtered = enriched.filter((item) => {
    if (activeOperators.year && item.parsed.year !== activeOperators.year) return false;
    if (activeOperators.quality && item.parsed.quality !== activeOperators.quality) return false;
    if (activeOperators.language && item.parsed.language?.toLowerCase() !== activeOperators.language) return false;
    if (activeOperators.type && !matchesType(item.name || item.parsed.cleanTitle, activeOperators.type)) return false;
    if (activeOperators.size) {
      const sizeGb = parseSizeToGb(item.size);
      if (sizeGb == null) return false;
      const { op, valueGb } = activeOperators.size;
      if (op === "<" && !(sizeGb < valueGb)) return false;
      if (op === ">" && !(sizeGb > valueGb)) return false;
      if (op === "<=" && !(sizeGb <= valueGb)) return false;
      if (op === ">=" && !(sizeGb >= valueGb)) return false;
    }
    return true;
  });

  const groups = new Map<string, GroupedTorrentResult>();
  for (const torrent of filtered) {
    const key = `${torrent.parsed.cleanTitle.toLowerCase()}::${torrent.parsed.year ?? "na"}`;
    const qualityKey = torrent.parsed.quality || "Unknown";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        title: torrent.parsed.cleanTitle || "Unknown title",
        year: torrent.parsed.year,
        uploads: [],
        qualityCounts: {},
        bestSeeders: 0,
      });
    }
    const group = groups.get(key)!;
    group.uploads.push(torrent);
    group.qualityCounts[qualityKey] = (group.qualityCounts[qualityKey] || 0) + 1;
    group.bestSeeders = Math.max(group.bestSeeders, torrent.seedersNumber);
  }

  return [...groups.values()]
    .map((group) => ({
      ...group,
      uploads: group.uploads.sort((a, b) => b.seedersNumber - a.seedersNumber),
    }))
    .sort((a, b) => b.bestSeeders - a.bestSeeders);
}

export function normalizeMagnet(magnet?: string) {
  if (!magnet) return "";
  if (magnet.startsWith("magnet:?")) return magnet;
  return `magnet:?xt=urn:btih:${magnet}`;
}

export function formatTime(seconds: number) {
  const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${m}:${String(s).padStart(2, "0")}`;
}
