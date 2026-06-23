export type LiveTvRegion = "local" | "international";

export type LiveTvCategory =
  | "local"
  | "sports"
  | "entertainment"
  | "news"
  | "documentary"
  | "kids";

export interface LiveTvCinematicStyle {
  mood: string;
  primaryLight: string;
  secondaryLight: string;
  contrast: string;
  vignette: string;
  overlayGradient: string;
  hoverEffect: string;
}

export interface LiveTvStream {
  type: "hls" | "iframe" | "youtube";
  url: string;
  fallbacks?: string[];
  referer?: string;
  origin?: string;
  poster?: string;
  /** iptv-org channel id for dynamic stream lookup */
  iptvChannelId?: string;
  /** Broadcaster embed page when HLS fallbacks fail */
  embedFallback?: string;
}

export interface StreamSource {
  url: string;
  referer?: string;
  origin?: string;
}

export interface LiveTvChannel {
  id: string;
  name: string;
  category: LiveTvCategory;
  region: LiveTvRegion;
  isHd: boolean;
  isFeatured?: boolean;
  logo?: string;
  logoColor: string;
  logoInitials: string;
  description: string;
  cinematicStyle?: LiveTvCinematicStyle;
  stream?: LiveTvStream;
}

export type LiveTvCategoryFilter = "all" | LiveTvCategory;

export interface LiveTvRecentEntry {
  channelId: string;
  viewedAt: number;
}

export interface LiveTvContinueEntry {
  channelId: string;
  updatedAt: number;
}
