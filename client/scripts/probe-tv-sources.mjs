async function probe(url, referer) {
  try {
    const r = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        Referer: referer || url,
        Accept: "text/html,*/*",
      },
      signal: AbortSignal.timeout(15000),
    });
    const t = await r.text();
    const m3u8 = [
      ...t.matchAll(/https?:\/\/[^\s"'<>\\]+?\.m3u8[^\s"'<>\\]*/gi),
    ].map((m) => m[0]);
    const mpd = [
      ...t.matchAll(/https?:\/\/[^\s"'<>\\]+?\.mpd[^\s"'<>\\]*/gi),
    ].map((m) => m[0]);
    console.log("URL:", url, "status:", r.status, "len:", t.length);
    console.log("m3u8:", [...new Set(m3u8)].slice(0, 8));
    console.log("mpd:", [...new Set(mpd)].slice(0, 4));
  } catch (e) {
    console.log("ERR", url, e.message);
  }
}

await probe("https://www.dialogtv.lk/live-tv", "https://www.dialogtv.lk/");
await probe("https://www.peotv.com/live", "https://www.peotv.com/");
await probe("https://peotv.com/live-tv", "https://peotv.com/");
