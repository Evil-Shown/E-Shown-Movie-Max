/** Fast logo sources per channel — Google favicon + domain for instant grid loading */
export const CHANNEL_LOGO_DOMAINS: Record<string, string> = {
  "hiru-tv": "hirutv.lk",
  "tv-derana": "derana.lk",
  "sirasa-tv": "sirasatv.lk",
  "swarnavahini": "swarnavahini.lk",
  "itn": "itn.lk",
  "rupavahini": "rupavahini.lk",
  "channel-eye": "channeleye.lk",
  "shakthi-tv": "shakthitv.lk",
  "vasantham-tv": "vasantham.lk",
  "supreme-tv": "tvsupreme.lk",
  "ada-derana-24": "adaderana.lk",
  "jaya-tv": "jayatv.lk",
  "shraddha-tv": "shraddha.lk",
  "charana-tv": "charana.lk",
  "the-buddhist": "thebuddhist.tv",
  "tv1": "tv1.lk",
  "art-tv": "arttv.lk",
  "rangiri-tv": "rangiri.lk",
  "haritha-tv": "harithatv.lk",
  "tv-didula": "tvdidula.lk",
  "damsathara-tv": "damsathara.lk",
  "asia-tv": "asiatvnet.com",
  "siyatha-tv": "siyatha.lk",
  "monara-tv": "monara.lk",
  "ndtv-lanka": "ndtvlanka.lk",
  "talent-tv": "talenttv.lk",
  "imai-tv": "imaitv.lk",
  "verbum-tv": "verbumtv.lk",
  "star-tamil-tv": "startamil.tv",
  "espn": "espn.com",
  "espn2": "espn.com",
  "espnu": "espn.com",
  "espn-deportes": "espn.com",
  "sky-sports": "skysports.com",
  "star-sports": "starsports.com",
  "sony-sports": "sonyliv.com",
  "eurosport": "eurosport.com",
  "bein-sports": "beinsports.com",
  "fox-sports": "foxsports.com",
  "red-bull-tv": "redbull.com",
  "motogp": "motogp.com",
  "wwe": "wwe.com",
  "hbo": "hbo.com",
  "axn": "axn.com",
  "warner-tv": "warnertv.com",
  "mtv": "mtv.com",
  "comedy-central": "cc.com",
  "pluto-tv-comedy": "pluto.tv",
  "pluto-tv-movies": "pluto.tv",
  "filmrise": "filmrise.com",
  "stingray-classica": "stingray.com",
  "cnn": "cnn.com",
  "cnn-international": "cnn.com",
  "bbc-world-news": "bbc.com",
  "al-jazeera": "aljazeera.com",
  "france-24": "france24.com",
  "france-24-arabic": "france24.com",
  "dw": "dw.com",
  "dw-deutsch": "dw.com",
  "euronews": "euronews.com",
  "sky-news": "sky.com",
  "fox-news": "foxnews.com",
  "bloomberg": "bloomberg.com",
  "cgtn": "cgtn.com",
  "cgtn-documentary": "cgtn.com",
  "nhk-world": "nhk.or.jp",
  "rt-news": "rt.com",
  "wion": "wionews.com",
  "abc-news": "abcnews.go.com",
  "cbs-news": "cbsnews.com",
  "nbc-news": "nbcnews.com",
  "discovery-channel": "discovery.com",
  "national-geographic": "nationalgeographic.com",
  "animal-planet": "animalplanet.com",
  "history-channel": "history.com",
  "nasa-tv": "nasa.gov",
  "nasa-tv-media": "nasa.gov",
  "smithsonian": "smithsonianchannel.com",
  "love-nature": "lovenature.com",
  "outdoor-channel": "outdoorchannel.com",
  "cartoon-network": "cartoonnetwork.com",
  "nickelodeon": "nick.com",
  "disney-channel": "disney.com",
  "boomerang": "boomerang.com",
  "pbs-kids": "pbskids.org",
  "duck-tv": "ducktv.tv",
  "baby-tv": "babytv.com",
};

