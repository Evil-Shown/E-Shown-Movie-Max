import { enforceRateLimit } from "@/lib/cache/rate-limit";
import { fetchStreamResource } from "@/lib/live-tv/stream-fetch";
import { isEphemeralManifest, rewriteHlsManifest } from "@/lib/live-tv/manifest-proxy";
import {
  buildSidProxyUrl,
  lookupProxyTarget,
  registerProxyTarget,
} from "@/lib/live-tv/proxy-store";

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

async function resolveProxyRequest(searchParams: URLSearchParams): Promise<{
  rawUrl: string | null;
  referer?: string;
  origin?: string;
}> {
  const sid = searchParams.get("sid");
  if (sid) {
    const entry = await lookupProxyTarget(sid);
    if (!entry) return { rawUrl: null };
    return {
      rawUrl: entry.url,
      referer: entry.referer,
      origin: entry.origin,
    };
  }

  return {
    rawUrl: searchParams.get("url"),
    referer: searchParams.get("referer") ?? undefined,
    origin: searchParams.get("origin") ?? undefined,
  };
}

async function proxyUpstream(
  request: Request,
  rawUrl: string,
  referer?: string,
  origin?: string
): Promise<Response> {
  const target = isAllowedUrl(rawUrl);
  if (!target) {
    return new Response("Invalid or blocked URL", { status: 400 });
  }

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
  const output = await rewriteHlsManifest(body, target, proxyBase, referer, origin);
  const ephemeral = isEphemeralManifest(rawUrl, body);

  return new Response(output, {
    headers: {
      "Content-Type": "application/vnd.apple.mpegurl",
      "Cache-Control": ephemeral
        ? "no-store, no-cache, must-revalidate"
        : "public, max-age=8, stale-while-revalidate=30",
      "Access-Control-Allow-Origin": "*",
    },
  });
}

/** Register a long upstream URL and return a short ?sid= playback path */
export async function POST(request: Request) {
  const limited = await enforceRateLimit(request, "live-tv:stream:register", 30, 60);
  if (limited) return limited;

  try {
    const body = (await request.json()) as {
      url?: string;
      referer?: string;
      origin?: string;
    };

    if (!body.url) {
      return Response.json({ error: "Missing url" }, { status: 400 });
    }

    const target = isAllowedUrl(body.url);
    if (!target) {
      return Response.json({ error: "Invalid or blocked URL" }, { status: 400 });
    }

    const sid = await registerProxyTarget(body.url, body.referer, body.origin);
    const proxyBase = new URL("/api/live-tv/stream", request.url).toString();

    return Response.json({
      sid,
      playbackUrl: buildSidProxyUrl(proxyBase, sid),
    });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const limited = await enforceRateLimit(request, "live-tv:stream:proxy", 180, 60);
  if (limited) return limited;

  const { searchParams } = new URL(request.url);
  const { rawUrl, referer, origin } = await resolveProxyRequest(searchParams);

  if (!rawUrl) {
    const sid = searchParams.get("sid");
    if (sid) {
      return new Response("Proxy session expired — reload channel", { status: 410 });
    }
    return new Response("Missing url or sid parameter", { status: 400 });
  }

  try {
    return await proxyUpstream(request, rawUrl, referer, origin);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Proxy fetch failed";
    return new Response(message, { status: 502 });
  }
}
