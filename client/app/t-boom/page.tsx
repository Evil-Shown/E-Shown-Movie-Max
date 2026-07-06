"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type TorrentResult = {
  name?: string;
  seeders?: number | string;
  leechers?: number | string;
  magnet?: string;
  size?: string;
  uploaded?: string;
  _providers?: string[];
  _providerHint?: string;
  link?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const RECENT_SEARCHES_KEY = "tboom_recent_searches";
const WEBTORRENT_FALLBACK_SCRIPT_ID = "webtorrent-browser-fallback";
const WEBTORRENT_FALLBACK_SCRIPT_SRC = "https://cdn.jsdelivr.net/npm/webtorrent@latest/dist/webtorrent.min.js";

type WebTorrentLikeCtor = new () => {
  add: (
    magnetUri: string,
    callback: (torrent: {
      infoHash?: string;
      numPeers?: number;
      progress?: number;
      downloadSpeed?: number;
      on?: (event: string, cb: () => void) => void;
      files: Array<{
        name: string;
        renderTo: (video: HTMLVideoElement, cb: (error: Error | null) => void) => void;
        getBlobURL?: (cb: (error: Error | null, url: string) => void) => void;
      }>;
    }) => void
  ) => void;
  destroy: () => Promise<void> | void;
};

declare global {
  interface Window {
    WebTorrent?: WebTorrentLikeCtor;
  }
}

function hasBrowserTorrentPrerequisites() {
  return typeof window !== "undefined" && typeof window.RTCPeerConnection !== "undefined";
}

function loadWebTorrentFromCdn(): Promise<WebTorrentLikeCtor> {
  return new Promise((resolve, reject) => {
    if (window.WebTorrent) {
      resolve(window.WebTorrent);
      return;
    }

    const existing = document.getElementById(WEBTORRENT_FALLBACK_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        if (window.WebTorrent) resolve(window.WebTorrent);
        else reject(new Error("WebTorrent fallback did not expose constructor."));
      });
      existing.addEventListener("error", () => reject(new Error("WebTorrent fallback script failed to load.")));
      return;
    }

    const script = document.createElement("script");
    script.id = WEBTORRENT_FALLBACK_SCRIPT_ID;
    script.src = WEBTORRENT_FALLBACK_SCRIPT_SRC;
    script.async = true;
    script.onload = () => {
      if (window.WebTorrent) resolve(window.WebTorrent);
      else reject(new Error("WebTorrent fallback did not expose constructor."));
    };
    script.onerror = () => reject(new Error("WebTorrent fallback script failed to load."));
    document.head.appendChild(script);
  });
}

async function loadWebTorrentCtor(): Promise<WebTorrentLikeCtor> {
  try {
    const webTorrentModule = await import("webtorrent");
    const ctor = (webTorrentModule.default ?? webTorrentModule) as WebTorrentLikeCtor;
    if (typeof ctor === "function") return ctor;
    throw new Error("Invalid WebTorrent module export.");
  } catch {
    return loadWebTorrentFromCdn();
  }
}

type ParsedTitle = {
  cleanTitle: string;
  year: string | null;
  quality: string | null;
  source: string | null;
  codec: string | null;
  language: string | null;
};

type ParsedOperatorQuery = {
  baseQuery: string;
  operators: {
    year?: string;
    quality?: string;
    language?: string;
    type?: "movie" | "tv" | "anime";
    size?: { op: "<" | ">" | "<=" | ">="; valueGb: number };
  };
};

function parseTorrentTitle(rawTitle?: string): ParsedTitle {
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
    language: languageMatch?.[0] ?? null
  };
}

function parseSearchOperators(input: string): ParsedOperatorQuery {
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
      valueGb: Number(sizeMatch[2])
    };
    working = working.replace(sizeMatch[0], " ");
  }

  return {
    baseQuery: working.replace(/\s+/g, " ").trim(),
    operators
  };
}

function toNumber(value: number | string | undefined) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function getHealthScoreLabel(seeders: number, leechers: number) {
  if (seeders >= 120 || (seeders >= 40 && seeders >= leechers * 1.5)) return "Excellent";
  if (seeders >= 20 || seeders > leechers) return "Good";
  return "Weak";
}

