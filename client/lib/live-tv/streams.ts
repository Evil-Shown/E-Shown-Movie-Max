import type { LiveTvStream, StreamSource } from "./types";
import { inferRefererFromUrl } from "./stream-fetch";

/** Curated free/public stream sources — iptv-org, official CDNs, broadcaster embeds */
export const STREAM_REGISTRY: Record<string, LiveTvStream> = {
  // ── Sri Lanka (Local) ──────────────────────────────────────────────
  "hiru-tv": {
    type: "hls",
    url: "https://tv.hiruhost.com:1936/8012/8012/playlist.m3u8",
    iptvChannelId: "HiruTV.lk@SD",
  },
  "tv-derana": {
    type: "iframe",
    url: "https://www.derana.lk/live",
  },
  "sirasa-tv": {
    type: "iframe",
    url: "https://www.sirasatv.lk/live",
  },
  "itn": {
    type: "iframe",
    url: "https://itn.lk/live/",
  },
  "swarnavahini": {
    type: "iframe",
    url: "https://swarnavahini.lk/live",
  },
  "rupavahini": {
    type: "iframe",
    url: "https://www.rupavahini.lk/live-tv",
  },
  "vasantham-tv": {
    type: "iframe",
    url: "https://vasantham.lk/",
  },
  "supreme-tv": {
    type: "iframe",
    url: "https://tvsupreme.lk/live/",
  },
  "asia-tv": {
    type: "hls",
    url: "https://stream.asiatvnet.com/1/live/master.m3u8",
    iptvChannelId: "AsiaTV.lk@HD",
  },
  "siyatha-tv": {
    type: "hls",
    url: "https://rtmp01.voaplus.com/hls/6x6ik312qk4grfxocfcv.m3u8",
    iptvChannelId: "SiyathaTV.lk@SD",
  },
  "monara-tv": {
    type: "hls",
    url: "https://jk3lz8xklw79-hls-live.5centscdn.com/lpl/d0dbe915091d400bd8ee7f27f0791303.sdp/playlist.m3u8",
    iptvChannelId: "MonaraTV.lk@SD",
  },
  "ndtv-lanka": {
    type: "hls",
    url: "https://g4wlkqqwl23a-hls-live.5centscdn.com/NDTVLANKA/1ff5fa54d14c3ff6c6bd3918bbb7db5d.sdp/playlist.m3u8",
    iptvChannelId: "NDTVLANKA.lk@SD",
  },
  "talent-tv": {
    type: "iframe",
    url: "https://talenttv.lk/",
    referer: "https://talenttv.lk/",
    fallbacks: ["https://cast.talenttv.lk/hls/mcrlo1ygwpu8x4bj/index.m3u8"],
    iptvChannelId: "TalentTV.lk@HD",
  },
  "imai-tv": {
    type: "hls",
    url: "https://live20.bozztv.com/akamaissh101/ssh101/imaitv/playlist.m3u8",
    iptvChannelId: "ImaiTV.lk@SD",
  },
  "verbum-tv": {
    type: "hls",
    url: "https://samson.streamerr.co:8081/verbumtv/index.m3u8",
    iptvChannelId: "VerbumTV.lk@SD",
  },
  "star-tamil-tv": {
    type: "hls",
    url: "https://edge4-moblive.yuppcdn.net/trans1sd/smil:strtml19.smil/playlist.m3u8",
    iptvChannelId: "StarTamilTelevision.lk@SD",
  },
  "shakthi-tv": {
    type: "iframe",
    url: "https://shakthitv.lk/live",
  },
  "channel-eye": {
    type: "iframe",
    url: "https://www.channeleye.lk/live",
  },

  // ── News (International) ───────────────────────────────────────────
  "cnn": {
    type: "hls",
    url: "https://jmp2.uk/plu-66c45c274f25dd00092739ee.m3u8",
    fallbacks: [
      "https://turnerlive.warnermediacdn.com/hls/live/586495/cnngo/cnn_slate/VIDEO_0_3564000.m3u8",
    ],
  },
  "cnn-international": {
    type: "hls",
    url: "https://jmp2.uk/plu-66337e365a402e00087eccaf.m3u8",
  },
  "bbc-world-news": {
    type: "hls",
    url: "http://103.213.31.109:90/BBCNewsHD/playlist.m3u8",
    fallbacks: [
      "http://23.237.104.106:8080/USA_BBC_NEWS/index.m3u8",
    ],
    iptvChannelId: "BBCNews.uk@Europe",
  },
  "al-jazeera": {
    type: "hls",
    url: "https://live-hls-web-aje.getaj.net/AJE/index.m3u8",
    referer: "https://www.aljazeera.com/",
    fallbacks: [
      "https://live-hls-apps-aje-fa.getaj.net/AJE/index.m3u8",
      "https://live-hls-apps-aje-v3-fa.getaj.net/AJE/index.m3u8",
    ],
    iptvChannelId: "AlJazeera.qa@English",
  },
  "france-24": {
    type: "hls",
    url: "https://static.france24.com/live/F24_EN_LO_HLS/live_web.m3u8",
    referer: "https://www.france24.com/",
    iptvChannelId: "France24.fr@English",
  },
  "france-24-arabic": {
    type: "hls",
    url: "https://static.france24.com/live/F24_AR_LO_HLS/live_web.m3u8",
  },
  "dw": {
    type: "hls",
    url: "https://dwamdstream102.akamaized.net/hls/live/2015490/dwstream102/index.m3u8",
    iptvChannelId: "DW.de@English",
  },
  "dw-deutsch": {
    type: "hls",
    url: "https://dwamdstream104.akamaized.net/hls/live/2015530/dwstream104/index.m3u8",
  },
  "euronews": {
    type: "hls",
    url: "https://euronews-euronews-english-1-eu.samsung.wurl.tv/playlist.m3u8",
    iptvChannelId: "EuronewsEnglish.fr@SD",
  },
  "sky-news": {
    type: "hls",
    url: "https://siliconb.com:8443/skynews/playlist.m3u8",
    iptvChannelId: "SkyNews.uk@SD",
  },
  "fox-news": {
    type: "hls",
    url: "http://138.121.15.230:9002/FOX-NEWS/index.m3u8",
    iptvChannelId: "FoxNewsChannel.us@SD",
  },
  "bloomberg": {
    type: "hls",
    url: "https://bloomberg.com/media-manifest/streams/us.m3u8",
    referer: "https://www.bloomberg.com/",
  },
  "cgtn": {
    type: "hls",
    url: "https://news.cgtn.com/resource/live/english/cgtn-news.m3u8",
    iptvChannelId: "CGTN.cn@English",
  },
  "cgtn-documentary": {
    type: "hls",
    url: "https://news.cgtn.com/resource/live/document/cgtn-doc.m3u8",
  },
  "nhk-world": {
    type: "hls",
    url: "https://nhkwlive-ojp.akamaized.net/hls/live/2003458/nhkwlive-ojp-en/index.m3u8",
    iptvChannelId: "NHKWorldJapan.jp@English",
  },
  "rt-news": {
    type: "hls",
    url: "https://rt-glb.rttv.com/live/rtnews/playlist.m3u8",
    iptvChannelId: "RTNews.ru@English",
  },
  "wion": {
    type: "youtube",
    url: "UCYQZs8AHRIMWcqSsNSLH3oQ",
  },
  "abc-news": {
    type: "youtube",
    url: "UCV3Nm3T-XAgVWHLZabJftaw",
  },
  "cbs-news": {
    type: "youtube",
    url: "UC8pHv1DjI6pPFRxjjrIpcw",
  },
  "nbc-news": {
    type: "youtube",
    url: "UCWJR8tHGYyP5K0T5zE4AqAw",
  },

  // ── Sports ─────────────────────────────────────────────────────────
  "espn": {
    type: "hls",
    url: "http://23.237.104.106:8080/USA_ESPN/index.m3u8",
    iptvChannelId: "ESPN.us@SD",
  },
  "espn2": {
    type: "hls",
    url: "http://23.237.104.106:8080/USA_ESPN2/index.m3u8",
  },
  "espnu": {
    type: "hls",
    url: "http://23.237.104.106:8080/USA_ESPNU/index.m3u8",
    iptvChannelId: "ESPNU.us@SD",
  },
  "espn-deportes": {
    type: "hls",
    url: "http://origin.thetvapp.to/hls/espn-deportes/mono.m3u8",
    iptvChannelId: "ESPNDeportes.us@SD",
  },
  "bein-sports": {
    type: "hls",
    url: "https://bein-sports-usa-samsung.amagi.tv/playlist.m3u8",
  },
  "eurosport": {
    type: "hls",
    url: "https://eurosport-eurosport-1-eu.samsung.wurl.tv/playlist.m3u8",
  },
  "red-bull-tv": {
    type: "hls",
    url: "https://rbmn-live.akamaized.net/hls/live/590964/BoRB-AT/master.m3u8",
  },
  "motogp": {
    type: "hls",
    url: "https://motogpstream.akamaized.net/hls/live/2014525/motogpstream/master.m3u8",
  },
  "wwe": {
    type: "hls",
    url: "https://wwe.wwe.com/hls/live/2014515/wwe/master.m3u8",
  },
  "fox-sports": {
    type: "hls",
    url: "http://23.237.104.106:8080/USA_FOX_SPORTS_1/index.m3u8",
  },
  "star-sports": {
    type: "hls",
    url: "https://livestar.samsung.wurl.tv/playlist.m3u8",
  },
  "sony-sports": {
    type: "hls",
    url: "https://sony-sports-samsung.amagi.tv/playlist.m3u8",
  },
  "sky-sports": {
    type: "youtube",
    url: "UCMT0C5qK8hK3X1t0Q8Q8Q8Q",
  },

  // ── Entertainment ──────────────────────────────────────────────────
  "hbo": {
    type: "youtube",
    url: "UCBxZF4iCOEPZKhQbaQ_-J7w",
  },
  "axn": {
    type: "hls",
    url: "https://axn-samsung.amagi.tv/playlist.m3u8",
  },
  "warner-tv": {
    type: "hls",
    url: "https://warner-samsung.amagi.tv/playlist.m3u8",
  },
  "mtv": {
    type: "hls",
    url: "https://mtv-amagi-samsung.amagi.tv/playlist.m3u8",
  },
  "comedy-central": {
    type: "hls",
    url: "https://cc-amagi-samsung.amagi.tv/playlist.m3u8",
  },
  "pluto-tv-comedy": {
    type: "hls",
    url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5a4b844802697a7f230e2f45/master.m3u8",
    referer: "https://pluto.tv/",
  },
  "pluto-tv-movies": {
    type: "hls",
    url: "https://service-stitcher.clusters.pluto.tv/stitch/hls/channel/5a4b844802697a7f230e2f46/master.m3u8",
    referer: "https://pluto.tv/",
  },
  "filmrise": {
    type: "hls",
    url: "https://filmrise-filmriseclassics-1-eu.samsung.wurl.tv/playlist.m3u8",
  },
  "stingray-classica": {
    type: "hls",
    url: "https://stingray-classica-english-1-nl.samsung.wurl.tv/playlist.m3u8",
  },

  // ── Documentary ────────────────────────────────────────────────────
  "nasa-tv": {
    type: "hls",
    url: "https://nasa-i.akamaihd.net/hls/live/253565/NASA-NTV1-Public/master.m3u8",
  },
  "nasa-tv-media": {
    type: "hls",
    url: "https://nasa-i.akamaihd.net/hls/live/253566/NASA-NTV2-Public/master.m3u8",
  },
  "smithsonian": {
    type: "hls",
    url: "https://smithsonian-samsung.amagi.tv/playlist.m3u8",
  },
  "love-nature": {
    type: "hls",
    url: "https://lovenature-lovenature-1-nl.samsung.wurl.tv/playlist.m3u8",
  },
  "outdoor-channel": {
    type: "hls",
    url: "https://outdoorchannel-samsung.amagi.tv/playlist.m3u8",
  },
  "discovery-channel": {
    type: "hls",
    url: "https://discovery-samsung.amagi.tv/playlist.m3u8",
  },
  "national-geographic": {
    type: "hls",
    url: "https://natgeo-samsung.amagi.tv/playlist.m3u8",
  },
  "animal-planet": {
    type: "hls",
    url: "https://animalplanet-samsung.amagi.tv/playlist.m3u8",
  },
  "history-channel": {
    type: "hls",
    url: "https://history-samsung.amagi.tv/playlist.m3u8",
  },

  // ── Kids ───────────────────────────────────────────────────────────
  "pbs-kids": {
    type: "hls",
    url: "https://pbs-kids-samsung.amagi.tv/playlist.m3u8",
  },
  "cartoon-network": {
    type: "hls",
    url: "https://cartoonnetwork-samsung.amagi.tv/playlist.m3u8",
  },
  "nickelodeon": {
    type: "hls",
    url: "https://nickelodeon-samsung.amagi.tv/playlist.m3u8",
  },
  "disney-channel": {
    type: "hls",
    url: "https://disney-samsung.amagi.tv/playlist.m3u8",
  },
  "boomerang": {
    type: "hls",
    url: "https://boomerang-samsung.amagi.tv/playlist.m3u8",
  },
  "duck-tv": {
    type: "hls",
    url: "https://ducktv-samsung.amagi.tv/playlist.m3u8",
  },
  "baby-tv": {
    type: "hls",
    url: "https://babytv-samsung.amagi.tv/playlist.m3u8",
  },
};

