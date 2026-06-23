/**
 * Puppeteer probe — intercepts m3u8 network traffic and logs manifest content.
 * Usage:
 *   npm run scrape:tv
 *   npm run scrape:tv -- hiru-tv
 *
 * Env: STREAM_UPSTREAM_COOKIES, STREAM_UPSTREAM_X_FORWARDED_FOR,
 *      STREAM_HEADER_ROTATION=1, HTTP_PROXY
 */
import { createRequire } from "node:module";
import {
  buildProbeHeaders,
  DEFAULT_PROBE_TARGETS,
  extractM3u8Urls,
  getChannelProbeTargets,
  pickRandomUserAgent,
} from "./lib/probe-headers.mjs";

const require = createRequire(import.meta.url);
const M3U8_RE = /\.m3u8/i;
const channelId = process.argv[2];

const TARGETS = (channelId ? getChannelProbeTargets(channelId) : DEFAULT_PROBE_TARGETS).map(
  (t) => ({ name: t.pageUrl, pageUrl: t.pageUrl, referer: t.referer })
);

function collectFromManifest(text, found) {
  if (!text.trimStart().startsWith("#EXTM3U")) return;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.startsWith("http") && M3U8_RE.test(trimmed)) {
      found.add(trimmed);
    }
  }
  for (const url of extractM3u8Urls(text)) found.add(url);
}

async function scrapeTarget(puppeteer, target) {
  const found = new Set();
  const manifestSnippets = [];
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(pickRandomUserAgent());
    await page.setExtraHTTPHeaders(buildProbeHeaders(target.referer));

    await page.setRequestInterception(true);
    page.on("request", (req) => {
      if (M3U8_RE.test(req.url())) found.add(req.url());
      req
        .continue({
          headers: { ...req.headers(), ...buildProbeHeaders(target.referer) },
        })
        .catch(() => req.continue().catch(() => undefined));
    });

    page.on("response", async (res) => {
      const url = res.url();
      if (!M3U8_RE.test(url)) return;
      found.add(url);
      try {
        const content = await res.text();
        collectFromManifest(content, found);
        manifestSnippets.push({ url, preview: content.slice(0, 240).replace(/\n/g, " ") });
      } catch {
        // body unavailable
      }
    });

    console.log(`\n→ ${target.name}`);
    await page.goto(target.pageUrl, { waitUntil: "networkidle2", timeout: 45_000 });

    const videoSrc = await page.evaluate(() => {
      const video = document.querySelector("video");
      return video?.src || video?.currentSrc || null;
    });
    if (videoSrc) found.add(videoSrc);

    console.log("  video:", videoSrc ?? "(none)");
    console.log("  m3u8:", [...found].slice(0, 10));
    for (const { url, preview } of manifestSnippets.slice(0, 3)) {
      console.log(`  manifest ${url}`);
      console.log(`    ${preview}${preview.length >= 240 ? "…" : ""}`);
    }
  } catch (error) {
    console.log("  error:", error.message);
  } finally {
    await browser.close();
  }

  return [...found];
}

async function main() {
  if (channelId && TARGETS.length === 0) {
    console.error(`Unknown channel: ${channelId}`);
    process.exit(1);
  }

  let puppeteer;
  try {
    puppeteer = require("puppeteer");
  } catch {
    console.error("Install puppeteer first: npm install puppeteer");
    process.exit(1);
  }

  console.log(channelId ? `Browser scrape: ${channelId}` : "Browser scrape: all providers");

  const all = [];
  for (const target of TARGETS) {
    all.push(...(await scrapeTarget(puppeteer, target)));
  }

  console.log("\n=== All unique manifests ===");
  console.log([...new Set(all)].join("\n") || "(none found)");
}

main();
