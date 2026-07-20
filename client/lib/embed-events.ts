export interface EmbedPlayerEventData {
  event?: string;
  type?: string;
  currentTime?: number;
  duration?: number;
  tmdbId?: number;
  mediaType?: "movie" | "tv";
  season?: number;
  episode?: number;
}

function asRecord(data: unknown): Record<string, unknown> | null {
  if (!data) return null;
  if (typeof data === "string") {
    try {
      const parsed: unknown = JSON.parse(data);
      if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
    } catch {
      return null;
    }
    return null;
  }
  if (typeof data === "object") return data as Record<string, unknown>;
  return null;
}

export function parseEmbedPlayerEvent(data: unknown): EmbedPlayerEventData | null {
  const payload = asRecord(data);
  if (!payload) return null;

  const nested = payload.data;
  if (payload.type === "PLAYER_EVENT" && nested && typeof nested === "object") {
    return nested as EmbedPlayerEventData;
  }

  if (typeof payload.event === "string" || typeof payload.type === "string") {
    return {
      event: typeof payload.event === "string" ? payload.event : undefined,
      type: typeof payload.type === "string" ? payload.type : undefined,
      currentTime: typeof payload.currentTime === "number" ? payload.currentTime : undefined,
      duration: typeof payload.duration === "number" ? payload.duration : undefined,
      tmdbId: typeof payload.tmdbId === "number" ? payload.tmdbId : undefined,
      mediaType: payload.mediaType === "movie" || payload.mediaType === "tv" ? payload.mediaType : undefined,
      season: typeof payload.season === "number" ? payload.season : undefined,
      episode: typeof payload.episode === "number" ? payload.episode : undefined,
    };
  }

  return null;
}

export function isEmbedPlaybackStarted(data: unknown): boolean {
  const event = parseEmbedPlayerEvent(data);
  return event?.event === "play";
}

export function isEmbedPlaybackEnded(data: unknown): boolean {
  const event = parseEmbedPlayerEvent(data);
  if (!event) return false;
  const name = (event.event || event.type || "").toLowerCase();
  return name === "ended" || name === "complete" || name === "finished";
}

/** Provider signaled "up next" without necessarily ending yet. */
export function isEmbedUpNextSignal(data: unknown): boolean {
  const event = parseEmbedPlayerEvent(data);
  if (!event) return false;
  const name = (event.event || event.type || "").toLowerCase();
  return name === "upnext" || name === "up_next" || name === "next";
}

/**
 * True only when we have a real duration and playback is in the final window.
 * Never treat missing/zero duration as near-end.
 */
export function isEmbedNearEnd(data: unknown, remainingSeconds = 30): boolean {
  const event = parseEmbedPlayerEvent(data);
  if (!event) return false;
  const name = (event.event || "").toLowerCase();
  if (name && name !== "timeupdate" && name !== "progress") return false;

  const { currentTime, duration } = event;
  if (typeof currentTime !== "number" || typeof duration !== "number") return false;
  if (duration < 60 || currentTime <= 0) return false;
  return currentTime >= duration - remainingSeconds;
}

/**
 * Fullscreen bridge from proxied embed pages (see server/src/embed-proxy.ts).
 * Returns "enter" | "exit" when the in-player FS button asked the parent to handle it.
 */
export function getEmbedFullscreenAction(data: unknown): "enter" | "exit" | null {
  const payload = asRecord(data);
  if (!payload || payload.source !== "chithra-embed") return null;
  const name = String(payload.event || payload.type || "").toLowerCase();
  if (name === "fullscreen" || name === "enter-fullscreen" || name === "request-fullscreen") {
    return "enter";
  }
  if (name === "exit-fullscreen" || name === "fullscreen-exit") {
    return "exit";
  }
  return null;
}
