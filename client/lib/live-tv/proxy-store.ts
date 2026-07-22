/** Server-side URL registry — avoids 414 from nested proxy query strings */

import { cacheGetJson, cacheGetString, cacheSetJson, cacheSetString, redisKey } from "@/lib/cache/redis";
import { createHash } from "node:crypto";

export interface ProxyTarget {
  url: string;
  referer?: string;
  origin?: string;
  region?: string;
}

type StoredProxyTarget = ProxyTarget;

const TTL_SECONDS = 45 * 60;

function lookupHash(url: string, referer?: string, origin?: string): string {
  return createHash("sha256")
    .update(`${url}\0${referer ?? ""}\0${origin ?? ""}`)
    .digest("hex");
}

function createSid(): string {
  return `p${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}

export async function registerProxyTarget(
  url: string,
  referer?: string,
  origin?: string,
  region?: string
): Promise<string> {
  const hash = lookupHash(url, referer, origin);
  const lookupKey = redisKey("proxy", "lookup", hash);
  const existing = await cacheGetString(lookupKey);
  if (existing) return existing;

  const sid = createSid();
  const targetKey = redisKey("proxy", "sid", sid);
  const entry: StoredProxyTarget = { url, referer, origin, region };

  await Promise.all([
    cacheSetJson(targetKey, entry, TTL_SECONDS),
    cacheSetString(lookupKey, sid, TTL_SECONDS),
  ]);

  return sid;
}

export async function lookupProxyTarget(sid: string): Promise<ProxyTarget | null> {
  return cacheGetJson<StoredProxyTarget>(redisKey("proxy", "sid", sid));
}

export function buildSidProxyUrl(proxyBase: string, sid: string, region?: string): string {
  const base = `${proxyBase}?sid=${encodeURIComponent(sid)}`;
  if (region) return `${base}&region=${encodeURIComponent(region)}`;
  return base;
}

export const LONG_PROXY_URL_THRESHOLD = 1200;

export function needsSidProxy(url: string): boolean {
  return url.length >= LONG_PROXY_URL_THRESHOLD || url.includes("authToken=");
}
