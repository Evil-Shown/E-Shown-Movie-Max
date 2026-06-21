const r = await fetch("https://www.dialog.lk/viu-app/livetv", {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: "https://www.dialog.lk/",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1",
  },
  signal: AbortSignal.timeout(20000),
});
const t = await r.text();
console.log("status", r.status, "len", t.length);
console.log("title", t.match(/<title>([^<]+)/)?.[1]);
const patterns = [
  /m3u8/gi,
  /peotv/gi,
  /dialogtv/gi,
  /bpk-tv/gi,
  /stream/gi,
  /hls/gi,
  /manifest/gi,
];
for (const p of patterns) {
  const m = t.match(p);
  if (m) console.log(p, "count", m.length);
}
const urls = [
  ...t.matchAll(/https?:\/\/[^\s"'<>\\]+/gi),
].map((m) => m[0]);
const interesting = urls.filter(
  (u) =>
    /peotv|dialog|m3u8|stream|hls|bpk|akamai|cloudfront/i.test(u)
);
console.log("interesting urls", [...new Set(interesting)].slice(0, 20));
