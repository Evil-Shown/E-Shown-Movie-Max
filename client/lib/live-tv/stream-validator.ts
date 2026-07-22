import { fetchStreamResource } from "@/lib/live-tv/stream-fetch";
import { sortByStability } from "@/lib/live-tv/stream-stability";

const MAX_PROBE = 8;
const UNSTABLE_HOSTS = ["jmp2.uk", "allinonereborn", "149.71.34.166"];

export function isPlayableManifest(body: string, contentType: string | null): boolean {
  const trimmed = body.trim();
  if (trimmed.startsWith("#EXTM3U")) {
    if (trimmed.includes("#EXT-X-ERROR")) return false;
    if (trimmed.includes("#EXT-X-ENDLIST") && !trimmed.includes("#EXTINF")) return false;
    return true;
  }
  return contentType?.includes("mpegurl") ?? false;
}

export async function validateStreamUrl(
  url: string,
  referer?: string,
  origin?: string
): Promise<boolean> {
  if (!url.includes(".m3u8")) return false;

  try {
    const response = await fetchStreamResource(url, {
      referer,
      origin,
      retries: 1,
      mode: "manifest",
    });

    if (!response.ok) return false;

    const contentType = response.headers.get("content-type");
    const peek = await response.text();
    return isPlayableManifest(peek, contentType);
  } catch {
    return false;
  }
}

function isUnstableAggregator(url: string): boolean {
  return UNSTABLE_HOSTS.some((host) => url.includes(host));
}

/** Probe stable sources first; only fall back to jmp2 when nothing else works */
export async function pickWorkingStreamUrls(
  urls: string[],
  referer?: string,
  origin?: string
): Promise<string[]> {
  const unique = sortByStability([...new Set(urls.filter((u) => u?.includes(".m3u8")))]);
  if (unique.length === 0) return [];

  const stablePool = unique.filter((u) => !isUnstableAggregator(u));
  const unstablePool = unique.filter((u) => isUnstableAggregator(u));
  const probeOrder = [...stablePool, ...unstablePool].slice(0, MAX_PROBE);

  const working: string[] = [];

  await Promise.all(
    probeOrder.map(async (url) => {
      if (await validateStreamUrl(url, referer, origin)) {
        working.push(url);
      }
    })
  );

  const rankedWorking = sortByStability(working);
  if (rankedWorking.length > 0) {
    const rest = unique.filter((u) => !rankedWorking.includes(u));
    return [...rankedWorking, ...rest];
  }

  return unique;
}
