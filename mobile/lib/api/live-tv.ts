import { apiGet } from "./client";
import type { LiveTvChannelsResponse, LiveTvResolveResponse } from "@/lib/live-tv/types";

const RESOLVE_TIMEOUT_MS = 30_000;

export function fetchLiveTvChannels(): Promise<LiveTvChannelsResponse> {
  return apiGet<LiveTvChannelsResponse>("/api/live-tv/channels");
}

export function resolveLiveTvStream(channelId: string): Promise<LiveTvResolveResponse> {
  return apiGet<LiveTvResolveResponse>(`/api/live-tv/resolve?id=${encodeURIComponent(channelId)}`, RESOLVE_TIMEOUT_MS);
}
