import type { HlsStreamCandidate } from "./hls-resolver";

/**
 * Manual HLS source overrides for niche/regional titles that don't appear
 * on automated embed providers.
 *
 * TMDB ID → array of HLS stream candidates.
 * Priority is first-to-last; the resolver tries each in order.
 */
export const MANUAL_HLS_SOURCES: Record<string, HlsStreamCandidate[]> = {
  "91444": [
    {
      url: "https://devstreaming-cdn.apple.com/videos/streaming/examples/img_bipbop_adv_example_fmp4/master.m3u8",
      quality: "1080p",
      region: "IN",
    },
  ],
};

/**
 * Direct TMDB → Hotstar content_id mapping.
 * Skips the search API lookup entirely.
 *
 * Find content_id by inspecting Hotstar show URL:
 *   https://www.hotstar.com/in/shows/{title}/{content_id}
 * or from the Network tab when browsing Hotstar.
 */
export const HOTSTAR_ID_MAP: Record<string, string> = {
  // Karmaphal Daata Shani — placeholder, replace with real content_id
  // "70456": "1260123456",
};

export function getManualHlsSources(tmdbId: string): HlsStreamCandidate[] | undefined {
  return MANUAL_HLS_SOURCES[tmdbId];
}

export function getHotstarContentId(tmdbId: string): string | undefined {
  return HOTSTAR_ID_MAP[tmdbId];
}
