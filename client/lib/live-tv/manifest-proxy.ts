import {
  buildSidProxyUrl,
  registerProxyTarget,
} from "@/lib/live-tv/proxy-store";

/** Rewrite every m3u8 URL in a manifest (including URIs inside #EXT tags) */
export function rewriteHlsManifest(
  content: string,
  baseUrl: URL,
  proxyBase: string,
  referer?: string,
  origin?: string
): string {
  const toProxy = (raw: string): string => {
    const resolved = raw.startsWith("http") ? raw : new URL(raw, baseUrl).toString();
    const sid = registerProxyTarget(resolved, referer, origin);
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
