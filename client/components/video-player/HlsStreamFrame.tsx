"use client";

import { useCallback, useEffect, useImperativeHandle, useRef, useState, forwardRef } from "react";
import Hls, { type HlsConfig } from "hls.js";

interface SubtitleTrackInfo {
  lang: string;
  label: string;
  src: string;
}

export interface HlsQualityLevel {
  index: number;
  height: number;
  bitrate: number;
  label: string;
}

export interface AudioTrackInfo {
  id: number;
  name: string;
  lang: string;
  label: string;
}

interface HlsStreamFrameProps {
  src: string;
  title: string;
  onLoad?: () => void;
  onError?: () => void;
  subtitles?: SubtitleTrackInfo[];
  defaultSubtitle?: string;
  onLevelsLoaded?: (levels: HlsQualityLevel[]) => void;
  onAudioTracksLoaded?: (tracks: AudioTrackInfo[]) => void;
}

export interface HlsStreamFrameHandle {
  setQualityLevel: (index: number) => void;
  getQualityLevels: () => HlsQualityLevel[];
  setAudioTrack: (id: number) => void;
  getAudioTracks: () => AudioTrackInfo[];
}

const DRM_KEYFORMATS = [
  "com.apple.streamingkeydelivery",
  "urn:uuid:edef8ba9-79d6-4ace-a3c8-27dcd51d21ed",
  "com.microsoft.playready",
  "com.widevine.alpha",
] as const;

function detectDrmFromLevels(hls: Hls): boolean {
  try {
    for (const level of hls.levels) {
      const keyFormat = (level?.attrs as Record<string, string> | undefined)?.["KEYFORMAT"];
      if (keyFormat && DRM_KEYFORMATS.some((f) => keyFormat.includes(f))) {
        return true;
      }
    }

    for (const track of hls.audioTracks) {
      const keyFormat = (track?.attrs as Record<string, string> | undefined)?.["KEYFORMAT"];
      if (keyFormat && DRM_KEYFORMATS.some((f) => keyFormat.includes(f))) {
        return true;
      }
    }
  } catch {
    // levels / audioTracks may not be populated yet
  }
  return false;
}

function detectDrmFromManifestText(text: string): boolean {
  return /#EXT-X-KEY:METHOD=(SAMPLE-AES|AES-128)[^\n]*KEYFORMAT=["']/i.test(text);
}

function buildQualityLevels(hls: Hls): HlsQualityLevel[] {
  return hls.levels.map((level, index) => {
    const height = level.height || 0;
    const bitrate = level.bitrate || 0;
    const label =
      height >= 2160
        ? "4K"
        : height >= 1440
          ? "1440p"
          : height >= 1080
            ? "1080p"
            : height >= 720
              ? "720p"
              : height >= 480
                ? "480p"
                : `${height}p`;
    return { index, height, bitrate, label };
  });
}

