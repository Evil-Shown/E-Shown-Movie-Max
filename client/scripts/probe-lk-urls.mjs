const urls = [
  ["ITN comcities", "https://j78dp2pnlq5r-hls-live.comcities.net/ITNDigital/cf467ddf13ba30dd3c71435cafa6fd6e.sdp/playlist_dvr.m3u8"],
  ["Supreme livepush", "https://live-par-2-abr-ln.livepush.io/live_abr/emeH2sLDBLZbHw3Lx/tracks-v3a1/mono.m3u8"],
  ["Derana ythls", "https://ythls.onrender.com/channel/UCbkMFGQ_RWIf0OiYeOpf6Ng.m3u8"],
  ["Hiru serverse", "https://dc2.serverse.com:19360/hirutv/hirutv.m3u8"],
  ["Charana", "https://edge3-moblive.yuppcdn.net/transhd2/smil:chtv05.smil/index.m3u8"],
  ["Jaya", "https://live.jayatv.lk/hls/stream.m3u8"],
  ["Talent live", "http://live.talenttv.lk:8080/hls/x8kd5n3tm8e8lsv/index.m3u8"],
  ["PEOTV derana", "https://live.peotv.com/bpk-tv/004/output/index.m3u8"],
  ["PEOTV sirasa", "https://live.peotv.com/bpk-tv/010/output/index.m3u8"],
  ["PEOTV rupavahini", "https://live.peotv.com/bpk-tv/001/output/index.m3u8"],
];

for (const [name, url] of urls) {
  try {
    const r = await fetch(url, {
      headers: { Referer: url.includes("peotv") ? "https://webapp.peotv.com/" : undefined },
      signal: AbortSignal.timeout(10000),
    });
    const t = await r.text();
    const ok = r.ok && (t.includes("#EXTM3U") || t.includes("#EXTINF"));
    console.log(name, ok ? "OK" : `FAIL ${r.status}`, ok ? "" : t.slice(0, 60));
  } catch (e) {
    console.log(name, "ERR", e.cause?.code ?? e.message);
  }
}
