export interface SubtitleTrackResult {
  id: string;
  language: string;
  label: string;
  url: string;
  format: string;
}

export interface SubtitleSearchResult {
  tracks: SubtitleTrackResult[];
  translationAvailable: boolean;
}

export interface SubtitleCue {
  start: number;
  end: number;
  text: string;
}

export async function searchSubtitleTracks(params: {
  tmdbId?: string | null;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  language?: string;
}): Promise<SubtitleSearchResult> {
  const query = new URLSearchParams();
  if (params.tmdbId) query.set("tmdbId", params.tmdbId);
  if (params.imdbId) query.set("imdbId", params.imdbId);
  if (params.season) query.set("season", String(params.season));
  if (params.episode) query.set("episode", String(params.episode));
  if (params.language) query.set("language", params.language);

  const response = await fetch(`/api/subtitles/search?${query.toString()}`);
  if (!response.ok) return { tracks: [], translationAvailable: false };

  const data = (await response.json()) as {
    tracks?: SubtitleTrackResult[];
    translationAvailable?: boolean;
  };
  return {
    tracks: data.tracks ?? [],
    translationAvailable: Boolean(data.translationAvailable),
  };
}

export function proxifySubtitleUrl(directUrl: string): string {
  return `/api/subtitles/proxy?url=${encodeURIComponent(directUrl)}`;
}

export function proxifyTranslatedSubtitleUrl(directUrl: string, translateTo: string): string {
  return `/api/subtitles/proxy?url=${encodeURIComponent(directUrl)}&translateTo=${encodeURIComponent(translateTo)}`;
}

export async function fetchSubtitleText(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to load subtitle file");
  }
  return response.text();
}

function parseTimestamp(value: string): number {
  const match = value.trim().match(/(?:(\d+):)?(\d{2}):(\d{2})[.,](\d{3})/);
  if (!match) return 0;
  const [, hours, minutes, seconds, milliseconds] = match;
  return (
    (Number(hours ?? "0") * 3600) +
    Number(minutes) * 60 +
    Number(seconds) +
    Number(milliseconds) / 1000
  );
}

export function parseSubtitleCues(text: string): SubtitleCue[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized.split("\n");
  const cues: SubtitleCue[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();
    if (!line || line === "WEBVTT") {
      index += 1;
      continue;
    }

    if (line.includes("-->")) {
      const [startRaw, endRaw] = line.split("-->").map((part) => part.trim().split(" ")[0]);
      const start = parseTimestamp(startRaw);
      const end = parseTimestamp(endRaw);
      index += 1;

      const textLines: string[] = [];
      while (index < lines.length && lines[index].trim()) {
        textLines.push(lines[index].trim());
        index += 1;
      }

      const cueText = textLines.join("\n").trim();
      if (cueText) cues.push({ start, end, text: cueText.replace(/<\/?[^>]+>/g, "").trim() });
      continue;
    }

    index += 1;
  }

  if (cues.length > 0) return cues;

  const srtBlocks = normalized.split(/\n{2,}/);
  for (const block of srtBlocks) {
    const linesInBlock = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const timingLine = linesInBlock.find((line) => line.includes("-->"));
    if (!timingLine) continue;
    const [startRaw, endRaw] = timingLine.split("-->").map((part) => part.trim().split(" ")[0]);
    const start = parseTimestamp(startRaw);
    const end = parseTimestamp(endRaw);
    const textLines = linesInBlock.filter((line) => line !== timingLine && !/^\d+$/.test(line));
    const cueText = textLines.join(" ").trim().replace(/<\/?[^>]+>/g, "");
    if (cueText) cues.push({ start, end, text: cueText });
  }

  return cues;
}

export async function resolveSubtitleForLanguage(params: {
  tmdbId?: string | null;
  imdbId?: string | null;
  season?: number;
  episode?: number;
  language: string;
}): Promise<{ lang: string; file?: string; label?: string }> {
  if (params.language === "off") {
    return { lang: "off" };
  }

  if (params.language === "si-auto") {
    const search = await searchSubtitleTracks({ ...params, language: "en" });
    const preferred = search.tracks[0];
    if (preferred?.url) {
      return {
        lang: "si-auto",
        file: proxifyTranslatedSubtitleUrl(preferred.url, "si"),
        label: "Sinhala (Auto)",
      };
    }
    return { lang: "si-auto", label: "Sinhala (Auto)" };
  }

  const search = await searchSubtitleTracks(params);
  const tracks = search.tracks;
  const preferred =
    tracks.find((track: SubtitleTrackResult) => track.language === params.language) ??
    tracks.find((track: SubtitleTrackResult) => track.language.startsWith(params.language)) ??
    tracks[0];

  if (preferred?.url) {
    return {
      lang: params.language,
      file: proxifySubtitleUrl(preferred.url),
      label: preferred.label,
    };
  }

  if (params.language === "si" && search.translationAvailable) {
    const translated = await resolveSubtitleForLanguage({
      ...params,
      language: "si-auto",
    });
    if (translated.file) return translated;
    return { lang: "si", label: "Sinhala (Auto)" };
  }

  return { lang: params.language };
}
