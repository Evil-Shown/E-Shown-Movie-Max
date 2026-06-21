import { fetchStreamResource } from "@/lib/live-tv/stream-fetch";

const ALLOWED_PROTOCOLS = ["http:", "https:"];
const BLOCKED_HOSTS = ["localhost", "127.0.0.1", "0.0.0.0", "[::1]"];

function isAllowedUrl(raw: string): URL | null {
  try {
    const parsed = new URL(raw);
    if (!ALLOWED_PROTOCOLS.includes(parsed.protocol)) return null;
    if (BLOCKED_HOSTS.some((h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`))) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function isBinaryStreamUrl(url: string, contentType: string | null): boolean {
  const lower = url.toLowerCase();
  if (lower.includes(".ts") || lower.includes(".mp4") || lower.includes(".aac")) return true;
  if (!contentType) return false;
  const ct = contentType.toLowerCase();
  return (
    ct.includes("video/") ||
    ct.includes("audio/") ||
    ct.includes("octet-stream") ||
    ct.includes("mp2t")
  );
}

function isOfflineHlsManifest(body: string): boolean {
  const trimmed = body.trim();
  if (!trimmed.startsWith("#EXTM3U")) return false;
  if (trimmed.includes("#EXT-X-ERROR")) return true;
  return trimmed.includes("#EXT-X-ENDLIST") && !trimmed.includes("#EXTINF");
}

function isManifestContent(url: string, contentType: string | null, peek: string): boolean {
  if (url.includes(".m3u8")) return true;
  if (contentType?.includes("mpegurl")) return true;
  return peek.trimStart().startsWith("#EXTM3U");
}

function rewriteManifest(
  content: string,
  baseUrl: URL,
  proxyBase: string,
  referer?: string,
  origin?: string
): string {
  return content
    .split("\n")
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) return line;
      try {
        const resolved = trimmed.startsWith("http")
          ? trimmed
          : new URL(trimmed, baseUrl).toString();
        const params = new URLSearchParams({ url: resolved });
        if (referer) params.set("referer", referer);
        if (origin) params.set("origin", origin);
        return `${proxyBase}?${params.toString()}`;
      } catch {
        return line;
      }
    })
    .join("\n");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get("url");
  const referer = searchParams.get("referer") ?? undefined;
  const origin = searchParams.get("origin") ?? undefined;

  if (!rawUrl) {
    return new Response("Missing url parameter", { status: 400 });
  }

  const target = isAllowedUrl(rawUrl);
  if (!target) {
    return new Response("Invalid or blocked URL", { status: 400 });
  }

  try {
    const upstream = await fetchStreamResource(target.toString(), {
      referer,
      origin,
      retries: 3,
      mode: "manifest",
    });

    if (!upstream.ok) {
      return new Response(`Upstream error: ${upstream.status}`, { status: upstream.status });
    }

    const contentType = upstream.headers.get("content-type");

    // Binary segments must not be read as UTF-8 text
    if (isBinaryStreamUrl(rawUrl, contentType)) {
      const buffer = await upstream.arrayBuffer();
      return new Response(buffer, {
        headers: {
          "Content-Type": contentType ?? "video/mp2t",
          "Cache-Control": "public, max-age=30",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const body = await upstream.text();

    if (isManifestContent(rawUrl, contentType, body) && isOfflineHlsManifest(body)) {
      return new Response("Stream offline or not broadcasting", { status: 503 });
    }

    if (!isManifestContent(rawUrl, contentType, body)) {
      return new Response(body, {
        headers: {
          "Content-Type": contentType ?? "application/octet-stream",
          "Cache-Control": "public, max-age=30",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    const proxyBase = new URL("/api/live-tv/stream", request.url).toString();
    const output = rewriteManifest(body, target, proxyBase, referer, origin);

    return new Response(output, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "public, max-age=15, stale-while-revalidate=60",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy fetch failed";
    return new Response(message, { status: 502 });
  }
}
