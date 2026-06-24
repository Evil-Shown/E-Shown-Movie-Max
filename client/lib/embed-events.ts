export interface EmbedPlayerEventData {
  event: "play" | "pause" | "seeked" | "ended" | "timeupdate" | string;
  currentTime?: number;
  duration?: number;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
}

export function parseEmbedPlayerEvent(data: unknown): EmbedPlayerEventData | null {
  if (!data || typeof data !== "object") return null;

  const payload = data as {
    type?: string;
    event?: string;
    data?: EmbedPlayerEventData;
  };

  if (payload.type === "PLAYER_EVENT" && payload.data?.event) {
    return payload.data;
  }

  if (typeof payload.event === "string") {
    return payload as EmbedPlayerEventData;
  }

  return null;
}

export function isEmbedPlaybackStarted(data: unknown): boolean {
  const event = parseEmbedPlayerEvent(data);
  return event?.event === "play";
}

export function isEmbedPlaybackEnded(data: unknown): boolean {
  const event = parseEmbedPlayerEvent(data);
  return event?.event === "ended";
}

export function isEmbedNearEnd(data: unknown, threshold = 0.94): boolean {
  const event = parseEmbedPlayerEvent(data);
  if (event?.event !== "timeupdate") return false;
  const { currentTime, duration } = event;
  if (!currentTime || !duration || duration <= 0) return false;
  return currentTime / duration >= threshold;
}
