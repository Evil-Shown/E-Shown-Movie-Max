"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import LiveTvPlayerChrome from "@/components/live-tv/LiveTvPlayerChrome";
import LiveTvPlayerLoading, { type LiveTvLoadingPhase } from "@/components/live-tv/LiveTvPlayerLoading";
import { createHlsConfig, STREAM_ATTEMPT_TIMEOUT_MS } from "@/lib/live-tv/hls-config";
import { getStreamSources, resolveProxiedStreamUrl, shouldProxyDirectly } from "@/lib/live-tv/streams";
import type { LiveTvChannel, LiveTvStream, StreamSource } from "@/lib/live-tv/types";

interface HlsVideoPlayerProps {
  stream: LiveTvStream;
  channel: LiveTvChannel;
  poster?: string;
  className?: string;
  onStatusChange?: (status: "loading" | "playing" | "error") => void;
}

const LIVE_EDGE_THRESHOLD = 12;
const CONTROLS_HIDE_MS = 3500;

export default function HlsVideoPlayer({
  stream,
  channel,
  poster,
  className = "",
  onStatusChange,
}: HlsVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<any>(null);
  const hideTimerRef = useRef<number | null>(null);
  const loadTimeoutRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onStatusChangeRef.current = onStatusChange;
  }, [onStatusChange]);

  const { url: streamUrl, fallbacks, referer, origin } = stream;
  const fallbackKey = (fallbacks ?? []).join("|");
  const sources = useMemo(
    () => getStreamSources({ url: streamUrl, fallbacks, referer, origin } as LiveTvStream),
    [streamUrl, fallbacks, referer, origin]
  );

  const streamKey = `${streamUrl}|${fallbackKey}`;

  const [urlIndex, setUrlIndex] = useState(0);
  const [useProxy, setUseProxy] = useState(() => shouldProxyDirectly(streamUrl));
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0.85);
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [canSeek, setCanSeek] = useState(false);
  const [atLiveEdge, setAtLiveEdge] = useState(true);
  const [seekProgress, setSeekProgress] = useState(1);
  const [seekStart, setSeekStart] = useState(0);
  const [seekEnd, setSeekEnd] = useState(0);
  const [buffering, setBuffering] = useState(false);

  const sourcesRef = useRef(sources);

  useEffect(() => {
    sourcesRef.current = sources;
  }, [sources]);

  const loadingPhase: LiveTvLoadingPhase = (() => {
    if (buffering && urlIndex === 0) return "buffer";
    if (urlIndex > 0) return "fallback";
    if (useProxy) return "proxy";
    return "connect";
  })();

  useEffect(() => {
    if (sources.length === 0) {
      setIsLoading(false);
      onStatusChangeRef.current?.("error");
    }
  }, [sources.length]);

  const getPlaybackUrl = useCallback(
    async (source: StreamSource, proxied: boolean) => (proxied ? resolveProxiedStreamUrl(source) : source.url),
    []
  );

  const clearLoadTimeout = useCallback(() => {
    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }
  }, []);

  const markPlaying = useCallback(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    clearLoadTimeout();
    setBuffering(false);
    setIsLoading(false);
    onStatusChangeRef.current?.("playing");
  }, [clearLoadTimeout]);

  const revealControls = useCallback(() => {
    setShowControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, CONTROLS_HIDE_MS);
  }, []);

  const updateSeekState = useCallback(() => {
    const video = videoRef.current;
    if (!video || video.seekable.length === 0) {
      setCanSeek(false);
      return;
    }

    const start = video.seekable.start(0);
    const end = video.seekable.end(video.seekable.length - 1);
    const window = end - start;

    setCanSeek(window > 20);
    setSeekStart(start);
    setSeekEnd(end);
    setAtLiveEdge(end - video.currentTime <= LIVE_EDGE_THRESHOLD);

    if (window > 0) {
      setSeekProgress(Math.min(1, Math.max(0, (video.currentTime - start) / window)));
    }
  }, []);

  const tryNextSource = useCallback((index: number, proxied: boolean) => {
    const list = sourcesRef.current;
    if (!proxied) {
      setUseProxy(true);
      return;
    }
    if (index + 1 < list.length) {
      startedRef.current = false;
      setUrlIndex(index + 1);
      setUseProxy(shouldProxyDirectly(list[index + 1]?.url ?? ""));
    } else {
      setIsLoading(false);
      onStatusChangeRef.current?.("error");
    }
  }, []);

  const destroyHls = useCallback(() => {
    hlsRef.current?.destroy();
    hlsRef.current = null;
    clearLoadTimeout();
  }, [clearLoadTimeout]);

  useEffect(() => {
    const video = videoRef.current;
    const list = sourcesRef.current;
    if (!video || urlIndex >= list.length) {
      onStatusChangeRef.current?.("error");
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    startedRef.current = false;
    setIsLoading(true);
    setBuffering(false);
    onStatusChangeRef.current?.("loading");

    const source = list[urlIndex];

    destroyHls();

    loadTimeoutRef.current = window.setTimeout(() => tryNextSource(urlIndex, useProxy), STREAM_ATTEMPT_TIMEOUT_MS);

    async function boot() {
      const src = await getPlaybackUrl(source, useProxy);
      if (cancelled || !videoRef.current) return;

      const video = videoRef.current;

      try {
        const HlsModule = await import("hls.js");
        const Hls = HlsModule.default;
        if (Hls.isSupported()) {
          const hls = new Hls(createHlsConfig());
          hlsRef.current = hls;
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.FRAG_BUFFERED, () => {
            if (video.readyState >= 2) {
              video.play().catch(() => {});
              markPlaying();
            }
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setBuffering(true);
            video.play().catch(() => {});
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (!data.fatal) return;
            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
              return;
            }
            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
              if (
                data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
                data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR
              ) {
                hls.startLoad(-1);
                return;
              }
            }
            clearLoadTimeout();
            tryNextSource(urlIndex, useProxy);
          });
          return;
        }
      } catch {
        /* hls.js not available */
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        const onLoaded = () => {
          video.play().catch(() => {});
          markPlaying();
        };
        const onErr = () => {
          clearLoadTimeout();
          tryNextSource(urlIndex, useProxy);
        };
        video.addEventListener("loadeddata", onLoaded, { once: true });
        video.addEventListener("error", onErr, { once: true });
      }
    }

    boot();

    return () => {
      cancelled = true;
      destroyHls();
    };
  }, [urlIndex, useProxy, streamKey, getPlaybackUrl, markPlaying, tryNextSource, destroyHls, clearLoadTimeout]);

  useEffect(() => {
    setUrlIndex(0);
    setUseProxy(shouldProxyDirectly(streamUrl));
    setIsLoading(true);
    startedRef.current = false;
  }, [streamUrl, fallbackKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => updateSeekState();
    const onPlay = () => {
      setIsPlaying(true);
      revealControls();
    };
    const onPause = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("progress", onTimeUpdate);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("progress", onTimeUpdate);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [updateSeekState, revealControls]);

  useEffect(() => {
    const video = videoRef.current;
    if (video) video.volume = volume;
  }, [volume]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      if (isMuted) {
        video.muted = false;
        setIsMuted(false);
      }
    } else {
      video.pause();
    }
  };

  const handleToggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (progress: number) => {
    const video = videoRef.current;
    if (!video || !canSeek) return;
    video.currentTime = Math.max(seekStart, Math.min(seekEnd - 2, seekStart + progress * (seekEnd - seekStart)));
    updateSeekState();
    revealControls();
  };

  const handleGoLive = () => {
    const video = videoRef.current;
    if (!video || !canSeek) return;
    video.currentTime = seekEnd - 2;
    video.play().catch(() => {});
    updateSeekState();
  };

  const handleRewind = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(seekStart, video.currentTime - seconds);
    updateSeekState();
    revealControls();
  };

  const handleFullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else el.requestFullscreen().catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      className={`group relative h-full w-full overflow-hidden bg-black ${className}`}
      onMouseMove={revealControls}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={revealControls}
    >
      <video
        ref={videoRef}
        className="h-full w-full object-contain"
        playsInline
        autoPlay
        poster={poster}
        muted={isMuted}
        onDoubleClick={handleFullscreen}
      />

      {isLoading && (
        <div className="absolute inset-0 z-20">
          <LiveTvPlayerLoading channel={channel} phase={loadingPhase} overlay className="h-full" />
        </div>
      )}

      <LiveTvPlayerChrome
        channel={channel}
        isPlaying={isPlaying}
        isMuted={isMuted}
        volume={volume}
        isLoading={isLoading}
        canSeek={canSeek}
        atLiveEdge={atLiveEdge}
        seekProgress={seekProgress}
        showControls={showControls || isLoading || !isPlaying}
        onTogglePlay={handleTogglePlay}
        onToggleMute={handleToggleMute}
        onVolumeChange={(v) => {
          setVolume(v);
          if (v > 0 && isMuted) {
            setIsMuted(false);
            if (videoRef.current) videoRef.current.muted = false;
          }
        }}
        onSeek={handleSeek}
        onGoLive={handleGoLive}
        onRewind={handleRewind}
        onFullscreen={handleFullscreen}
      />
    </div>
  );
}
