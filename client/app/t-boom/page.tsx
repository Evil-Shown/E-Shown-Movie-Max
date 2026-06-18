"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BRAND_NAME } from "@/lib/brand";
import GodsEyeHero from "@/components/GodsEyeHero";
import TBoomResultCard from "@/components/TBoom/ResultCard";
import EmptyState from "@/components/TBoom/EmptyState";
import ErrorState from "@/components/TBoom/ErrorState";
import SkeletonCard from "@/components/TBoom/SkeletonCard";
import StreamingStats from "@/components/TBoom/StreamingStats";
import {
  isTboomError,
  normalizeSearchPayload,
  tboomResolveMagnet,
  tboomSearch,
  tboomSuggest,
  tboomTrending
} from "@/lib/tboomApi";
import { enrichFromFilename, enrichWithTmdb } from "@/utils/enrichMetadata";
import { RECENT_KEY, TRENDING_SEARCHES, loadRecentSearches, removeRecentSearch, saveRecentSearch as persistRecentSearch } from "@/utils/parseQuery";
import { getCachedSearch, setCachedSearch, shouldBypassCache, stripCacheBypass } from "@/utils/searchCache";
import { trackResultClick, trackSearch } from "@/utils/tboomAnalytics";

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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_GODS_EYE_API_URL ??
  process.env.NEXT_PUBLIC_TBOOM_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000";
const CONTINUE_KEY = "chithra_continue";
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
  if (!hasBrowserTorrentPrerequisites()) {
    throw new Error("WebTorrent requires a browser with WebRTC support.");
  }
  // Load from CDN only — the npm package pulls native node-datachannel and breaks `next build`.
  return loadWebTorrentFromCdn();
}

type ParsedTitle = {
  cleanTitle: string;
  year: string | null;
  quality: string | null;
  source: string | null;
  codec: string | null;
  language: string | null;
  group?: string | null;
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

function getHealthScoreLabel(seeders: number) {
  if (seeders > 100) return "Excellent";
  if (seeders >= 20) return "Good";
  return "Weak";
}

function getReadinessLabel(seeders: number) {
  if (seeders > 50) return "Stream Ready";
  if (seeders >= 10) return "Slow Start";
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
  const legacy = localStorage.getItem("tboom_recent_searches");
  const modern = localStorage.getItem("gods_eye_recent");
  if (legacy && !localStorage.getItem(RECENT_KEY)) {
    try {
      localStorage.setItem(RECENT_KEY, legacy);
    } catch {
      /* ignore */
    }
  }
  if (modern && !localStorage.getItem(RECENT_KEY)) {
    try {
      localStorage.setItem(RECENT_KEY, modern);
    } catch {
      /* ignore */
    }
  }
  return loadRecentSearches();
}

type ContinueWatching = {
  magnetURI: string;
  title: string;
  timestamp: number;
  poster?: string | null;
};

function loadContinueWatching(): ContinueWatching | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONTINUE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ContinueWatching;
  } catch {
    return null;
  }
}

