/**
 * Probe Sri Lankan channel streams — iptv-org, PEOTV, broadcaster pages.
 * Usage: node scripts/probe-lk-channels.mjs
 */
import { buildProbeHeaders, extractM3u8Urls } from "./lib/probe-headers.mjs";

const PEOTV_IDS = {
  rupavahini: "001",
  itn: "003",
  "tv-derana": "004",
  swarnavahini: "006",
  "vasantham-tv": "007",
  "siyatha-tv": "008",
  "sirasa-tv": "010",
  "shakthi-tv": "011",
  "supreme-tv": "013",
  "hiru-tv": "019",
  "star-tamil-tv": "021",
  "monara-tv": "104",
  "channel-eye": "119",
};

const BROADCASTER_PAGES = {
  "hiru-tv": ["https://www.hirutv.lk/live", "https://tv.hiruhost.com:1936/8012/8012/playlist.m3u8"],
  "tv-derana": ["https://www.derana.lk/live"],
  "sirasa-tv": ["https://www.sirasatv.lk/live"],
  itn: ["https://itn.lk/live/"],
  swarnavahini: ["https://swarnavahini.lk/live"],
  rupavahini: ["https://www.rupavahini.lk/live-tv"],
  "shakthi-tv": ["https://shakthitv.lk/live"],
  "vasantham-tv": ["https://vasantham.lk/"],
  "supreme-tv": ["https://tvsupreme.lk/live/"],
  "channel-eye": ["https://www.channeleye.lk/live"],
  "talent-tv": ["https://talenttv.lk/"],
};

async function fetchM3u(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(20000) });
  return r.text();
}

function parseM3u(text) {
  const lines = text.split("\n");
  const items = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("#EXTINF")) {
      const nameMatch = lines[i].match(/,(.+)$/);
      const tvgId = lines[i].match(/tvg-id="([^"]+)"/);
      const url = lines[i + 1]?.trim();
      if (url?.startsWith("http")) {
        items.push({ name: nameMatch?.[1]?.trim(), tvgId: tvgId?.[1], url });
      }
    }
  }
  return items;
}

async function probeUrl(url, referer) {
  try {
    const res = await fetch(url, {
      headers: buildProbeHeaders(referer),
      signal: AbortSignal.timeout(12000),
      redirect: "follow",
    });
    const ct = res.headers.get("content-type") ?? "";
    const text = await res.text();
    const isM3u8 =
      url.includes(".m3u8") ||
      ct.includes("mpegurl") ||
      text.trimStart().startsWith("#EXTM3U");
    const embedded = extractM3u8Urls(text);
    return { ok: res.ok, status: res.status, isM3u8, embedded, preview: text.slice(0, 80) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

async function scrapePage(pageUrl, referer) {
  try {
    const res = await fetch(pageUrl, {
      headers: buildProbeHeaders(referer ?? pageUrl),
      signal: AbortSignal.timeout(15000),
    });
    const html = await res.text();
    return extractM3u8Urls(html);
  } catch {
    return [];
  }
}

console.log("=== iptv-org lk.m3u ===\n");
const lk = parseM3u(await fetchM3u("https://iptv-org.github.io/iptv/countries/lk.m3u"));
for (const item of lk) {
  console.log(`${item.tvgId ?? item.name}`);
  console.log(`  ${item.url}`);
}

console.log("\n=== PEOTV bpk-tv manifests ===\n");
for (const [ch, id] of Object.entries(PEOTV_IDS)) {
  const url = `https://live.peotv.com/bpk-tv/${id}/output/index.m3u8`;
  const r = await probeUrl(url, "https://webapp.peotv.com/");
  console.log(`${ch} (${id}): ${r.ok ? "OK" : r.status ?? r.error} ${r.isM3u8 ? "m3u8" : ""}`);
  if (r.ok && r.isM3u8) console.log(`  ${url}`);
}

console.log("\n=== Broadcaster page scrape ===\n");
for (const [ch, pages] of Object.entries(BROADCASTER_PAGES)) {
  const found = new Set();
  for (const page of pages) {
    if (page.includes(".m3u8")) {
      const r = await probeUrl(page, pages[0]);
      if (r.ok && r.isM3u8) found.add(page);
    } else {
      for (const u of await scrapePage(page, page)) found.add(u);
    }
  }
  console.log(`${ch}: ${[...found].join("\n  ") || "(none)"}`);
}

console.log("\n=== Registry HLS probe ===\n");
const registry = [
  ["hiru-tv", "https://tv.hiruhost.com:1936/8012/8012/playlist.m3u8"],
  ["asia-tv", "https://stream.asiatvnet.com/1/live/master.m3u8"],
  ["siyatha-tv", "https://rtmp01.voaplus.com/hls/6x6ik312qk4grfxocfcv.m3u8"],
  ["monara-tv", "https://jk3lz8xklw79-hls-live.5centscdn.com/lpl/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8"],
  ["ndtv-lanka", "https://g4wlkqqwl23a-hls-live.5centscdn.com/NDTVLANKA/1ff5fa54d14c3ff6c6bd3918bbb7db5d.sdp/playlist.m3u8"],
  ["imai-tv", "https://live20.bozztv.com/akamaissh101/ssh101/imaitv/playlist.m3u8"],
  ["verbum-tv", "https://samson.streamerr.co:8081/verbumtv/index.m3u8"],
  ["star-tamil-tv", "https://edge4-moblive.yuppcdn.net/trans1sd/smil:strtml19.smil/playlist.m3u8"],
  ["talent-tv", "https://cast.talenttv.lk/hls/mcrlo1ygwpu8x4bj/index.m3u8"],
];
for (const [ch, url] of registry) {
  const r = await probeUrl(url);
  console.log(`${ch}: ${r.ok && r.isM3u8 ? "OK" : r.status ?? r.error}`);
}
