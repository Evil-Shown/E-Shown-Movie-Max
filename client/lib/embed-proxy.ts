/**
 * Route stream iframes through an HTML-rewriting proxy that:
 * - strips known ad scripts
 * - injects aggressive anti-popup / overlay guards
 *
 * Priority:
 * 1) NEXT_PUBLIC_EMBED_PROXY_WORKER_URL (Cloudflare Worker)
 * 2) Same-origin /api/v1/embed/proxy (Next rewrite → Express)
 * 3) Absolute API base (SSR / non-browser)
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

/** Route embed iframe loads through CF Worker or backend proxy. */
export function proxifyEmbedUrl(directUrl: string): string {
  if (!directUrl || !isEmbedProxyEnabled()) return directUrl;

  const workerBase = getCloudflareWorkerBase();
  if (workerBase) {
    return `${workerBase}/?url=${encodeURIComponent(directUrl)}`;
  }

  // Browser: same-origin Next rewrite — avoids iframe hitting dead :5000 directly
  // ("localhost refused to connect") when the API briefly restarts.
  if (typeof window !== "undefined") {
    return `/api/v1/embed/proxy?url=${encodeURIComponent(directUrl)}`;
  }

  const apiBase = getApiProxyBase();
  if (!apiBase) return directUrl;
  return `${apiBase}/api/v1/embed/proxy?url=${encodeURIComponent(directUrl)}`;
}
