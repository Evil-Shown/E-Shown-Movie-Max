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
];

const BLOCKED_PATH_PATTERNS = [/clickunder/i, /popunder/i, /[?&]tag=d_/i];

/** Hosts used by the in-app video player — never block their network requests. */
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
];

function isEmbedProviderHost(hostname) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  return EMBED_PROVIDER_HOSTS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

function isEmbedProviderUrl(raw) {
  if (!raw || typeof raw !== "string") return false;
  try {
    return isEmbedProviderHost(new URL(raw).hostname);
  } catch {
    return false;
  }
}

function isBlockedAdUrl(raw) {
  if (!raw || typeof raw !== "string") return false;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    const href = url.href.toLowerCase();

    if (isEmbedProviderHost(host)) {
      return false;
    }

    if (BLOCKED_HOST_PATTERNS.some((pattern) => pattern.test(host))) {
      return true;
    }

    if (BLOCKED_PATH_PATTERNS.some((pattern) => pattern.test(href))) {
      return true;
    }

    return false;
  } catch {
    const lower = raw.toLowerCase();
    if (EMBED_PROVIDER_HOSTS.some((allowed) => lower.includes(allowed))) {
      return false;
    }
    return lower.includes("1xbet") || lower.includes("clickunder") || lower.includes("xbet.lk");
  }
}

/**
 * Only cancel top-level gambling navigations.
 * Embed players often load ad scripts first — blocking scripts/xhr/media breaks playback.
 */
function shouldCancelNetworkRequest(details) {
  if (!isBlockedAdUrl(details.url)) {
    return false;
  }

  if (isEmbedProviderUrl(details.url)) {
    return false;
  }

  const type = details.resourceType || "";
  const neverBlock = new Set([
    "script",
    "xhr",
    "media",
    "subFrame",
    "stylesheet",
    "font",
    "image",
    "websocket",
    "object",
    "ping",
    "other",
  ]);
  if (neverBlock.has(type)) {
    return false;
  }

  return type === "mainFrame";
}

module.exports = {
  isBlockedAdUrl,
  isEmbedProviderUrl,
  shouldCancelNetworkRequest,
};
