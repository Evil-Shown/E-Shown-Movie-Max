export type LiveTvRegion = "local" | "international";

export type LiveTvCategory =
  | "local"
  | "sports"
  | "entertainment"
  | "news"
  | "documentary"
  | "kids";

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

export type LiveTvCategoryFilter = "all" | LiveTvCategory;

export interface LiveTvRecentEntry {
  channelId: string;
  viewedAt: number;
}

export interface LiveTvContinueEntry {
  channelId: string;
  updatedAt: number;
}