function getReadinessLabel(seeders: number) {
  if (seeders >= 60) return "Stream Ready";
  if (seeders >= 15) return "Slow Start";
  return "Download Recommended";
}

function parseSizeToGb(size?: string) {
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

type EnrichedTorrent = TorrentResult & {
  parsed: ParsedTitle;
  seedersNumber: number;
  leechersNumber: number;
  health: string;
  readiness: string;
};

type GroupedTorrentResult = {
  key: string;
  title: string;
  year: string | null;
  uploads: EnrichedTorrent[];
  qualityCounts: Record<string, number>;
  bestSeeders: number;
};

type SearchApiResponse = {
  results: TorrentResult[];
  meta?: {
    providersUsed?: string[];
    providersFailed?: string[];
  };
};

function getInitialRecentSearches() {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => typeof item === "string").slice(0, 8);
  } catch {
    return [];
  }
}

export default function TBoomPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TorrentResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [streamingMagnet, setStreamingMagnet] = useState<string | null>(null);
  const [streamingTitle, setStreamingTitle] = useState<string>("");
  const [streamReady, setStreamReady] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>(getInitialRecentSearches);
  const [trendingSearches, setTrendingSearches] = useState<Array<{ query: string; count: number }>>([]);
  const [activeQuery, setActiveQuery] = useState("");
  const [activeOperators, setActiveOperators] = useState<ParsedOperatorQuery["operators"]>({});
  const [resultLimit, setResultLimit] = useState(30);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const [providerMeta, setProviderMeta] = useState<{ providersUsed: string[]; providersFailed: string[] }>({
    providersUsed: [],
    providersFailed: []
  });
  const [streamStats, setStreamStats] = useState<{ peers: number; progress: number; speedMbps: number }>({
    peers: 0,
    progress: 0,
    speedMbps: 0
  });
  const [subtitleTracks, setSubtitleTracks] = useState<Array<{ label: string; src: string }>>([]);
  const [resolvingMagnetName, setResolvingMagnetName] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "info" | "success" | "warning"; text: string } | null>(null);
  const [checkingSecurityName, setCheckingSecurityName] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clientRef = useRef<unknown>(null);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  function showActionMessage(type: "info" | "success" | "warning", text: string) {
    setActionMessage({ type, text });
    window.setTimeout(() => {
      setActionMessage((current) => (current?.text === text ? null : current));
    }, 2800);
  }

  function extractInfoHash(input?: string) {
    const value = (input || "").trim();
    if (!value) return "";
    if (/^[a-fA-F0-9]{40}$/.test(value)) return value.toLowerCase();
    const match = value.match(/btih:([a-zA-Z0-9]+)/i);
    return match?.[1]?.toLowerCase() || "";
  }

  function triggerMagnetDownload(magnetHref: string) {
    const anchor = document.createElement("a");
    anchor.href = magnetHref;
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);

    window.setTimeout(() => {
      showActionMessage(
        "warning",
        "If download did not start, set qBittorrent or Free Download Manager as your magnet handler."
      );
    }, 1200);
  }

  function saveRecentSearch(term: string) {
    const normalized = term.trim();
    if (!normalized) return;

    const next = [normalized, ...recentSearches.filter((item) => item.toLowerCase() !== normalized.toLowerCase())].slice(0, 8);
    setRecentSearches(next);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }

  async function fetchTrendingSearches() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/trending`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setTrendingSearches(data);
      }
    } catch {
      setTrendingSearches([]);
    }
  }

  async function fetchSuggestions(q: string) {
    if (q.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/search/suggest?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      setSuggestions(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch {
      setSuggestions([]);
    }
  }

  async function performSearch(searchQuery: string, options?: { saveRecent?: boolean; limit?: number }) {
    const normalized = searchQuery.trim();
    const parsedQuery = parseSearchOperators(normalized);
    const providerQuery = parsedQuery.baseQuery || normalized;

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
      const response = await fetch(
        `${API_BASE_URL}/api/search?q=${encodeURIComponent(providerQuery)}&limit=${effectiveLimit}`
      );
      const data: SearchApiResponse | TorrentResult[] = await response.json();

      if (!response.ok) {
        setResults([]);
        setSearched(true);
        setError(data?.error || "Search failed.");
        return;
      }

      const normalizedPayload = Array.isArray(data)
        ? { results: data, meta: { providersUsed: [], providersFailed: [] } }
        : data;

      setActiveQuery(normalized);
      setActiveOperators(parsedQuery.operators);
      setResults(Array.isArray(normalizedPayload.results) ? normalizedPayload.results : []);
      setProviderMeta({
        providersUsed: normalizedPayload.meta?.providersUsed ?? [],
        providersFailed: normalizedPayload.meta?.providersFailed ?? []
      });
      setSearched(true);
      setExpandedGroups({});
      if (options?.saveRecent) {
        saveRecentSearch(normalized);
      }
      fetchTrendingSearches();
    } catch {
      setError("Unable to connect to search service.");
      setResults([]);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    setResultLimit(30);
    performSearch(trimmedQuery, { saveRecent: true, limit: 30 });
  }

  async function trackAction(type: "stream" | "download", searchQuery: string) {
    const endpoint = type === "stream" ? "stream" : "download";
    try {
      await fetch(`${API_BASE_URL}/api/analytics/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
    } catch {
      // Best-effort analytics.
    }
  }

  async function resolveMagnetForTorrent(torrent: TorrentResult) {
    const uploadName = torrent.name || "";
    if (!uploadName) return;
    setResolvingMagnetName(uploadName);
    setError("");
    try {
      const response = await fetch(`${API_BASE_URL}/api/search/resolve-magnet`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: torrent.name,
          magnet: torrent.magnet,
          providerHint: torrent._providerHint
        })
      });
      const data = await response.json();
      if (!response.ok || !data?.magnet) {
        setError(data?.error || "Could not resolve magnet for this upload.");
        return;
      }

      setResults((prev) =>
        prev.map((item) =>
          item.name === torrent.name && item.size === torrent.size && item.uploaded === torrent.uploaded
            ? { ...item, magnet: data.magnet }
            : item
        )
      );
      showActionMessage("success", "Magnet resolved. Stream/Download is ready.");
    } catch {
      setError("Magnet resolving failed. Try again.");
    } finally {
      setResolvingMagnetName(null);
    }
  }

  async function checkSecurityForTorrent(torrent: TorrentResult) {
    const hash = extractInfoHash(torrent.magnet);
    if (!hash) {
      showActionMessage("warning", "Security check unavailable: hash missing.");
      return;
    }

    setCheckingSecurityName(torrent.name || "");
    try {
      const response = await fetch(`${API_BASE_URL}/api/security/virustotal/report?hash=${encodeURIComponent(hash)}`);
      const data = await response.json();
      if (!response.ok) {
        showActionMessage("warning", data?.error || "Virus report unavailable right now.");
        return;
      }

      if (data.verdict === "risky") {
        showActionMessage(
          "warning",
          `Security warning: malicious=${data.stats?.malicious || 0}, suspicious=${data.stats?.suspicious || 0}.`
        );
      } else {
        showActionMessage("success", "Security check: no malicious flags in the latest VirusTotal report.");
      }
    } catch {
      showActionMessage("warning", "Security service failed. Please try again.");
    } finally {
      setCheckingSecurityName(null);
    }
  }

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onLoadedMetadata = () => setDuration(video.duration || 0);
    const onTimeUpdate = () => setPlaybackTime(video.currentTime || 0);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("timeupdate", onTimeUpdate);

    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("timeupdate", onTimeUpdate);
    };
  }, [streamingMagnet]);

  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current);
      }
      const client = clientRef.current as { destroy: () => Promise<void> | void } | null;
      if (client) {
        client.destroy();
        clientRef.current = null;
      }
    };
  }, []);

  function formatTime(seconds: number) {
    const safe = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function resetPlayerUiState() {
    setStreamReady(false);
    setStreamStats({ peers: 0, progress: 0, speedMbps: 0 });
    setSubtitleTracks([]);
    setIsPlaying(false);
    setPlaybackTime(0);
    setDuration(0);
    setPlaybackRate(1);
  }

  function clearVideoElement() {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (timeUpdateHandlerRef.current) {
      video.removeEventListener("timeupdate", timeUpdateHandlerRef.current);
      timeUpdateHandlerRef.current = null;
    }
    video.pause();
    video.removeAttribute("src");
    while (video.firstChild) {
      video.removeChild(video.firstChild);
    }
    video.load();
  }

  async function stopStreaming() {
    const client = clientRef.current as { destroy: () => Promise<void> | void } | null;
    setIsStopping(true);

    // Instant user feedback and immediate playback stop.
    clearVideoElement();
    setStreamingMagnet(null);
    setStreamingTitle("");
    resetPlayerUiState();

    if (!client) {
      setIsStopping(false);
      return;
    }

    clientRef.current = null;
    Promise.resolve(client.destroy())
      .catch(() => {
        // Ignore destroy errors after forced UI stop.
      })
      .finally(() => {
        setIsStopping(false);
      });
  }

  function handleTogglePlay() {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        showActionMessage("warning", "Playback start was blocked by browser policy.");
      });
    } else {
      videoRef.current.pause();
    }
  }

  function handleSeek(seconds: number) {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setPlaybackTime(seconds);
  }

  function handleVolume(nextVolume: number) {
    if (!videoRef.current) return;
    const normalized = Math.max(0, Math.min(1, nextVolume));
    videoRef.current.volume = normalized;
    setVolume(normalized);
  }

  function handleSpeed(nextRate: number) {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }

  async function handlePictureInPicture() {
    const video = videoRef.current;
    if (!video || !document.pictureInPictureEnabled) {
      showActionMessage("warning", "Picture-in-picture is not available in this browser.");
      return;
    }
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await video.requestPictureInPicture();
      }
    } catch {
      showActionMessage("warning", "Could not toggle picture-in-picture.");
    }
  }

  async function handleFullscreen() {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await video.requestFullscreen();
      }
    } catch {
      showActionMessage("warning", "Could not toggle fullscreen.");
    }
  }

  function normalizeMagnet(magnet?: string) {
    if (!magnet) return "";
    if (magnet.startsWith("magnet:?")) return magnet;
    return `magnet:?xt=urn:btih:${magnet}`;
  }

  const groupedResults = useMemo<GroupedTorrentResult[]>(() => {
    const enriched: EnrichedTorrent[] = results.map((torrent) => {
      const parsed = parseTorrentTitle(torrent.name);
      const seedersNumber = toNumber(torrent.seeders);
      const leechersNumber = toNumber(torrent.leechers);
      return {
        ...torrent,
        parsed,
        seedersNumber,
        leechersNumber,
        health: getHealthScoreLabel(seedersNumber, leechersNumber),
        readiness: getReadinessLabel(seedersNumber)
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
          bestSeeders: 0
        });
      }
      const group = groups.get(key)!;
      group.uploads.push(torrent);
      group.qualityCounts[qualityKey] = (group.qualityCounts[qualityKey] || 0) + 1;
      group.bestSeeders = Math.max(group.bestSeeders, torrent.seedersNumber);
    }

    const sortedGroups = [...groups.values()]
      .map((group) => ({
        ...group,
        uploads: group.uploads.sort((a, b) => b.seedersNumber - a.seedersNumber)
      }))
      .sort((a, b) => b.bestSeeders - a.bestSeeders);

    return sortedGroups;
  }, [results, activeOperators]);

  const flatResultCount = groupedResults.reduce((total, group) => total + group.uploads.length, 0);

  async function startTorrent(magnet?: string, title?: string) {
    const magnetUri = normalizeMagnet(magnet);
    if (!magnetUri) {
      setError("Magnet link unavailable for this torrent.");
      return;
    }

    if (!hasBrowserTorrentPrerequisites()) {
      setError("Browser streaming is not supported here. Use 'Download via Torrent' in qBittorrent/FDM.");
      return;
    }

    if (clientRef.current) {
      await stopStreaming();
    }

    setStreamingMagnet(magnetUri);
    setStreamingTitle(title ?? "Streaming now");
    resetPlayerUiState();
    setError("");

    try {
      const WebTorrentCtor = await loadWebTorrentCtor();
      const client = new WebTorrentCtor();
      clientRef.current = client;

      client.add(magnetUri, (torrent) => {
        if (!videoRef.current) {
          setError("Video player is not ready.");
          stopStreaming();
          return;
        }

        const videoFile =
          torrent.files.find((file) => /\.(mp4|mkv|webm|avi|mov)$/i.test(file.name)) ?? torrent.files[0];
        const subtitleFiles = torrent.files.filter((file) => /\.(srt|vtt)$/i.test(file.name));

        if (!videoFile) {
          setError("No playable file found in this torrent.");
          stopStreaming();
          return;
        }

        if (subtitleFiles.length > 0) {
          Promise.all(
            subtitleFiles.map(
              (file) =>
                new Promise<{ label: string; src: string } | null>((resolve) => {
                  if (!file.getBlobURL) {
                    resolve(null);
                    return;
                  }
                  file.getBlobURL((blobError: Error | null, url: string) => {
                    if (blobError || !url) {
                      resolve(null);
                      return;
                    }
                    resolve({
                      label: file.name,
                      src: url
                    });
                  });
                })
            )
          ).then((tracks) => {
            setSubtitleTracks(tracks.filter((item): item is { label: string; src: string } => Boolean(item)));
          });
        }

        videoFile.renderTo(videoRef.current, (renderError: Error | null) => {
          if (renderError) {
            setError("Failed to render stream in player.");
            stopStreaming();
            return;
          }

          setStreamReady(true);
          const resumeKey = `tboom_resume_${magnetUri}`;
          const savedPositionRaw = localStorage.getItem(resumeKey);
          const savedPosition = savedPositionRaw ? Number(savedPositionRaw) : 0;
          if (videoRef.current && Number.isFinite(savedPosition) && savedPosition > 0) {
            videoRef.current.currentTime = savedPosition;
          }
          if (videoRef.current) {
            videoRef.current.volume = volume;
            videoRef.current.playbackRate = playbackRate;
          }

          const onPersistTimeUpdate = () => {
            if (!videoRef.current) return;
            localStorage.setItem(resumeKey, String(videoRef.current.currentTime));
          };
          if (timeUpdateHandlerRef.current && videoRef.current) {
            videoRef.current.removeEventListener("timeupdate", timeUpdateHandlerRef.current);
          }
          timeUpdateHandlerRef.current = onPersistTimeUpdate;
          videoRef.current?.addEventListener("timeupdate", onPersistTimeUpdate);
          videoRef.current?.play().catch(() => {
            showActionMessage("info", "Press Play to start streaming.");
          });
        });

        const updateStats = () => {
          setStreamStats({
            peers: Number(torrent.numPeers || 0),
            progress: Number((torrent.progress || 0) * 100),
            speedMbps: Number((torrent.downloadSpeed || 0) / (1024 * 1024))
          });
        };
        updateStats();
        torrent.on?.("download", updateStats);
        torrent.on?.("wire", updateStats);
      });
    } catch {
      setError("WebTorrent failed to initialize. Use 'Download via Torrent' as fallback.");
      stopStreaming();
    }
  }

  return (
    <div className="section-base min-h-full px-6 py-16">
      <div className="mx-auto max-w-[980px]">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-cool)]">Torrent Search</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-[34px] font-bold text-[var(--text-primary)]">THE GOD&apos;S EYE</h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Search the world&apos;s uploads and instantly stream or download anything available.
          </p>

          <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(event) => {
                const nextValue = event.target.value;
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
              }}
              onFocus={fetchTrendingSearches}
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
                  onClick={() => {
                    setQuery(suggestion);
                    setResultLimit(30);
                    performSearch(suggestion, { saveRecent: true, limit: 30 });
                  }}
                  className="rounded-full border border-[var(--border)] bg-[var(--bg-main)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">Recent Searches</p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.length === 0 && <p className="text-xs text-[var(--text-secondary)]">No recent searches yet.</p>}
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setQuery(item);
                      setResultLimit(30);
                      performSearch(item, { saveRecent: true, limit: 30 });
                    }}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">Trending Searches</p>
              <div className="flex flex-wrap gap-2">
                {trendingSearches.length === 0 && <p className="text-xs text-[var(--text-secondary)]">Trending updates after searches.</p>}
                {trendingSearches.map((item) => (
                  <button
                    key={item.query}
                    type="button"
                    onClick={() => {
                      setQuery(item.query);
                      setResultLimit(30);
                      performSearch(item.query, { saveRecent: true, limit: 30 });
                    }}
                    className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                  >
                    {item.query} ({item.count})
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading && (
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
          {(providerMeta.providersUsed.length > 0 || providerMeta.providersFailed.length > 0) && (
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {providerMeta.providersUsed.map((provider) => (
                <span
                  key={`used-${provider}`}
                  className="rounded-full border border-[var(--accent-primary)]/35 bg-[var(--accent-primary)]/10 px-3 py-1 text-[var(--accent-primary)]"
                >
                  Provider: {provider}
                </span>
              ))}
              {providerMeta.providersFailed.map((provider) => (
                <span
                  key={`failed-${provider}`}
                  className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-main)] px-3 py-1 text-[var(--text-secondary)]"
                >
                  Failover used ({provider} down)
                </span>
              ))}
            </div>
          )}
          {Object.keys(activeOperators).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeOperators.year && (
                <button
                  type="button"
                  onClick={() => {
                    const next = activeQuery.replace(/\byear:\d{4}\b/i, "").replace(/\s+/g, " ").trim();
                    setQuery(next);
                    performSearch(next, { saveRecent: true, limit: resultLimit });
                  }}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                >
                  year:{activeOperators.year} x
                </button>
              )}
              {activeOperators.quality && (
                <button
                  type="button"
                  onClick={() => {
                    const next = activeQuery.replace(/\bquality:(2160p|1080p|720p|480p|4k)\b/i, "").replace(/\s+/g, " ").trim();
                    setQuery(next);
                    performSearch(next, { saveRecent: true, limit: resultLimit });
                  }}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                >
                  quality:{activeOperators.quality} x
                </button>
              )}
            </div>
          )}
          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
        </div>

        {actionMessage && (
          <div className="pointer-events-none fixed right-5 top-24 z-[140] max-w-md">
            <div
              className={`rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur-sm ${
                actionMessage.type === "success"
                  ? "border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                  : actionMessage.type === "warning"
                    ? "border-[var(--accent-cool)]/45 bg-[var(--accent-cool)]/14 text-[var(--accent-cool)]"
                    : "border-[var(--border)] bg-[var(--bg-card)]/95 text-[var(--text-secondary)]"
              }`}
            >
              {actionMessage.text}
            </div>
          </div>
        )}

        <div id="results" className="mt-8 space-y-4">

          <section
            className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)] ${
              streamingMagnet ? "" : "hidden"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent-cool)]">Now Streaming</p>
                <h2 className="mt-1 text-lg font-semibold text-[var(--text-primary)]">{streamingTitle}</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">
                  {streamReady ? "Playback ready." : "Preparing stream, connecting peers..."}
                </p>
                <p className="mt-1 text-xs text-[var(--text-secondary)]">
                  Peers: {streamStats.peers} | Buffer: {streamStats.progress.toFixed(0)}% | Speed: {streamStats.speedMbps.toFixed(2)} MB/s
                </p>
              </div>
              <button
                type="button"
                onClick={stopStreaming}
                disabled={isStopping}
                className="inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isStopping ? "Stopping..." : "Stop"}
              </button>
            </div>
            <video ref={videoRef} className="mt-4 w-full rounded-xl border border-[var(--border)] bg-black" />
            <div className="mt-3 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3">
              <div className="mb-2 flex items-center justify-between text-xs text-[var(--text-secondary)]">
                <span>{formatTime(playbackTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={duration || 0}
                value={Math.min(playbackTime, duration || 0)}
                onChange={(event) => handleSeek(Number(event.target.value))}
                className="w-full accent-[var(--accent-primary)]"
              />
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleTogglePlay}
                  className="inline-flex rounded-full bg-[var(--accent-primary)] px-4 py-2 text-xs font-semibold text-white transition hover:brightness-95"
                >
                  {isPlaying ? "Pause" : "Play"}
                </button>
                <button
                  type="button"
                  onClick={() => handleSeek(Math.max(0, playbackTime - 10))}
                  className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                >
                  -10s
                </button>
                <button
                  type="button"
                  onClick={() => handleSeek(Math.min(duration || playbackTime + 10, playbackTime + 10))}
                  className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                >
                  +10s
                </button>
                <button
                  type="button"
                  onClick={handlePictureInPicture}
                  className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                >
                  PiP
                </button>
                <button
                  type="button"
                  onClick={handleFullscreen}
                  className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs font-medium text-[var(--text-primary)]"
                >
                  Fullscreen
                </button>
                <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  Volume
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={volume}
                    onChange={(event) => handleVolume(Number(event.target.value))}
                    className="w-20 accent-[var(--accent-primary)]"
                  />
                </label>
                <label className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-3 py-2 text-xs text-[var(--text-primary)]">
                  Speed
                  <select
                    value={playbackRate}
                    onChange={(event) => handleSpeed(Number(event.target.value))}
                    className="bg-transparent text-[var(--text-primary)]"
                  >
                    <option value={0.75}>0.75x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                </label>
              </div>
            </div>
            {subtitleTracks.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {subtitleTracks.map((track) => (
                  <button
                    key={track.src}
                    type="button"
                    onClick={() => {
                      if (!videoRef.current) return;
                      const element = document.createElement("track");
                      element.kind = "subtitles";
                      element.label = track.label;
                      element.src = track.src;
                      element.default = true;
                      videoRef.current.appendChild(element);
                    }}
                    className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs text-[var(--text-secondary)]"
                  >
                    Load subtitle: {track.label}
                  </button>
                ))}
              </div>
            )}
          </section>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((row) => (
                <div key={row} className="animate-pulse rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                  <div className="h-5 w-3/4 rounded bg-[var(--bg-main)]" />
                  <div className="mt-3 h-4 w-1/2 rounded bg-[var(--bg-main)]" />
                  <div className="mt-4 h-8 w-40 rounded-full bg-[var(--bg-main)]" />
                </div>
              ))}
            </div>
          )}

          {groupedResults.map((group) => {
            const expanded = expandedGroups[group.key] ?? false;
            return (
              <article key={group.key} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-sm)]">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="font-[var(--font-playfair)] text-xl font-semibold text-[var(--text-primary)]">
                      {group.title}
                      {group.year ? ` (${group.year})` : ""}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--text-secondary)]">
                      {group.uploads.length} uploads grouped by quality.
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(group.qualityCounts).map(([quality, count]) => (
                        <span key={`${group.key}-${quality}`} className="rounded-full bg-[var(--bg-main)] px-2 py-1 text-xs text-[var(--text-secondary)]">
                          {quality}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedGroups((prev) => ({ ...prev, [group.key]: !expanded }))}
                    className="inline-flex rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                  >
                    {expanded ? "Hide uploads" : "Show uploads"}
                  </button>
                </div>

                {expanded && (
                  <div className="mt-4 space-y-4 border-t border-[var(--border)] pt-4">
                    {group.uploads.map((torrent, index) => {
                      const magnetHref = normalizeMagnet(torrent.magnet) || null;
                      const isStreaming = streamingMagnet === magnetHref;

                      return (
                        <div key={`${group.key}-${index}`} className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-4">
                          <p className="text-sm font-medium text-[var(--text-primary)]">{torrent.name || "Unknown upload title"}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full border border-emerald-500/35 bg-gradient-to-r from-emerald-500/20 to-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-700 shadow-[0_4px_12px_rgba(16,185,129,0.18)]">
                              {torrent.health}
                            </span>
                            <span className="rounded-full border border-sky-500/35 bg-gradient-to-r from-sky-500/20 to-cyan-400/10 px-3 py-1 text-xs font-semibold text-sky-700 shadow-[0_4px_12px_rgba(14,165,233,0.18)]">
                              {torrent.readiness}
                            </span>
                            {torrent.parsed.quality && (
                              <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-2 py-1 text-xs font-semibold text-violet-700">
                                {torrent.parsed.quality}
                              </span>
                            )}
                            {torrent.parsed.source && (
                              <span className="rounded-full border border-fuchsia-500/25 bg-fuchsia-500/10 px-2 py-1 text-xs font-semibold text-fuchsia-700">
                                {torrent.parsed.source}
                              </span>
                            )}
                            {torrent.parsed.codec && (
                              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                                {torrent.parsed.codec}
                              </span>
                            )}
                            {torrent.parsed.language && (
                              <span className="rounded-full border border-[var(--border-strong)] bg-[var(--bg-card)] px-2 py-1 text-xs font-medium text-[var(--text-primary)]">
                                {torrent.parsed.language}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-[var(--text-secondary)]">
                            Seeders: {torrent.seedersNumber} | Leechers: {torrent.leechersNumber}
                            {torrent.size ? ` | Size: ${torrent.size}` : ""}
                            {torrent.uploaded ? ` | Uploaded: ${torrent.uploaded}` : ""}
                          </p>
                          {magnetHref ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  trackAction("download", activeQuery);
                                  showActionMessage(
                                    "info",
                                    "Tip: open this magnet in qBittorrent or Free Download Manager for faster speed, pause/resume, and stability."
                                  );
                                  triggerMagnetDownload(magnetHref);
                                }}
                                className="inline-flex rounded-full border border-[var(--accent-primary)]/55 bg-gradient-to-r from-[var(--accent-primary)]/22 to-[#f2bf79]/26 px-4 py-2 text-sm font-semibold text-[#9f4f1f] shadow-[0_8px_18px_rgba(201,106,43,0.22)] transition duration-200 hover:-translate-y-0.5 hover:from-[var(--accent-primary)]/30 hover:to-[#f2bf79]/34"
                              >
                                Download via Torrent
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  trackAction("stream", activeQuery);
                                  showActionMessage("info", "Preparing secure stream...");
                                  startTorrent(torrent.magnet, torrent.name);
                                }}
                                disabled={isStreaming}
                                className="inline-flex rounded-full bg-gradient-to-r from-[var(--accent-primary)] to-[#e0883d] px-4 py-2 text-sm font-semibold text-[var(--text-inverse)] shadow-[0_10px_22px_rgba(201,106,43,0.35)] transition duration-200 hover:-translate-y-0.5 hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {isStreaming ? "Streaming..." : "Stream"}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(magnetHref);
                                  showActionMessage("success", "Magnet copied. Paste into your downloader/client.");
                                }}
                                className="inline-flex rounded-full border border-[#6c63ff]/40 bg-gradient-to-r from-[#6c63ff]/16 to-[#8b5cf6]/14 px-4 py-2 text-sm font-semibold text-[#4f46e5] shadow-[0_8px_16px_rgba(99,102,241,0.18)] transition duration-200 hover:-translate-y-0.5 hover:from-[#6c63ff]/22 hover:to-[#8b5cf6]/20"
                              >
                                Copy Magnet
                              </button>
                              <button
                                type="button"
                                onClick={() => checkSecurityForTorrent(torrent)}
                                disabled={checkingSecurityName === torrent.name}
                                className="inline-flex rounded-full border border-teal-500/45 bg-gradient-to-r from-teal-500/18 to-cyan-400/16 px-4 py-2 text-sm font-semibold text-teal-700 shadow-[0_8px_16px_rgba(20,184,166,0.18)] transition duration-200 hover:-translate-y-0.5 hover:from-teal-500/24 hover:to-cyan-400/22 disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {checkingSecurityName === torrent.name ? "Checking..." : "Security Check"}
                              </button>
                            </div>
                          ) : (
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <p className="text-sm text-[var(--text-secondary)]">Magnet link unavailable.</p>
                              <button
                                type="button"
                                onClick={() => resolveMagnetForTorrent(torrent)}
                                disabled={resolvingMagnetName === torrent.name}
                                className="inline-flex rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)] disabled:cursor-not-allowed disabled:opacity-70"
                              >
                                {resolvingMagnetName === torrent.name ? "Resolving..." : "Resolve Magnet"}
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}

          {searched && !loading && !error && flatResultCount === 0 && (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-4 text-sm text-[var(--text-secondary)]">
              No results found for &quot;{activeQuery}&quot;. Try keywords like year, source, or quality (e.g., Interstellar 2014 1080p).
            </p>
          )}
          {searched && !loading && !error && results.length >= resultLimit && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => {
                  const nextLimit = resultLimit + 30;
                  setResultLimit(nextLimit);
                  performSearch(activeQuery, { limit: nextLimit });
                }}
                className="inline-flex rounded-full border border-[var(--border-strong)] px-5 py-2 text-sm font-medium text-[var(--text-primary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
