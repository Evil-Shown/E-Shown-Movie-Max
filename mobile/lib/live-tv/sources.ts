import type { LiveTvStream, NativeVideoSource } from "./types";

/** Direct HLS URLs for native playback — no manifest proxy. */
export function getDirectHlsSources(stream: LiveTvStream): NativeVideoSource[] {
  if (stream.type !== "hls") return [];

  const urls = [stream.url, ...(stream.fallbacks ?? [])].filter(Boolean);
  const headers: Record<string, string> = {};
  if (stream.referer) headers.Referer = stream.referer;
  if (stream.origin) headers.Origin = stream.origin;

  return urls.map((uri) => ({
    uri,
    ...(Object.keys(headers).length > 0 ? { headers } : {}),
  }));
}
