function getEmbedProxyApiBase(): string | null {
  const base =
    process.env.NEXT_PUBLIC_EMBED_PROXY_API_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_GODS_EYE_API_URL ??
    process.env.NEXT_PUBLIC_TBOOM_API_URL;

  if (!base) return null;
  return base.replace(/\/$/, "");
}

export function isEmbedProxyEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_EMBED_PROXY === "false") return false;
  return Boolean(getEmbedProxyApiBase());
}

/** Route embed iframe loads through the backend proxy (UA/referrer rotation + caching). */
export function proxifyEmbedUrl(directUrl: string): string {
  const apiBase = getEmbedProxyApiBase();
  if (!apiBase || !isEmbedProxyEnabled()) return directUrl;
  return `${apiBase}/api/embed/proxy?url=${encodeURIComponent(directUrl)}`;
}