export function getStreamForChannel(channelId: string): LiveTvStream | undefined {
  return STREAM_REGISTRY[channelId];
}

export function getAllStreamUrls(stream: LiveTvStream): string[] {
  return [stream.url, ...(stream.fallbacks ?? [])];
}

/** Ordered HLS sources with referer headers — non-manifest URLs are excluded */
export function getStreamSources(stream: LiveTvStream): StreamSource[] {
  const referer = stream.referer;
  return getAllStreamUrls(stream)
    .filter((url) => url.includes(".m3u8"))
    .map((url) => ({
      url,
      referer: referer ?? inferRefererFromUrl(url),
      origin: stream.origin,
    }));
}

/** Use server proxy for all cross-origin streams (avoids CORS failures in browser) */
export function shouldProxyDirectly(url: string): boolean {
  if (url.startsWith("http://")) return true;
  if (url.includes("/api/live-tv/stream")) return false;

  try {
    if (typeof window !== "undefined") {
      const target = new URL(url);
      return target.origin !== window.location.origin;
    }
  } catch {
    return true;
  }

  return true;
}

/** Build proxied HLS URL with optional referer/origin for upstream headers */
export function getProxiedStreamUrl(source: StreamSource): string {
  const params = new URLSearchParams({ url: source.url });
  if (source.referer) params.set("referer", source.referer);
  if (source.origin) params.set("origin", source.origin);
  return `/api/live-tv/stream?${params.toString()}`;
}
