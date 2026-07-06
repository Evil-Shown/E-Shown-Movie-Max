/** Shared embed request headers for Electron session rotation. */
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:133.0) Gecko/20100101 Firefox/133.0",
];

const REFERRERS = [
  "https://www.google.com/",
  "https://www.bing.com/",
  "https://search.yahoo.com/",
  "https://duckduckgo.com/",
];

const EMBED_HOST_PATTERNS = [
  "*://vsembed.ru/*",
  "*://*.vsembed.ru/*",
  "*://vidlink.pro/*",
  "*://*.vidlink.pro/*",
  "*://multiembed.mov/*",
  "*://*.multiembed.mov/*",
  "*://embed.su/*",
  "*://*.embed.su/*",
  "*://vidsrc.me/*",
  "*://*.vidsrc.me/*",
  "*://vidsrc.to/*",
  "*://*.vidsrc.to/*",
];

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function getRandomUserAgent() {
  return pickRandom(USER_AGENTS);
}

function getRandomReferrer() {
  return pickRandom(REFERRERS);
}

module.exports = {
  EMBED_HOST_PATTERNS,
  getRandomUserAgent,
  getRandomReferrer,
};