function clearContinueWatching() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(CONTINUE_KEY);
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
  const [torrentNotice, setTorrentNotice] = useState<{
    title: string;
    message: string;
    tips: string[];
  } | null>(null);
  const [checkingSecurityName, setCheckingSecurityName] = useState<string | null>(null);
  const [showMagnetHelp, setShowMagnetHelp] = useState(false);
  const [downloadState, setDownloadState] = useState<{
    status: "idle" | "connecting" | "downloading" | "finalizing" | "done" | "failed" | "cancelled";
    title: string;
    message: string;
    progress: number;
    peers: number;
    speedMbps: number;
  }>({
    status: "idle",
    title: "",
    message: "",
    progress: 0,
    peers: 0,
    speedMbps: 0
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [searchFocused, setSearchFocused] = useState(false);
  const [posterMap, setPosterMap] = useState<Record<string, string | null>>({});
  const [continueWatching, setContinueWatching] = useState<ContinueWatching | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const clientRef = useRef<unknown>(null);
  const downloadClientRef = useRef<unknown>(null);
  const downloadTimeoutRef = useRef<number | null>(null);
  const searchDebounceRef = useRef<number | null>(null);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  const stopStreaming = useCallback(async () => {
    const client = clientRef.current as { destroy: () => Promise<void> | void } | null;
    setIsStopping(true);

    // Instant user feedback and immediate playback stop.
    setStreamingMagnet(null);
    setStreamingTitle("");
    setStreamReady(false);
    setStreamStats({ peers: 0, progress: 0, speedMbps: 0 });
    setIsPlaying(false);
    setPlaybackTime(0);
    setDuration(0);
    setVolume(1);
    setPlaybackRate(1);
    setSubtitleTracks([]);
    setError("");

    if (videoRef.current) {
      try {
        videoRef.current.pause();
      } catch {
        /* ignore */
      }
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }

    clientRef.current = null;

    if (client) {
      await Promise.resolve(client.destroy()).catch(() => undefined);
    }

    setIsStopping(false);
    setDownloadState((prev) =>
      prev.status === "idle"
        ? prev
        : {
            status: "idle",
            title: "",
            message: "",
            progress: 0,
            peers: 0,
            speedMbps: 0,
          }
    );
  }, []);

  function showActionMessage(type: "info" | "success" | "warning", text: string) {
    setActionMessage({ type, text });
    window.setTimeout(() => {
      setActionMessage((current) => (current?.text === text ? null : current));
    }, 2800);
  }

  function showTorrentNotice(title: string, message: string, tips: string[] = []) {
    setTorrentNotice({ title, message, tips });
  }

  function dismissTorrentNotice() {
    setTorrentNotice(null);
  }

  function extractInfoHash(input?: string) {
    const value = (input || "").trim();
    if (!value) return "";
    if (/^[a-fA-F0-9]{40}$/.test(value)) return value.toLowerCase();
    const match = value.match(/btih:([a-zA-Z0-9]+)/i);
    return match?.[1]?.toLowerCase() || "";
  }

  function clearDownloadTimeout() {
    if (downloadTimeoutRef.current) {
      window.clearTimeout(downloadTimeoutRef.current);
      downloadTimeoutRef.current = null;
    }
  }

  function triggerMagnetDownload(magnetHref: string) {
    const anchor = document.createElement("a");
    anchor.href = magnetHref;
    anchor.rel = "noopener noreferrer";
    anchor.style.display = "none";
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    showActionMessage("info", "Opening magnet in your torrent app (qBittorrent / FDM)...");
  }

  async function stopBrowserDownload(silent = false) {
    clearDownloadTimeout();
    const client = downloadClientRef.current as { destroy: () => Promise<void> | void } | null;
    downloadClientRef.current = null;

    if (!silent) {
      setDownloadState((prev) => ({
        ...prev,
        status: "cancelled",
        message: "Download cancelled."
      }));
    }

    if (client) {
      await Promise.resolve(client.destroy()).catch(() => undefined);
    }

    if (!silent) {
      window.setTimeout(() => {
        setDownloadState({
          status: "idle",
          title: "",
          message: "",
          progress: 0,
          peers: 0,
          speedMbps: 0
        });
      }, 2000);
    }
  }

  function saveBlobAsFile(blob: Blob, filename: string) {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  }

  function pickBestTorrentFile(files: Array<{ name: string; length?: number; getBlob?: (cb: (error: Error | null, blob: Blob) => void) => void }>) {
    const videoPattern = /\.(mp4|mkv|webm|avi|mov|m4v|ts|m2ts|mpg|mpeg|wmv|flv)$/i;
    const scored = [...files].sort((a, b) => Number(b.length || 0) - Number(a.length || 0));
    const video = scored.find((file) => videoPattern.test(file.name));
    if (video) return video;

    const blobCapable = scored.find((file) => typeof file.getBlob === "function");
    return blobCapable ?? scored[0];
  }

  async function startBrowserDownload(torrent: TorrentResult) {
    const magnetHref = normalizeMagnet(torrent.magnet);
    const title = torrent.name || "Download";
    if (!magnetHref) {
      showActionMessage("warning", "Cannot start download: magnet unavailable. Try Resolve Magnet first.");
      return;
    }

    await stopBrowserDownload(true);
    clearDownloadTimeout();

    setDownloadState({
      status: "connecting",
      title,
      message: "Initializing WebTorrent and connecting to peers...",
      progress: 0,
      peers: 0,
      speedMbps: 0
    });
    showActionMessage("info", "Download started — connecting to magnet network...");

    downloadTimeoutRef.current = window.setTimeout(async () => {
      setDownloadState((prev) => {
        if (prev.status !== "connecting" && prev.status !== "downloading") return prev;
        if (prev.peers > 0 || prev.progress > 1) return prev;
        return {
          status: "failed",
          title,
          message: "No peers found. Try another upload or use Open in Torrent App.",
          progress: 0,
          peers: 0,
          speedMbps: 0
        };
      });
      await stopBrowserDownload(true);
      showActionMessage("warning", "Connection timed out — no peers responded.");
    }, 45000);

    try {
      const WebTorrentCtor = await loadWebTorrentCtor();
      type TorrentFile = {
        name: string;
        length?: number;
        getBlob?: (cb: (error: Error | null, blob: Blob) => void) => void;
      };
      type TorrentInstance = {
        numPeers?: number;
        progress?: number;
        downloadSpeed?: number;
        on?: (event: string, cb: (...args: unknown[]) => void) => void;
        files: TorrentFile[];
      };

      const downloadClient = new (WebTorrentCtor as new () => {
        add: (magnetUri: string, callback: (torrent: TorrentInstance) => void) => void;
        destroy: () => Promise<void> | void;
      })();
      downloadClientRef.current = downloadClient;

      downloadClient.add(magnetHref, (torrentInstance) => {
        const updateDownloadStats = () => {
          const peers = Number(torrentInstance.numPeers || 0);
          const progress = Number((torrentInstance.progress || 0) * 100);
          if (peers > 0) clearDownloadTimeout();

          setDownloadState({
            status: progress > 0 || peers > 0 ? "downloading" : "connecting",
            title,
            message:
              peers > 0
                ? `Downloading (${peers} peer${peers === 1 ? "" : "s"} connected)...`
                : "Waiting for peers to connect...",
            progress,
            peers,
            speedMbps: Number((torrentInstance.downloadSpeed || 0) / (1024 * 1024))
          });
        };

        updateDownloadStats();
        torrentInstance.on?.("download", updateDownloadStats);
        torrentInstance.on?.("wire", updateDownloadStats);
        torrentInstance.on?.("warning", (warning: unknown) => {
          const message = warning instanceof Error ? warning.message : String(warning || "Unknown torrent warning.");
          showTorrentNotice("Torrent warning", message, [
            "Try a different upload with more seeders.",
            "Use Resolve Magnet again if the source link changed.",
            "Open the magnet in qBittorrent or Free Download Manager for a more stable transfer."
          ]);
        });
        torrentInstance.on?.("error", (torrentError: unknown) => {
          const message =
            torrentError instanceof Error ? torrentError.message : String(torrentError || "Unknown torrent error.");
          setDownloadState({
            status: "failed",
            title,
            message: message || "Torrent download failed.",
            progress: 0,
            peers: Number(torrentInstance.numPeers || 0),
            speedMbps: 0
          });
          showTorrentNotice("Download failed", message, [
            "Try another upload with more seeders.",
            "Use Open in Torrent App for a native torrent client.",
            "If the magnet keeps failing, the source may be dead or changed."
          ]);
          stopBrowserDownload(true).catch(() => undefined);
        });

        torrentInstance.on?.("done", () => {
          clearDownloadTimeout();
          const files = torrentInstance.files || [];
          const chosenFile = pickBestTorrentFile(files);

          if (!chosenFile?.getBlob) {
            setDownloadState({
              status: "failed",
              title,
              message: "Download finished but no saveable file was found in this torrent.",
              progress: 100,
              peers: Number(torrentInstance.numPeers || 0),
              speedMbps: 0
            });
            showTorrentNotice("No playable file", "The torrent completed, but we could not find a video file to save.", [
              "This upload may contain samples, extras, or non-video files only.",
              "Try another source with a clearer movie release name.",
              "Use the in-app stream only when the torrent contains a playable video file."
            ]);
            return;
          }

          setDownloadState({
            status: "finalizing",
            title,
            message: `Preparing ${chosenFile.name} for save...`,
            progress: 100,
            peers: Number(torrentInstance.numPeers || 0),
            speedMbps: 0
          });

          chosenFile.getBlob((blobError, blob) => {
            if (blobError || !blob) {
              setDownloadState({
                status: "failed",
                title,
                message: "Failed to prepare file for download.",
                progress: 100,
                peers: Number(torrentInstance.numPeers || 0),
                speedMbps: 0
              });
              showTorrentNotice("Save failed", "The torrent finished, but the browser could not extract the file.", [
                "This often happens with huge files or browser memory limits.",
                "Try a native torrent app if the file is very large.",
                "Use a source with a smaller or better-seeded release."
              ]);
              return;
            }

            saveBlobAsFile(blob, chosenFile.name || "download.bin");
            setDownloadState({
              status: "done",
              title,
              message: "File saved to your Downloads folder.",
              progress: 100,
              peers: Number(torrentInstance.numPeers || 0),
              speedMbps: 0
            });
            showActionMessage("success", "Download complete — check your Downloads folder.");
            Promise.resolve(
              (downloadClientRef.current as { destroy: () => Promise<void> | void } | null)?.destroy()
            ).catch(() => undefined);
            downloadClientRef.current = null;
            dismissTorrentNotice();
          });
        });
      });
    } catch {
      clearDownloadTimeout();
      setDownloadState({
        status: "failed",
        title,
        message: "Browser download engine failed to start.",
        progress: 0,
        peers: 0,
        speedMbps: 0
      });
      showActionMessage("warning", "Download could not start in browser.");
      showTorrentNotice("Browser download unavailable", "The browser torrent engine could not initialize.", [
        "Try refreshing and start again.",
        "If this keeps happening, use the desktop app or a native torrent client.",
        "Open in Torrent App is usually the most reliable option."
      ]);
    }
  }

  async function handleDownload(torrent: TorrentResult) {
    trackAction("download", activeQuery);
    await startBrowserDownload(torrent);
  }

  function addRecentSearch(term: string) {
    const next = persistRecentSearch(term);
    setRecentSearches(next);
  }

  const staticTrending = useMemo(
    () => TRENDING_SEARCHES.map((q) => ({ query: q, count: 0 })),
    []
  );

  const displayTrending = trendingSearches.length > 0 ? trendingSearches : staticTrending;

  async function fetchTrendingSearches() {
    try {
      const data = await tboomTrending();
      if (Array.isArray(data) && data.length > 0) {
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
      const data = await tboomSuggest(q);
      setSuggestions(data);
    } catch {
      setSuggestions([]);
    }
  }

  async function performSearch(searchQuery: string, options?: { saveRecent?: boolean; limit?: number }) {
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
            providersFailed: cached.meta?.providersFailed ?? []
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
        providersFailed: normalizedPayload.meta?.providersFailed ?? []
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
      const response = await tboomResolveMagnet({
        name: torrent.name,
        magnet: torrent.magnet,
        providerHint: torrent._providerHint
      });
      if (isTboomError(response) || !("magnet" in response) || !response.magnet) {
        const msg =
          !isTboomError(response) && "error" in response && typeof response.error === "string"
            ? response.error
            : "Could not resolve magnet for this upload.";
        setError(msg);
        return;
      }

      setResults((prev) =>
        prev.map((item) =>
          item.name === torrent.name && item.size === torrent.size && item.uploaded === torrent.uploaded
            ? { ...item, magnet: response.magnet }
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
      clearDownloadTimeout();
      const client = clientRef.current as { destroy: () => Promise<void> | void } | null;
      if (client) {
        client.destroy();
        clientRef.current = null;
      }
      const downloadClient = downloadClientRef.current as { destroy: () => Promise<void> | void } | null;
      if (downloadClient) {
        downloadClient.destroy();
        downloadClientRef.current = null;
      }
      if (streamingMagnet && streamingTitle) {
        try {
          localStorage.setItem(
            CONTINUE_KEY,
            JSON.stringify({
              magnetURI: streamingMagnet,
              title: streamingTitle,
              timestamp: Date.now()
            } satisfies ContinueWatching)
          );
        } catch {
          /* ignore */
        }
      }
    };
  }, [streamingMagnet, streamingTitle]);

  useEffect(() => {
    setContinueWatching(loadContinueWatching());
    fetchTrendingSearches();
  }, []);

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
              [name]: `https://image.tmdb.org/t/p/w185${tmdb.poster_path}`
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
      if (event.key === "Escape") {
        if (streamingMagnet) {
          stopStreaming();
        } else if (query) {
          setQuery("");
          setSuggestions([]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [streamingMagnet, query, stopStreaming]);

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
        await document.exitFullscreen().catch(() => undefined);
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
      const fileMeta = enrichFromFilename(torrent.name || "");
      const seedersNumber = toNumber(torrent.seeders);
      const leechersNumber = toNumber(torrent.leechers);
      return {
        ...torrent,
        parsed: { ...parsed, group: fileMeta.group },
        seedersNumber,
        leechersNumber,
        health: getHealthScoreLabel(seedersNumber),
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
          const resumeKey = `gods_eye_resume_${magnetUri}`;
          const legacyResumeKey = `tboom_resume_${magnetUri}`;
          const savedPositionRaw = localStorage.getItem(resumeKey) ?? localStorage.getItem(legacyResumeKey);
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
        <div className="relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-0 shadow-[var(--shadow-sm)]">
          <GodsEyeHero />
          <div className="px-5 pb-6 sm:px-6">
          {continueWatching && (
            <div className="mt-4 rounded-xl border border-[var(--border)] bg-[var(--bg-main)] p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--accent-cool)]">
                  Continue Watching
                </p>
                <button
                  type="button"
                  onClick={() => {
                    clearContinueWatching();
                    setContinueWatching(null);
                    showActionMessage("info", "Continue Watching history cleared.");
                  }}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-[10px] font-medium text-[var(--text-secondary)] transition hover:border-[var(--accent-primary)] hover:text-[var(--accent-primary)]"
                >
                  Clear
                </button>
              </div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-[var(--text-primary)]">{continueWatching.title}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => startTorrent(continueWatching.magnetURI, continueWatching.title)}
                    className="rounded-full bg-[var(--accent-primary)] px-4 py-1.5 text-xs font-semibold text-white"
                  >
                    Resume
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      clearContinueWatching();
                      setContinueWatching(null);
                      showActionMessage("info", "Continue Watching history cleared.");
                    }}
                    className="rounded-full border border-[var(--border-strong)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] transition hover:border-red-400 hover:text-red-600"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              ref={searchInputRef}
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
                      onClick={() => {
                        setQuery(item);
                        setResultLimit(30);
                        performSearch(item, { saveRecent: true, limit: 30 });
                      }}
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
                  onClick={() => {
                    setQuery(item.query);
                    setResultLimit(30);
                    performSearch(item.query, { saveRecent: true, limit: 30 });
                  }}
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
                  onClick={() => {
                    setQuery(title);
                    performSearch(title, { saveRecent: true, limit: 30 });
                  }}
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
          {error && (
            <div className="mt-4">
              <ErrorState
                error={error}
                onRetry={() => performSearch(activeQuery || trimmedQuery, { saveRecent: true, limit: resultLimit })}
              />
            </div>
          )}
          </div>
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

        {torrentNotice && (
          <div className="fixed inset-0 z-[155] flex items-center justify-center bg-black/55 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--accent-primary)]">
                    Torrent Notice
                  </p>
                  <h3 className="mt-1 font-[var(--font-playfair)] text-2xl text-[var(--text-primary)]">
                    {torrentNotice.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={dismissTorrentNotice}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
                >
                  Close
                </button>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">{torrentNotice.message}</p>
              {torrentNotice.tips.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                  {torrentNotice.tips.map((tip) => (
                    <li key={tip} className="rounded-xl border border-[var(--border)] bg-[var(--bg-main)] px-3 py-2">
                      {tip}
                    </li>
                  ))}
                </ul>
              )}
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMagnetHelp(true);
                    dismissTorrentNotice();
                  }}
                  className="rounded-full border border-[var(--border-strong)] px-4 py-2 text-sm font-medium text-[var(--text-primary)]"
                >
                  Open Help
                </button>
                <button
                  type="button"
                  onClick={dismissTorrentNotice}
                  className="rounded-full bg-[var(--accent-primary)] px-4 py-2 text-sm font-semibold text-white"
                >
                  Got it
                </button>
              </div>
            </div>
          </div>
        )}

        {showMagnetHelp && (
          <div className="fixed inset-0 z-[160] flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-xl rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-[var(--font-playfair)] text-2xl font-bold text-[var(--text-primary)]">
                    Magnet Setup Help
                  </h3>
                  <p className="mt-1 text-sm text-[var(--text-secondary)]">
                    If download does not open, set a default app for magnet links.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMagnetHelp(false)}
                  className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
                >
                  Close
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[var(--text-secondary)]">
                <p className="font-semibold text-[var(--text-primary)]">Windows (recommended)</p>
                <p>
                  1) Install qBittorrent or Free Download Manager.
                  <br />
                  2) Open Windows Settings &gt; Apps &gt; Default apps &gt; Choose defaults by link type.
                  <br />
                  3) Find <code>MAGNET</code> and set it to qBittorrent/FDM.
                </p>
                <p className="font-semibold text-[var(--text-primary)]">Chrome/Edge</p>
                <p>
                  1) Click a magnet link once.
                  <br />
                  2) Allow external app prompt when browser asks.
                  <br />
                  3) In browser site settings, allow protocol handlers if blocked.
                </p>
                <p className="font-semibold text-[var(--text-primary)]">Quick test</p>
                <p>
                  Click <strong>Copy Magnet</strong>, paste into qBittorrent/FDM manually.
                  If it starts there, your downloader is working and only protocol association needed.
                </p>
              </div>
            </div>
          </div>
        )}

        <div id="results" className="mt-8 space-y-4">
          {downloadState.status !== "idle" && (
            <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 shadow-[var(--shadow-sm)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Download Status</p>
                  {downloadState.title && (
                    <p className="mt-0.5 max-w-xl truncate text-xs text-[var(--text-secondary)]">{downloadState.title}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      downloadState.status === "done"
                        ? "bg-emerald-500/15 text-emerald-700"
                        : downloadState.status === "failed" || downloadState.status === "cancelled"
                          ? "bg-red-500/15 text-red-600"
                          : "bg-[var(--accent-primary)]/15 text-[var(--accent-primary)]"
                    } ${downloadState.status === "connecting" ? "animate-pulse" : ""}`}
                  >
                    {downloadState.status.toUpperCase()}
                  </span>
                  {(downloadState.status === "connecting" ||
                    downloadState.status === "downloading" ||
                    downloadState.status === "finalizing") && (
                    <button
                      type="button"
                      onClick={() => stopBrowserDownload()}
                      className="rounded-full border border-[var(--border-strong)] px-3 py-1 text-xs font-medium text-[var(--text-primary)] transition hover:border-red-400 hover:text-red-600"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{downloadState.message}</p>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-main)]">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    downloadState.status === "failed" || downloadState.status === "cancelled"
                      ? "bg-red-400"
                      : downloadState.status === "done"
                        ? "bg-emerald-500"
                        : "bg-[var(--accent-primary)]"
                  } ${downloadState.status === "connecting" ? "animate-pulse" : ""}`}
                  style={{ width: `${Math.max(downloadState.status === "connecting" ? 8 : 2, Math.min(100, downloadState.progress))}%` }}
                />
              </div>
              <p className="mt-2 text-xs text-[var(--text-secondary)]">
                Progress: {downloadState.progress.toFixed(1)}% | Peers: {downloadState.peers} | Speed:{" "}
                {downloadState.speedMbps.toFixed(2)} MB/s
              </p>
            </section>
          )}

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
            <StreamingStats
              peers={streamStats.peers}
              progress={streamStats.progress}
              downloadSpeedMbps={streamStats.speedMbps}
            />
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
              {[1, 2, 3, 4, 5, 6].map((row) => (
                <SkeletonCard key={row} />
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
                      const posterUrl = torrent.name ? posterMap[torrent.name] : null;

                      return (
                        <TBoomResultCard
                          key={`${group.key}-${index}`}
                          result={{ ...torrent, posterUrl }}
                          isStreaming={isStreaming}
                          magnetHref={magnetHref}
                          downloadDisabled={
                            downloadState.status === "connecting" ||
                            downloadState.status === "downloading" ||
                            downloadState.status === "finalizing"
                          }
                          resolving={resolvingMagnetName === torrent.name}
                          checkingSecurity={checkingSecurityName === torrent.name}
                          onDownload={() => {
                            trackResultClick(activeQuery, index, "download_click");
                            handleDownload(torrent);
                          }}
                          onStream={() => {
                            trackResultClick(activeQuery, index, "stream_click");
                            trackAction("stream", activeQuery);
                            showActionMessage("info", "Preparing secure stream...");
                            startTorrent(torrent.magnet, torrent.name);
                          }}
                          onCopyMagnet={async () => {
                            if (!magnetHref) return;
                            await navigator.clipboard.writeText(magnetHref);
                            showActionMessage("success", "Copied!");
                          }}
                          onShare={async () => {
                            const shareData = {
                              title: torrent.name || `${BRAND_NAME} upload`,
                              url: window.location.href
                            };
                            if (navigator.share) {
                              try {
                                await navigator.share(shareData);
                              } catch {
                                await navigator.clipboard.writeText(window.location.href);
                                showActionMessage("success", "Link copied.");
                              }
                            } else {
                              await navigator.clipboard.writeText(window.location.href);
                              showActionMessage("success", "Link copied.");
                            }
                          }}
                          onOpenTorrentApp={() => {
                            if (!magnetHref) return;
                            trackAction("download", activeQuery);
                            triggerMagnetDownload(magnetHref);
                          }}
                          onMagnetHelp={() => setShowMagnetHelp(true)}
                          onSecurityCheck={() => checkSecurityForTorrent(torrent)}
                          onResolveMagnet={() => resolveMagnetForTorrent(torrent)}
                        />
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}

          {searched && !loading && !error && flatResultCount === 0 && (
            <EmptyState
              onTrendingClick={() => {
                const pick = TRENDING_SEARCHES[0];
                setQuery(pick);
                performSearch(pick, { saveRecent: true, limit: 30 });
              }}
            />
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

