/**
 * Regional proxy configuration for geo-bypass.
 * Reads proxy URLs from environment variables keyed by region code.
 *
 * Set in .env:
 *   PROXY_REGION_IN="http://user:pass@proxy.webshare.io:8080"
 *   PROXY_REGION_US="http://user:pass@us-proxy.example.com:8080"
 */
const PROXY_ENV_PREFIX = "PROXY_REGION_";

export function getRegionalProxy(region: string): string | undefined {
  const key = `${PROXY_ENV_PREFIX}${region.toUpperCase()}`;
  const raw = process.env[key];
  if (!raw) return undefined;
  return raw.trim() || undefined;
}

export function listConfiguredRegions(): string[] {
  const regions: string[] = [];
  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(PROXY_ENV_PREFIX) && value?.trim()) {
      regions.push(key.slice(PROXY_ENV_PREFIX.length).toLowerCase());
    }
  }
  return regions;
}
