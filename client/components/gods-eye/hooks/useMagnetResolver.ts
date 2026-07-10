import { useCallback, useEffect, useRef, useState } from "react";
import { BRAND_NAME } from "@/lib/brand";
import { isTboomError, tboomResolveMagnet } from "@/lib/tboomApi";
import { trackResultClick } from "@/utils/tboomAnalytics";
import { API_BASE_URL, CONTINUE_KEY, clearContinueWatching, loadContinueWatching } from "../storage";
import { normalizeMagnet } from "../torrent-utils";
import type {
  ActionMessage,
  ContinueWatching,
  DownloadState,
  TorrentNotice,
  TorrentResult,
} from "../types";
import { hasBrowserTorrentPrerequisites, loadWebTorrentCtor } from "../webtorrent";

interface UseMagnetResolverOptions {
  activeQuery: string;
  results: TorrentResult[];
  setResults: React.Dispatch<React.SetStateAction<TorrentResult[]>>;
  onEscape?: () => void;
}

export function useMagnetResolver({ activeQuery, results, setResults, onEscape }: UseMagnetResolverOptions) {
  const [streamingMagnet, setStreamingMagnet] = useState<string | null>(null);
  const [streamingTitle, setStreamingTitle] = useState("");
  const [streamReady, setStreamReady] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [streamStats, setStreamStats] = useState({ peers: 0, progress: 0, speedMbps: 0 });
  const [subtitleTracks, setSubtitleTracks] = useState<Array<{ label: string; src: string }>>([]);
  const [resolvingMagnetName, setResolvingMagnetName] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<ActionMessage | null>(null);
  const [torrentNotice, setTorrentNotice] = useState<TorrentNotice | null>(null);
  const [checkingSecurityName, setCheckingSecurityName] = useState<string | null>(null);
  const [showMagnetHelp, setShowMagnetHelp] = useState(false);
  const [downloadState, setDownloadState] = useState<DownloadState>({
    status: "idle",
    title: "",
    message: "",
    progress: 0,
    peers: 0,
    speedMbps: 0,
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [continueWatching, setContinueWatching] = useState<ContinueWatching | null>(null);
  const [error, setError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const clientRef = useRef<unknown>(null);
  const downloadClientRef = useRef<unknown>(null);
  const downloadTimeoutRef = useRef<number | null>(null);
  const timeUpdateHandlerRef = useRef<(() => void) | null>(null);

  const showActionMessage = useCallback((type: ActionMessage["type"], text: string) => {
    setActionMessage({ type, text });
    window.setTimeout(() => {
      setActionMessage((current) => (current?.text === text ? null : current));
    }, 2800);
  }, []);

  const showTorrentNotice = useCallback((title: string, message: string, tips: string[] = []) => {
    setTorrentNotice({ title, message, tips });
  }, []);

  const dismissTorrentNotice = useCallback(() => {
    setTorrentNotice(null);
  }, []);

  const extractInfoHash = useCallback((input?: string) => {
    const value = (input || "").trim();
    if (!value) return "";
    if (/^[a-fA-F0-9]{40}$/.test(value)) return value.toLowerCase();
    const match = value.match(/btih:([a-zA-Z0-9]+)/i);
    return match?.[1]?.toLowerCase() || "";
  }, []);

  const clearDownloadTimeout = useCallback(() => {
    if (downloadTimeoutRef.current) {
      window.clearTimeout(downloadTimeoutRef.current);
      downloadTimeoutRef.current = null;
    }
  }, []);

  const triggerMagnetDownload = useCallback(
    (magnetHref: string) => {
      const anchor = document.createElement("a");
      anchor.href = magnetHref;
      anchor.rel = "noopener noreferrer";
      anchor.style.display = "none";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      showActionMessage("info", "Opening magnet in your torrent app (qBittorrent / FDM)...");
    },
    [showActionMessage]
  );

  const stopBrowserDownload = useCallback(
    async (silent = false) => {
      clearDownloadTimeout();
      const client = downloadClientRef.current as { destroy: () => Promise<void> | void } | null;
      downloadClientRef.current = null;

      if (!silent) {
        setDownloadState((prev) => ({
          ...prev,
          status: "cancelled",
          message: "Download cancelled.",
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
            speedMbps: 0,
          });
        }, 2000);
      }
    },
    [clearDownloadTimeout]
  );

  const saveBlobAsFile = useCallback((blob: Blob, filename: string) => {
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = filename;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  }, []);

  const pickBestTorrentFile = useCallback(
    (files: Array<{ name: string; length?: number; getBlob?: (cb: (error: Error | null, blob: Blob) => void) => void }>) => {
      const videoPattern = /\.(mp4|mkv|webm|avi|mov|m4v|ts|m2ts|mpg|mpeg|wmv|flv)$/i;
      const scored = [...files].sort((a, b) => Number(b.length || 0) - Number(a.length || 0));
      const video = scored.find((file) => videoPattern.test(file.name));
      if (video) return video;

      const blobCapable = scored.find((file) => typeof file.getBlob === "function");
      return blobCapable ?? scored[0];
    },
    []
  );

  const resetPlayerUiState = useCallback(() => {
    setStreamReady(false);
    setStreamStats({ peers: 0, progress: 0, speedMbps: 0 });
    setSubtitleTracks([]);
    setIsPlaying(false);
    setPlaybackTime(0);
    setDuration(0);
    setPlaybackRate(1);
  }, []);

  const stopStreaming = useCallback(async () => {
    const client = clientRef.current as { destroy: () => Promise<void> | void } | null;
    setIsStopping(true);

    setStreamingMagnet(null);
    setStreamingTitle("");
    resetPlayerUiState();
    setVolume(1);
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
  }, [resetPlayerUiState]);

  const startBrowserDownload = useCallback(
    async (torrent: TorrentResult) => {
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
        speedMbps: 0,
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
            speedMbps: 0,
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
              speedMbps: Number((torrentInstance.downloadSpeed || 0) / (1024 * 1024)),
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
              "Open the magnet in qBittorrent or Free Download Manager for a more stable transfer.",
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
              speedMbps: 0,
            });
            showTorrentNotice("Download failed", message, [
              "Try another upload with more seeders.",
              "Use Open in Torrent App for a native torrent client.",
              "If the magnet keeps failing, the source may be dead or changed.",
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
                speedMbps: 0,
              });
              showTorrentNotice("No playable file", "The torrent completed, but we could not find a video file to save.", [
                "This upload may contain samples, extras, or non-video files only.",
                "Try another source with a clearer movie release name.",
                "Use the in-app stream only when the torrent contains a playable video file.",
              ]);
              return;
            }

            setDownloadState({
              status: "finalizing",
              title,
              message: `Preparing ${chosenFile.name} for save...`,
              progress: 100,
              peers: Number(torrentInstance.numPeers || 0),
              speedMbps: 0,
            });

            chosenFile.getBlob((blobError, blob) => {
              if (blobError || !blob) {
                setDownloadState({
                  status: "failed",
                  title,
                  message: "Failed to prepare file for download.",
                  progress: 100,
                  peers: Number(torrentInstance.numPeers || 0),
                  speedMbps: 0,
                });
                showTorrentNotice("Save failed", "The torrent finished, but the browser could not extract the file.", [
                  "This often happens with huge files or browser memory limits.",
                  "Try a native torrent app if the file is very large.",
                  "Use a source with a smaller or better-seeded release.",
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
                speedMbps: 0,
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
          speedMbps: 0,
        });
        showActionMessage("warning", "Download could not start in browser.");
        showTorrentNotice("Browser download unavailable", "The browser torrent engine could not initialize.", [
          "Try refreshing and start again.",
          "If this keeps happening, use the desktop app or a native torrent client.",
          "Open in Torrent App is usually the most reliable option.",
        ]);
      }
    },
    [
      stopBrowserDownload,
      clearDownloadTimeout,
      showActionMessage,
      showTorrentNotice,
      pickBestTorrentFile,
      saveBlobAsFile,
      dismissTorrentNotice,
    ]
  );

  const trackAction = useCallback(async (type: "stream" | "download", searchQuery: string) => {
    const endpoint = type === "stream" ? "stream" : "download";
    try {
      await fetch(`${API_BASE_URL}/api/analytics/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
      });
    } catch {
      /* best-effort */
    }
  }, []);

  const resolveMagnetForTorrent = useCallback(
    async (torrent: TorrentResult) => {
      const uploadName = torrent.name || "";
      if (!uploadName) return;
      setResolvingMagnetName(uploadName);
      setError("");
      try {
        const response = await tboomResolveMagnet({
          name: torrent.name,
          magnet: torrent.magnet,
          providerHint: torrent._providerHint,
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
    },
    [setResults, showActionMessage]
  );

  const checkSecurityForTorrent = useCallback(
    async (torrent: TorrentResult) => {
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
    },
    [extractInfoHash, showActionMessage]
  );

  const startTorrent = useCallback(
    async (magnet?: string, title?: string) => {
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
                      resolve({ label: file.name, src: url });
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
              speedMbps: Number((torrent.downloadSpeed || 0) / (1024 * 1024)),
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
    },
    [stopStreaming, resetPlayerUiState, volume, playbackRate, showActionMessage]
  );

  const handleDownload = useCallback(
    async (torrent: TorrentResult) => {
      trackAction("download", activeQuery);
      await startBrowserDownload(torrent);
    },
    [trackAction, activeQuery, startBrowserDownload]
  );

  const handleTogglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {
        showActionMessage("warning", "Playback start was blocked by browser policy.");
      });
    } else {
      videoRef.current.pause();
    }
  }, [showActionMessage]);

  const handleSeek = useCallback((seconds: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = seconds;
    setPlaybackTime(seconds);
  }, []);

  const handleVolume = useCallback((nextVolume: number) => {
    if (!videoRef.current) return;
    const normalized = Math.max(0, Math.min(1, nextVolume));
    videoRef.current.volume = normalized;
    setVolume(normalized);
  }, []);

  const handleSpeed = useCallback((nextRate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  }, []);

  const handlePictureInPicture = useCallback(async () => {
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
  }, [showActionMessage]);

  const handleFullscreen = useCallback(async () => {
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
  }, [showActionMessage]);

  const handleStream = useCallback(
    (torrent: TorrentResult, index: number) => {
      trackResultClick(activeQuery, index, "stream_click");
      trackAction("stream", activeQuery);
      showActionMessage("info", "Preparing secure stream...");
      startTorrent(torrent.magnet, torrent.name);
    },
    [activeQuery, trackAction, showActionMessage, startTorrent]
  );

  const handleShare = useCallback(
    async (torrent: TorrentResult) => {
      const shareData = {
        title: torrent.name || `${BRAND_NAME} upload`,
        url: window.location.href,
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
    },
    [showActionMessage]
  );

  const clearContinue = useCallback(() => {
    clearContinueWatching();
    setContinueWatching(null);
    showActionMessage("info", "Continue Watching history cleared.");
  }, [showActionMessage]);

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
              timestamp: Date.now(),
            } satisfies ContinueWatching)
          );
        } catch {
          /* ignore */
        }
      }
    };
  }, [streamingMagnet, streamingTitle, clearDownloadTimeout]);

  useEffect(() => {
    setContinueWatching(loadContinueWatching());
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (streamingMagnet) {
          stopStreaming();
        } else {
          onEscape?.();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [streamingMagnet, stopStreaming, onEscape]);

  return {
    streamingMagnet,
    streamingTitle,
    streamReady,
    isStopping,
    streamStats,
    subtitleTracks,
    resolvingMagnetName,
    actionMessage,
    torrentNotice,
    checkingSecurityName,
    showMagnetHelp,
    setShowMagnetHelp,
    downloadState,
    isPlaying,
    playbackTime,
    duration,
    volume,
    playbackRate,
    continueWatching,
    error,
    setError,
    videoRef,
    stopStreaming,
    stopBrowserDownload,
    startTorrent,
    handleDownload,
    resolveMagnetForTorrent,
    checkSecurityForTorrent,
    triggerMagnetDownload,
    handleStream,
    handleShare,
    handleTogglePlay,
    handleSeek,
    handleVolume,
    handleSpeed,
    handlePictureInPicture,
    handleFullscreen,
    showActionMessage,
    dismissTorrentNotice,
    clearContinue,
    trackAction,
  };
}

export type MagnetResolverState = ReturnType<typeof useMagnetResolver>;