/** Local logo files bundled in /public/channels/logos */
const CHANNEL_LOCAL_LOGO_FILES: Record<string, string[]> = {
  "shakthi-tv": ["shakthi-tv.png"],
  "rangiri-tv": ["rangiri-tv.png"],
  "damsathara-tv": ["damsathara-tv.png"],
  "boomerang": ["boomerang.png"],
  "cartoon-network": ["cartoonNeywork-tv.png"],
  "star-tamil-tv": ["startamil-tv.png"],
};

/** Known-good direct logo URLs — highest priority (no Clearbit — service discontinued) */
export const CHANNEL_LOGO_URLS: Record<string, string> = {
  "hiru-tv": "https://i.imgur.com/M66UqPB.png",
  "itn": "https://i.imgur.com/NLu3guG.png",
  "siyatha-tv": "https://i.imgur.com/9Zc8G7i.png",
  "monara-tv": "https://i.imgur.com/EB99mzR.png",
  "vasantham-tv": "https://upload.wikimedia.org/wikipedia/en/1/18/Vasanthamtv_channel.jpg",
  "charana-tv": "https://www.peomobile.com/logo-2.png",
  "art-tv": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/ART_Television_%28Sri_Lanka%29_%28logo%29.png/250px-ART_Television_%28Sri_Lanka%29_%28logo%29.png",
  "rangiri-tv": "https://www.rangirisrilanka.lk/img/cc.jpg",
  "haritha-tv": "https://cdn.newsfirst.lk/english-uploads/2021/03/9284892e-new-project.jpg",
  "tv-didula": "https://tvdidula.lk/wp-content/uploads/2023/05/didula-logo.webp",
  "verbum-tv": "https://static.wixstatic.com/media/21e4ab_572471a6e34b413b93bf92c6f8aee9c8~mv2.png/v1/fill/w_701%2Ch_995%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/21e4ab_572471a6e34b413b93bf92c6f8aee9c8~mv2.png",
  "star-tamil-tv": "https://voa.lk/demo/wp-content/uploads/2017/09/Artboard-1-copy-2.jpg",
  "ndtv-lanka": "https://i.imgur.com/5cyTVRJ.png",
  "imai-tv": "https://i.imgur.com/9tODclu.png",
  "al-jazeera": "https://i.imgur.com/7bRVpnu.png",
  "france-24": "https://upload.wikimedia.org/wikipedia/commons/8/8a/France24.png",
  "fox-news": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/512px-Fox_News_Channel_logo.svg.png",
  "espn": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png",
  "nasa-tv": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/512px-NASA_logo.svg.png",
};

export function getLogoCandidates(channelId: string, logoDevUrl?: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  // 1. Try bundled local logo assets first
  add(`/channels/logos/${channelId}.png`);
  for (const fileName of CHANNEL_LOCAL_LOGO_FILES[channelId] ?? []) {
    add(`/channels/logos/${fileName}`);
  }

  // (Keep explicitly mapped known-good URLs)
  if (CHANNEL_LOGO_URLS[channelId]) {
    add(CHANNEL_LOGO_URLS[channelId]);
  }

  const domain = CHANNEL_LOGO_DOMAINS[channelId];

  // 2. Logo.dev
  if (logoDevUrl) {
    add(`${logoDevUrl}?token=pk_CvtKnlevScSGAPFV3KyoLA`);
  } else if (domain) {
    add(`https://img.logo.dev/${domain}?token=pk_CvtKnlevScSGAPFV3KyoLA`);
  }

  if (domain) {
    // 3. Google favicon
    add(`https://www.google.com/s2/favicons?domain=${domain}&sz=128`);

    // 4. Brandfetch
    add(`https://icon.brandfetch.io/${domain}`);

    // 5. Clearbit
    add(`https://logo.clearbit.com/${domain}`);

    // 6. DuckDuckGo
    add(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  return candidates;
}
