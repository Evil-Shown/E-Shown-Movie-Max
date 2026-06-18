/** Stable browser fingerprint — rotating UA/referrer triggers bot blocks. */
const STABLE_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

const EMBED_HOST_PATTERNS = [
  "*://vidfast.pro/*",
  "*://*.vidfast.pro/*",
  "*://vidlink.pro/*",
  "*://*.vidlink.pro/*",
  "*://multiembed.mov/*",
  "*://*.multiembed.mov/*",
  "*://autoembed.co/*",
  "*://*.autoembed.co/*",
  "*://vidsrc.pm/*",
  "*://*.vidsrc.pm/*",
  "*://vidsrc.cc/*",
  "*://*.vidsrc.cc/*",
  "*://vidsrc.in/*",
  "*://*.vidsrc.in/*",
  "*://vidsrc.to/*",
  "*://*.vidsrc.to/*",
  "*://2embed.skin/*",
  "*://*.2embed.skin/*",
];

function getStableUserAgent() {
  return STABLE_USER_AGENT;
}

/** Use the embed site's own origin as referer — looks like a normal in-player navigation. */
function getRefererForUrl(url) {
  try {
    return `${new URL(url).origin}/`;
  } catch {
    return "https://www.google.com/";
  }
}

module.exports = {
  EMBED_HOST_PATTERNS,
  getStableUserAgent,
  getRefererForUrl,
};
