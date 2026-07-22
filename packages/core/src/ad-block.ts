/**
 * Shared ad-blocking helpers for web, desktop Electron, and mobile WebView.
 * Platform shells apply these rules at native level; the web player uses them
 * for hybrid iframe sandbox + parent window.open guards.
 */

/** Providers that detect iframe sandbox and refuse to play. */
export const NO_SANDBOX_HOST_FRAGMENTS = [
  "vidfast.pro",
  "vidfast.cc",
  "vidfast.co",
  "vidfast.",
] as const;

/**
 * Sandbox without allow-popups — blocks iframe window.open in browsers.
 * Omitted entirely for VidFast (see shouldBypassEmbedSandbox).
 */
export const EMBED_IFRAME_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation allow-forms allowfullscreen";

export const BLOCKED_AD_HOST_PATTERNS: RegExp[] = [
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

export const BLOCKED_AD_PATH_PATTERNS: RegExp[] = [
  /clickunder/i,
  /popunder/i,
  /[?&]tag=d_/i,
  /\/ads?\//i,
];

/** Host substrings used by Electron/mobile for fast URL.includes checks. */
export const AD_DOMAIN_FRAGMENTS = [
  "1xbet",
  "xbet",
  "melbet",
  "betway",
  "stake.com",
  "parimatch",
  "bet365",
  "pin-up",
  "mostbet",
  "linebet",
  "22bet",
  "betwinner",
  "1win",
  "clickunder",
  "popads",
  "propellerads",
  "exoclick",
  "adsterra",
  "adskeeper",
  "onclickads",
  "popcash",
  "juicyads",
  "trafficjunky",
  "doubleclick",
  "googlesyndication",
] as const;

/** Stream / trailer hosts — never treated as ads. */
export const EMBED_PROVIDER_HOSTS = [
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
] as const;

/** Trackers some embeds require before video starts — do not block. */
export const EMBED_SUPPORT_HOSTS = [
  "dtscout.com",
  "dtscdn.com",
  "google-analytics.com",
  "googletagmanager.com",
  "cloudflare.com",
  "cloudflareinsights.com",
] as const;

export const ALLOWED_POPUP_HOST_PATTERNS: RegExp[] = [
  /(^|\.)vidfast\./i,
  /(^|\.)vidlink\.pro$/i,
  /(^|\.)multiembed\.mov$/i,
  /(^|\.)autoembed\.co$/i,
  /(^|\.)vidsrc\.(pm|cc|to|me|xyz|net)$/i,
  /(^|\.)youtube\.com$/i,
  /(^|\.)youtube-nocookie\.com$/i,
  /(^|\.)youtu\.be$/i,
  /(^|\.)googlevideo\.com$/i,
];

function hostMatchesAllowlist(hostname: string, allowed: readonly string[]): boolean {
  const host = hostname.toLowerCase();
  if (!host) return false;
  return allowed.some((entry) => host === entry || host.endsWith(`.${entry}`));
}

export function shouldBypassEmbedSandbox(embedUrl: string): boolean {
  if (!embedUrl) return false;
  const lower = embedUrl.toLowerCase();
  return NO_SANDBOX_HOST_FRAGMENTS.some((fragment) => lower.includes(fragment));
}

export function getEmbedIframeSandbox(embedUrl: string): string | undefined {
  // No sandbox for any known embed provider — sandbox causes
  // "Playback blocked" errors on providers that detect it.
  // Ad popups are blocked separately via installAdPopupBlocker.
  return undefined;
}

export function isEmbedSupportHost(hostname: string): boolean {
  return hostMatchesAllowlist(hostname, EMBED_SUPPORT_HOSTS);
}

export function isEmbedProviderHost(hostname: string): boolean {
  if (isEmbedSupportHost(hostname)) return true;
  return hostMatchesAllowlist(hostname, EMBED_PROVIDER_HOSTS);
}

export function isEmbedProviderUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;
  try {
    return isEmbedProviderHost(new URL(raw).hostname);
  } catch {
    return EMBED_PROVIDER_HOSTS.some((allowed) => raw.toLowerCase().includes(allowed));
  }
}

export function isBlockedAdUrl(raw: string): boolean {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const href = url.href.toLowerCase();

    if (isEmbedProviderHost(host)) return false;
    if (BLOCKED_AD_HOST_PATTERNS.some((pattern) => pattern.test(host))) return true;
    if (BLOCKED_AD_PATH_PATTERNS.some((pattern) => pattern.test(href))) return true;
    return false;
  } catch {
    const lower = raw.toLowerCase();
    if (EMBED_PROVIDER_HOSTS.some((allowed) => lower.includes(allowed))) return false;
    return (
      lower.includes("1xbet") ||
      lower.includes("clickunder") ||
      lower.includes("xbet.lk") ||
      lower.includes("popads") ||
      lower.includes("propellerads") ||
      lower.includes("adsterra") ||
      lower.includes("exoclick") ||
      lower.includes("popcash")
    );
  }
}

export function isAllowedStreamPopupUrl(raw: string, sameOriginHost?: string): boolean {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (sameOriginHost && host === sameOriginHost.toLowerCase()) return true;
    if (isEmbedProviderHost(host)) return true;
    return ALLOWED_POPUP_HOST_PATTERNS.some((pattern) => pattern.test(host));
  } catch {
    return false;
  }
}

export function isAuthAllowUrl(raw: string): boolean {
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

/**
 * Mobile WebView navigation gate.
 * - Always block known ad URLs
 * - Allow embed/stream/auth/blob/data
 * - Top-frame: deny unknown navigations away from the player
 * - Subframes: allow (CDN / nested player frames)
 */
export function shouldAllowEmbedNavigation(
  requestUrl: string,
  options: {
    embedUrl?: string | null;
    isTopFrame?: boolean;
  } = {}
): boolean {
  const { embedUrl, isTopFrame = true } = options;
  if (!requestUrl) return true;

  const lower = requestUrl.toLowerCase();
  if (lower === "about:blank" || lower.startsWith("about:blank")) return true;
  if (lower.startsWith("blob:") || lower.startsWith("data:")) return true;

  if (isAuthAllowUrl(requestUrl)) return true;
  if (isBlockedAdUrl(requestUrl)) return false;
  if (isEmbedProviderUrl(requestUrl)) return true;
  if (isAllowedStreamPopupUrl(requestUrl)) return true;

  if (embedUrl) {
    try {
      const requestHost = new URL(requestUrl).hostname.toLowerCase();
      const embedHost = new URL(embedUrl).hostname.toLowerCase();
      if (requestHost === embedHost) return true;
    } catch {
      // fall through
    }
  }

  if (!isTopFrame) return true;
  return false;
}

/**
 * Electron webRequest cancel policy.
 * Cancels known ad-network requests of any type, but never touches
 * embed provider / support hosts (those break playback if blocked).
 */
export function shouldCancelAdNetworkRequest(url: string): boolean {
  if (!url || isEmbedProviderUrl(url)) return false;
  return isBlockedAdUrl(url);
}