const HlsStreamFrame = forwardRef<HlsStreamFrameHandle, HlsStreamFrameProps>(
  function HlsStreamFrame(
    { src, title, onLoad, onError, subtitles, defaultSubtitle, onLevelsLoaded, onAudioTracksLoaded },
    ref
  ) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const startedRef = useRef(false);
    const isMountedRef = useRef(true);
    const onLoadRef = useRef(onLoad);
    const onErrorRef = useRef(onError);
    const manifestCheckedRef = useRef(false);
    const levelsRef = useRef<HlsQualityLevel[]>([]);
    const audioTracksRef = useRef<AudioTrackInfo[]>([]);
    const errorAttemptRef = useRef(0);
    const [autoplayBlocked, setAutoplayBlocked] = useState(false);
    const [buffering, setBuffering] = useState(false);

    const VOD_HLS_CONFIG: Partial<HlsConfig> = {
      enableWorker: true,
      lowLatencyMode: true,

      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      backBufferLength: 30,
      maxBufferSize: 60 * 1000 * 1000,
      maxBufferHole: 0.5,

      startLevel: -1,
      capLevelToPlayerSize: true,
      startFragPrefetch: true,

      manifestLoadingTimeOut: 15_000,
      manifestLoadingMaxRetry: 4,
      manifestLoadingRetryDelay: 1000,
      levelLoadingTimeOut: 15_000,
      levelLoadingMaxRetry: 4,
      fragLoadingTimeOut: 20_000,
      fragLoadingMaxRetry: 6,
      fragLoadingRetryDelay: 800,
    };

    useEffect(() => {
      onLoadRef.current = onLoad;
    }, [onLoad]);

    useEffect(() => {
      onErrorRef.current = onError;
    }, [onError]);

    const destroy = useCallback(() => {
      const hls = hlsRef.current;
      if (hls) {
        hls.detachMedia();
        hls.destroy();
        hlsRef.current = null;
      }
    }, []);

    const safeError = useCallback(() => {
      if (!isMountedRef.current) return;
      destroy();
      onErrorRef.current?.();
    }, [destroy]);

    useImperativeHandle(
      ref,
      () => ({
        setQualityLevel: (index: number) => {
          const hls = hlsRef.current;
          if (!hls) return;
          if (index === -1) {
            hls.currentLevel = -1;
            return;
          }
          if (index >= 0 && index < hls.levels.length) {
            hls.currentLevel = index;
          }
        },
        getQualityLevels: () => levelsRef.current,
        setAudioTrack: (id: number) => {
          const hls = hlsRef.current;
          if (!hls) return;
          if (id >= 0 && id < hls.audioTracks.length) {
            hls.audioTrack = id;
          }
        },
        getAudioTracks: () => audioTracksRef.current,
      }),
      []
    );

    useEffect(() => {
      isMountedRef.current = true;
      return () => {
        isMountedRef.current = false;
      };
    }, []);

    useEffect(() => {
      const video = videoRef.current;
      if (!video || !src) return;

      let cancelled = false;
      startedRef.current = false;
      manifestCheckedRef.current = false;
      levelsRef.current = [];
      audioTracksRef.current = [];
      errorAttemptRef.current = 0;
      setAutoplayBlocked(false);
      setBuffering(false);
      destroy();

      function tryPlay(video: HTMLVideoElement) {
        const promise = video.play();
        if (promise) {
          promise.catch(() => {
            if (!cancelled && isMountedRef.current) {
              video.muted = true;
              setAutoplayBlocked(true);
              video.play().catch(() => {});
            }
          });
        }
      }

      function markPlaying() {
        if (startedRef.current || cancelled || !isMountedRef.current) return;
        startedRef.current = true;
        setBuffering(false);
        onLoadRef.current?.();
      }

      if (Hls.isSupported()) {
        const hls = new Hls(VOD_HLS_CONFIG);
        hlsRef.current = hls;

        hls.loadSource(src);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_LOADED, () => {
          if (cancelled || !isMountedRef.current) return;

          try {
            const xhr = (hls as unknown as Record<string, unknown>).loader as
              | { _context?: { response?: { data?: ArrayBuffer | string } } }
              | undefined;
            const raw = xhr?._context?.response?.data;
            if (typeof raw === "string" && detectDrmFromManifestText(raw)) {
              safeError();
              return;
            }
            if (raw instanceof ArrayBuffer) {
              const text = new TextDecoder().decode(raw);
              if (detectDrmFromManifestText(text)) {
                safeError();
                return;
              }
            }
          } catch {
            // Internal API may differ between hls.js versions — fall through
          }
        });

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          if (cancelled || !isMountedRef.current) return;
          manifestCheckedRef.current = true;

          if (detectDrmFromLevels(hls)) {
            safeError();
            return;
          }

          const levels = buildQualityLevels(hls);
          levelsRef.current = levels;
          if (levels.length > 1) {
            onLevelsLoaded?.(levels);
          }

          const audioTracks: AudioTrackInfo[] = hls.audioTracks.map((track, idx) => ({
            id: idx,
            name: track.name || track.lang || `Track ${idx + 1}`,
            lang: track.lang || "unknown",
            label: `${track.name || track.lang || `Audio ${idx + 1}`}${track.lang ? ` (${track.lang.toUpperCase()})` : ""}`,
          }));
          audioTracksRef.current = audioTracks;
          if (audioTracks.length > 1) {
            onAudioTracksLoaded?.(audioTracks);
          }

          tryPlay(video);
        });

        hls.on(Hls.Events.FRAG_BUFFERED, () => {
          if (cancelled || !isMountedRef.current) return;
          if (video.readyState >= 2) {
            tryPlay(video);
            markPlaying();
          }
        });

        hls.on(Hls.Events.LEVEL_LOADED, () => {
          if (cancelled || !isMountedRef.current || manifestCheckedRef.current) return;
          manifestCheckedRef.current = true;
          if (detectDrmFromLevels(hls)) {
            safeError();
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (cancelled || !isMountedRef.current) return;
          if (!data.fatal) {
            if (data.details === Hls.ErrorDetails.BUFFER_STALLED_ERROR) {
              setBuffering(true);
              hls.startLoad();
              return;
            }
            if (
              data.type === Hls.ErrorTypes.NETWORK_ERROR &&
              (data.details === Hls.ErrorDetails.FRAG_LOAD_ERROR ||
                data.details === Hls.ErrorDetails.FRAG_LOAD_TIMEOUT ||
                data.details === Hls.ErrorDetails.FRAG_PARSING_ERROR)
            ) {
              errorAttemptRef.current += 1;
              if (errorAttemptRef.current <= 3) {
                hls.startLoad();
                return;
              }
              errorAttemptRef.current = 0;
            }
            return;
          }

          if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }

          if (
            data.type === Hls.ErrorTypes.NETWORK_ERROR &&
            (data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR ||
              data.details === Hls.ErrorDetails.LEVEL_LOAD_ERROR ||
              data.details === Hls.ErrorDetails.MANIFEST_LOAD_TIMEOUT)
          ) {
            hls.startLoad(-1);
            return;
          }

          safeError();
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = src;
        tryPlay(video);
        video.addEventListener(
          "loadeddata",
          () => {
            if (!cancelled && isMountedRef.current) markPlaying();
          },
          { once: true }
        );
        video.addEventListener(
          "error",
          () => {
            if (!cancelled && isMountedRef.current) safeError();
          },
          { once: true }
        );
      }

      return () => {
        cancelled = true;
        destroy();
      };
    }, [src, destroy, safeError, onLevelsLoaded, onAudioTracksLoaded]);

    return (
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          title={title}
          playsInline
          autoPlay
          controls={false}
        >
          {subtitles?.map((sub) => (
            <track
              key={sub.src}
              kind="subtitles"
              srcLang={sub.lang}
              label={sub.label}
              src={sub.src}
              default={defaultSubtitle === sub.lang || undefined}
            />
          ))}
        </video>
        {autoplayBlocked && (
          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (video) {
                video.muted = false;
                setAutoplayBlocked(false);
              }
            }}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/60 transition-opacity duration-300 hover:bg-black/40"
            aria-label="Unmute"
          >
            <div className="flex flex-col items-center gap-3 rounded-2xl bg-black/80 px-6 py-4 text-white shadow-lg">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-[#f4c27a]">
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              </svg>
              <span className="text-sm font-semibold">Click to unmute</span>
            </div>
          </button>
        )}
        {buffering && (
          <div className="pointer-events-none absolute inset-0 z-5 flex items-center justify-center">
            <div className="rounded-full bg-black/70 px-4 py-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-[#f4c27a]" />
                <span className="text-[11px] font-medium text-stone-200">Buffering...</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default HlsStreamFrame;
