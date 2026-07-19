/**
 * Electron ad-blocking — keep in sync with packages/core/src/ad-block.ts
 * (CommonJS main process cannot import the TS package directly).
 */

const BLOCKED_HOST_PATTERNS = [
  /(^|\.)1xbet\./i,
  /(^|\.)xbet\./i,
  /(^|\.)melbet\./i,
  /(^|\.)betway\./i,
  /(^|\.)stake\.com$/i,
  /(^|\.)parimatch\./i,
  /(^|\.)bet365\./i,
  /(^|\.)pin-up\./i,
  /(^|\.)mostbet\./i,
  /(^|\.)linebet\./i,
  /(^|\.)22bet\./i,
  /(^|\.)betwinner\./i,
  /(^|\.)1win\./i,
  /(^|\.)clickunder/i,
  /(^|\.)popads\./i,
  /(^|\.)propellerads\./i,
  /(^|\.)exoclick\./i,
  /(^|\.)adsterra\./i,
  /(^|\.)adskeeper\./i,
  /(^|\.)onclickads\./i,
  /(^|\.)popcash\./i,
  /(^|\.)juicyads\./i,
  /(^|\.)trafficjunky\./i,
  /(^|\.)doubleclick\./i,
  /(^|\.)googlesyndication\./i,
];

const BLOCKED_PATH_PATTERNS = [/clickunder/i, /popunder/i, /[?&]tag=d_/i, /\/ads?\//i];

const EMBED_PROVIDER_HOSTS = [
  "vidfast.pro",
  "vidlink.pro",
  "multiembed.mov",
  "autoembed.co",
  "vidsrc.pm",
  "vidsrc.cc",
  "vidsrc.in",
  "vidsrc.to",
  "vidsrc.me",
  "vidsrc.xyz",
  "vidsrc.net",
  "2embed.skin",
  "2embed.cc",
  "embed.su",
  "vsembed.ru",
  "rapid-cloud.co",
  "rabbitstream.net",
  "megacloud.tv",
  "vidcloud.icu",
  "streamtape.com",
  "mixdrop.co",
  "doodstream.com",
  "filemoon.sx",
  "uqloads.xyz",
  "youtube.com",
  "youtube-nocookie.com",
  "youtu.be",
  "googlevideo.com",
];

/** Analytics/trackers embed players call before video — must not be blocked. */
const EMBED_SUPPORT_HOSTS = [
  "dtscout.com",
  "dtscdn.com",
  "google-analytics.com",
  "googletagmanager.com",
  "cloudflare.com",
  "cloudflareinsights.com",
];

function isEmbedSupportHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  return EMBED_SUPPORT_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function isEmbedProviderHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  if (isEmbedSupportHost(host)) return true;
  return EMBED_PROVIDER_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function isEmbedProviderUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  try {
    return isEmbedProviderHost(new URL(raw).hostname);
  } catch {
    return EMBED_PROVIDER_HOSTS.some((allowed) => raw.toLowerCase().includes(allowed));
  }
}

function isAuthAllowUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  try {
    const url = new URL(raw);
    if (url.hostname === "accounts.google.com") return true;
    if (url.hostname.endsWith(".supabase.co") && url.pathname.startsWith("/auth/v1/authorize")) {
      return true;
    }
    return false;
  } catch {
    return raw.includes("accounts.google.com");
  }
}

function isBlockedAdUrl(raw) {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const href = url.href.toLowerCase();

    if (isEmbedProviderHost(host)) return false;
    if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) return true;
    if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(href))) return true;
    return false;
  } catch {
    const lower = raw.toLowerCase();
    if (EMBED_PROVIDER_HOSTS.some((allowed) => lower.includes(allowed))) return false;
    return lower.includes("1xbet") || lower.includes("clickunder") || lower.includes("xbet.lk");
  }
}

/**
 * Cancel known ad-network requests of any type.
 * Never cancel embed provider / support hosts (breaks playback).
 */
function shouldCancelNetworkRequest(details) {
  if (!details?.url) return false;
  if (isEmbedProviderUrl(details.url)) return false;
  return isBlockedAdUrl(details.url);
}

module.exports = {
  isBlockedAdUrl,
  isEmbedProviderUrl,
  isAuthAllowUrl,
  shouldCancelNetworkRequest,
};
