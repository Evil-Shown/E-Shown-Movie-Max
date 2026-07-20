/**
 * Route stream iframes through an HTML-rewriting proxy:
 * - strips known ad scripts
 * - injects nuclear anti-popup guards (window.open / fake <a>.click / capture)
 *
 * Priority:
 * 1) NEXT_PUBLIC_EMBED_PROXY_WORKER_URL (Cloudflare Worker) — preferred
 * 2) Same-origin /api/v1/embed/proxy (Next → Express) — local fallback
 *
 * No sandbox / no shell on the React iframe — only the proxied HTML is hardened.
 */

import { resolveApiBaseAbsolute } from "./api-base";

function getCloudflareWorkerBase(): string | null {
  const raw = (process.env.NEXT_PUBLIC_EMBED_PROXY_WORKER_URL || "").trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

function getApiProxyBase(): string | null {
  const raw =
    process.env.NEXT_PUBLIC_EMBED_PROXY_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_GODS_EYE_API_URL ??
    process.env.NEXT_PUBLIC_TBOOM_API_URL;

  if (raw && !/localhost|127\.0\.0\.1/i.test(raw)) {
    return raw.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return resolveApiBaseAbsolute();
    }
  }

  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function isEmbedProxyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_EMBED_PROXY === "true";
}

/** Route embed iframe loads through CF Worker (preferred) or Express fallback. */
export function proxifyEmbedUrl(directUrl: string): string {
  if (!directUrl || !isEmbedProxyEnabled()) return directUrl;

  const workerBase = getCloudflareWorkerBase();
  if (workerBase) {
    return `${workerBase}/?url=${encodeURIComponent(directUrl)}`;
  }

  // No Worker URL yet — use Express only off localhost (SPA embeds often break
  // when the document origin becomes localhost via the local API proxy).
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return directUrl;
    }
    return `/api/v1/embed/proxy?url=${encodeURIComponent(directUrl)}`;
  }

  const apiBase = getApiProxyBase();
  if (!apiBase || /localhost|127\.0\.0\.1/i.test(apiBase)) return directUrl;
  return `${apiBase}/api/v1/embed/proxy?url=${encodeURIComponent(directUrl)}`;
}
