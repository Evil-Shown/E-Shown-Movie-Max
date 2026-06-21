import type { HlsConfig } from "hls.js";

/** Fast-start HLS profile — tuned for live TV (values in correct hls.js units) */
export const FAST_START_HLS_CONFIG: Partial<HlsConfig> = {
  enableWorker: true,
  lowLatencyMode: true,

  // Buffer — small initial buffer = faster first frame (seconds, not ms)
  maxBufferLength: 10,
  maxMaxBufferLength: 30,
  backBufferLength: 20,
  maxBufferSize: 30 * 1000 * 1000, // 30 MB
  maxBufferHole: 0.5,

  // Start at lowest quality, upgrade after playback begins
  startLevel: 0,
  capLevelToPlayerSize: true,
  testBandwidth: false,
  startFragPrefetch: true,
  initialLiveManifestSize: 1,

  // Faster timeouts + limited retries → quicker fallback chain
  manifestLoadingTimeOut: 6000,
  manifestLoadingMaxRetry: 1,
  manifestLoadingRetryDelay: 400,
  levelLoadingTimeOut: 6000,
  levelLoadingMaxRetry: 1,
  fragLoadingTimeOut: 8000,
  fragLoadingMaxRetry: 2,
  fragLoadingRetryDelay: 400,

  // ABR — ramp quality up quickly once playing
  abrEwmaDefaultEstimate: 500000,
  abrBandWidthFactor: 0.85,
  abrBandWidthUpFactor: 0.7,
  maxLiveSyncPlaybackRate: 1.15,
};

export function createHlsConfig(referer?: string): Partial<HlsConfig> {
  return {
    ...FAST_START_HLS_CONFIG,
    xhrSetup: (xhr, url) => {
      if (referer && !url.includes("/api/live-tv/stream")) {
        xhr.setRequestHeader("Referer", referer);
      }
    },
  };
}

/** Milliseconds before trying next fallback URL (proxy can be slow on cold start) */
export const STREAM_ATTEMPT_TIMEOUT_MS = 12_000;
