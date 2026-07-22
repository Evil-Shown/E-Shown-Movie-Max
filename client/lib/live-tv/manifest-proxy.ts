import {
  buildSidProxyUrl,
  registerProxyTarget,
} from "@/lib/live-tv/proxy-store";

function resolveManifestUrl(raw: string, baseUrl: URL): string {
  if (!raw) throw new Error("Empty URI");
  const trimmed = raw.trim();
  if (!trimmed) throw new Error("Empty URI");

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return new URL(trimmed, baseUrl).toString();

  return new URL(trimmed, baseUrl).toString();
}

function stripBom(content: string): string {
  return content.codePointAt(0) === 0xfeff ? content.slice(1) : content;
}

function collectManifestUrls(
  content: string,
  baseUrl: URL
): string[] {
  const urls = new Set<string>();
  const normalized = stripBom(content);

  for (const line of normalized.split("\n")) {
    if (!line.trim()) continue;

    for (const match of line.matchAll(/URI\s*=\s*"([^"]+)"/gi)) {
      try {
        urls.add(resolveManifestUrl(match[1], baseUrl));
      } catch {
        // skip invalid URIs
      }
    }

    const trimmed = line.trim();
    if (trimmed.startsWith("#")) continue;

    try {
      urls.add(resolveManifestUrl(trimmed, baseUrl));
    } catch {
      // skip invalid lines
    }
  }

  return [...urls];
}

/** Rewrite every m3u8 URL in a manifest (including URIs inside #EXT tags) */
export async function rewriteHlsManifest(
  content: string,
  baseUrl: URL,
  proxyBase: string,
  referer?: string,
  origin?: string,
  region?: string
): Promise<string> {
  const uniqueUrls = collectManifestUrls(content, baseUrl);
  const sidByUrl = new Map<string, string>();

  await Promise.all(
    uniqueUrls.map(async (resolved) => {
      const sid = await registerProxyTarget(resolved, referer, origin, region);
      sidByUrl.set(resolved, sid);
    })
  );

  const toProxy = (raw: string): string => {
    const resolved = resolveManifestUrl(raw, baseUrl);
    const sid = sidByUrl.get(resolved);
    if (!sid) return raw;
    return buildSidProxyUrl(proxyBase, sid, region);
  };

  return content
    .split("\n")
    .map((line) => {
      if (!line.trim()) return line;

      const withTagUris = line.replace(/URI="([^"]+)"/gi, (_, uri: string) => {
        try {
          return `URI="${toProxy(uri)}"`;
        } catch {
          return `URI="${uri}"`;
        }
      });

      const trimmed = withTagUris.trim();
      if (trimmed.startsWith("#")) return withTagUris;

      try {
        return toProxy(trimmed);
      } catch {
        return line;
      }
    })
    .join("\n");
}

/** Tokenized Pluto/Samsung manifests expire quickly — never cache them */
export function isEphemeralManifest(url: string, body: string): boolean {
  if (url.includes("jmp2.uk")) return true;
  if (body.includes("authToken=")) return true;
  if (body.includes("terminate=false&sid=")) return true;
  return false;
}

const AD_DOMAINS = [
  "/ads/",
  "/ad/",
  "/advert/",
  "doubleclick.",
  "adsafeprotected.",
  "adservice.",
  "adtech.",
  "pubads.",
  "googlesyndication.",
  "moatads.",
  "amazon-adsystem.",
];

function isAdSegmentUrl(line: string): boolean {
  if (!line || line.startsWith("#")) return false;
  const lower = line.trim().toLowerCase();
  if (!lower.startsWith("http") && !lower.startsWith("/") && !lower.startsWith(".")) return false;
  return AD_DOMAINS.some((domain) => lower.includes(domain));
}

function isAdMarkerTag(line: string): boolean {
  const trimmed = line.trim();
  return (
    trimmed === "#EXT-X-DISCONTINUITY" ||
    trimmed.startsWith("#EXT-X-DISCONTINUITY") ||
    trimmed.startsWith("#EXT-X-CUE-OUT") ||
    trimmed.startsWith("#EXT-X-CUE-IN") ||
    trimmed.startsWith("#EXT-X-SCTE35") ||
    /#EXT-X-DATERANGE:.*CLASS="com\.apple\.hls\.interstitial"/i.test(trimmed)
  );
}

/** Strip SSAI ad segments and their metadata from an HLS manifest.
 *  Detects ads by known CDN domains, CUE-OUT/CUE-IN markers,
 *  DISCONTINUITY-wrapped blocks, and interstitial daterange tags. */
export function stripAdSegments(content: string): string {
  const lines = content.split("\n");
  const result: string[] = [];
  let inAdBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (isAdMarkerTag(line)) {
      inAdBlock = !inAdBlock;
      if (!inAdBlock) continue;
    }

    if (inAdBlock) {
      // Skip segment URLs and their EXTINF preamble inside ad blocks
      if (isAdSegmentUrl(trimmed)) continue;
      // Skip the #EXTINF line that precedes an ad segment
      if (
        trimmed.startsWith("#EXTINF") &&
        i + 1 < lines.length &&
        isAdSegmentUrl(lines[i + 1].trim())
      ) {
        i++;
        continue;
      }
      // Also skip if the previous line was EXTINF for an ad
      if (
        isAdSegmentUrl(trimmed) &&
        i > 0 &&
        result.length > 0 &&
        result[result.length - 1].trim().startsWith("#EXTINF")
      ) {
        result.pop();
        continue;
      }
      continue;
    }

    // Standalone ad segment detection (outside DISCONTINUITY blocks)
    if (isAdSegmentUrl(trimmed)) {
      if (i > 0 && result.length > 0 && result[result.length - 1].trim().startsWith("#EXTINF")) {
        result.pop();
      }
      continue;
    }

    result.push(line);
  }

  if (result.length === 0 || result[0]?.trim() !== "#EXTM3U") return content;
  return result.join("\n");
}
