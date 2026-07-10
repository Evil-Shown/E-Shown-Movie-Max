export type LiveTvRegion = "local" | "international";

export type LiveTvCategory = "local" | "sports" | "entertainment" | "news" | "documentary" | "kids";

export type LiveTvCategoryFilter = "all" | LiveTvCategory;

export interface LiveTvStream {
  type: "hls" | "iframe" | "youtube";
  url: string;
  fallbacks?: string[];
  referer?: string;
  origin?: string;
  poster?: string;
  iptvChannelId?: string;
  embedFallback?: string;
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
}

export interface LiveTvChannelsResponse {
  channels: LiveTvChannel[];
  categoryLabels: Record<LiveTvCategory, string>;
}

export interface LiveTvResolveResponse {
  channelId: string;
  stream: LiveTvStream;
}

export interface NativeVideoSource {
  uri: string;
  headers?: Record<string, string>;
}
