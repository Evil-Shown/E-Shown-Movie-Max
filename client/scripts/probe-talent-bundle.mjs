const r = await fetch("https://talenttv.lk/main-BNXCFMXE.js");
const t = await r.text();
const m3u8 = [...t.matchAll(/https?:[^"']+m3u8[^"']*/g)].map((x) => x[0]);
const hosts = [...t.matchAll(/https?:\/\/[a-z0-9.-]+/gi)].map((x) => x[0]);
console.log("m3u8", [...new Set(m3u8)]);
console.log("hosts sample", [...new Set(hosts)].filter((h) => /live|stream|hls|talent/i.test(h)));
