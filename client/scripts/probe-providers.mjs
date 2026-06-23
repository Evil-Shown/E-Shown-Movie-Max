/**
 * Fetch probe for Dialog TV / PEOTV targets.
 * Usage:
 *   npm run probe:tv
 *   npm run probe:tv -- hiru-tv
 */
import {
  buildProbeHeaders,
  DEFAULT_PROBE_TARGETS,
  extractM3u8Urls,
  getChannelProbeTargets,
} from "./lib/probe-headers.mjs";

const channelId = process.argv[2];
const targets = channelId
  ? getChannelProbeTargets(channelId)
  : DEFAULT_PROBE_TARGETS;

if (channelId && targets.length === 0) {
  console.error(`Unknown or unsupported channel: ${channelId}`);
  console.error("Try: hiru-tv, sirasa-tv, tv-derana, itn, swarnavahini, rupavahini");
  process.exit(1);
}

console.log(channelId ? `Probing targets for: ${channelId}` : "Probing default provider targets");
console.log(`Header rotation: ${process.env.STREAM_HEADER_ROTATION === "1" ? "on" : "off"}\n`);

async function probe(target, index) {
  const { pageUrl, referer } = target;
  try {
    const r = await fetch(pageUrl, {
      headers: buildProbeHeaders(referer, index),
      signal: AbortSignal.timeout(20_000),
    });
    const t = await r.text();
    const m3u8 = extractM3u8Urls(t);
    const cf =
      t.includes("Just a moment") ||
      t.includes("cf-browser") ||
      t.includes("challenge-platform");
    const geo = r.status === 403 && t.includes("Access denied");

    console.log("URL:", pageUrl);
    console.log("  status:", r.status, "len:", t.length, "cf:", cf, "geo:", geo);
    console.log("  m3u8:", m3u8.slice(0, 8));
    if (m3u8.length === 0 && t.includes("m3u8")) {
      console.log("  (m3u8 referenced in page but URL not extracted)");
    }
    return m3u8;
  } catch (e) {
    console.log("URL:", pageUrl);
    console.log("  ERR:", e.message);
    return [];
  }
}

const all = [];
for (let i = 0; i < targets.length; i++) {
  all.push(...(await probe(targets[i], i)));
  console.log("---");
}

console.log("\n=== Unique manifests ===");
console.log([...new Set(all)].join("\n") || "(none)");
