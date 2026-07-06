const r = await fetch("https://talenttv.lk/", {
  headers: { "User-Agent": "Mozilla/5.0" },
});
const html = await r.text();
const scripts = [...html.matchAll(/src=["']([^"']+)["']/gi)].map((m) => m[1]);
console.log("scripts", scripts);
const links = [...html.matchAll(/href=["']([^"']+)["']/gi)]
  .map((m) => m[1])
  .filter((h) => /live|watch|stream|player|youtube/i.test(h));
console.log("links", [...new Set(links)]);
console.log("has m3u8", html.includes("m3u8"));
console.log("has youtube", html.match(/youtube\.com\/[^"'\s]+/g)?.slice(0, 5));

// Try common SPA API paths
const apis = [
  "https://talenttv.lk/api/live",
  "https://talenttv.lk/api/stream",
  "https://api.talenttv.lk/live",
];
for (const u of apis) {
  try {
    const ar = await fetch(u, { signal: AbortSignal.timeout(8000) });
    console.log("api", u, ar.status, (await ar.text()).slice(0, 120));
  } catch (e) {
    console.log("api", u, e.message);
  }
}

// Test via proxy
const dead =
  "http://live.talenttv.lk:8080/hls/x8kd5n3tm8e8lsv/index.m3u8";
const pr = await fetch(
  "http://localhost:3000/api/live-tv/stream?url=" +
    encodeURIComponent(dead) +
    "&referer=" +
    encodeURIComponent("https://talenttv.lk/")
);
console.log("proxy dead stream", pr.status, (await pr.text()).slice(0, 80));
