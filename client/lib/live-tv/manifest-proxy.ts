import {
  buildSidProxyUrl,
  registerProxyTarget,
} from "@/lib/live-tv/proxy-store";

function resolveManifestUrl(raw: string, baseUrl: URL): string {
  return raw.startsWith("http") ? raw : new URL(raw, baseUrl).toString();
}

function collectManifestUrls(
  content: string,
  baseUrl: URL
): string[] {
  const urls = new Set<string>();

  for (const line of content.split("\n")) {
    if (!line.trim()) continue;

    const uriMatches = line.matchAll(/URI="([^"]+)"/gi);
    for (const match of uriMatches) {
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
  origin?: string
): Promise<string> {
  const uniqueUrls = collectManifestUrls(content, baseUrl);
  const sidByUrl = new Map<string, string>();

  await Promise.all(
    uniqueUrls.map(async (resolved) => {
      const sid = await registerProxyTarget(resolved, referer, origin);
      sidByUrl.set(resolved, sid);
    })
  );

  const toProxy = (raw: string): string => {
    const resolved = resolveManifestUrl(raw, baseUrl);
    const sid = sidByUrl.get(resolved);
    if (!sid) return raw;
    return buildSidProxyUrl(proxyBase, sid);
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
