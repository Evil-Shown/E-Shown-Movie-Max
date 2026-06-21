import type { HlsConfig } from "hls.js";

/** Fast-start HLS profile — tuned for proxied live TV */
export const FAST_START_HLS_CONFIG: Partial<HlsConfig> = {
  enableWorker: true,
  lowLatencyMode: false,

  maxBufferLength: 12,
  maxMaxBufferLength: 30,
  backBufferLength: 20,
  maxBufferSize: 30 * 1000 * 1000,
  maxBufferHole: 0.5,

  startLevel: 0,
  capLevelToPlayerSize: true,
  testBandwidth: false,
  startFragPrefetch: true,

  // Avoid hammering /api/live-tv/stream with manifest polls every second
  initialLiveManifestSize: 2,
  liveSyncDurationCount: 3,
  liveMaxLatencyDurationCount: 6,

  manifestLoadingTimeOut: 8000,
  manifestLoadingMaxRetry: 2,
  manifestLoadingRetryDelay: 500,
  levelLoadingTimeOut: 8000,
  levelLoadingMaxRetry: 2,
  fragLoadingTimeOut: 10000,
  fragLoadingMaxRetry: 3,
  fragLoadingRetryDelay: 500,

  abrEwmaDefaultEstimate: 500000,
  abrBandWidthFactor: 0.85,
  abrBandWidthUpFactor: 0.7,
  maxLiveSyncPlaybackRate: 1.1,
};

/** Referer/origin are applied server-side via /api/live-tv/stream */
export function createHlsConfig(): Partial<HlsConfig> {
  return { ...FAST_START_HLS_CONFIG };
}

export const STREAM_ATTEMPT_TIMEOUT_MS = 12_000;
