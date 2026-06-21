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

/** Known-good direct logo URLs — highest priority (no Clearbit — service discontinued) */
export const CHANNEL_LOGO_URLS: Record<string, string> = {
  "hiru-tv": "https://i.imgur.com/M66UqPB.png",
  "tv-derana": "https://www.google.com/s2/favicons?domain=derana.lk&sz=256",
  "sirasa-tv": "https://www.google.com/s2/favicons?domain=sirasatv.lk&sz=256",
  "swarnavahini": "https://www.google.com/s2/favicons?domain=swarnavahini.lk&sz=256",
  "itn": "https://i.imgur.com/NLu3guG.png",
  "rupavahini": "https://www.google.com/s2/favicons?domain=rupavahini.lk&sz=256",
  "vasantham-tv": "https://www.google.com/s2/favicons?domain=vasantham.lk&sz=256",
  "supreme-tv": "https://www.google.com/s2/favicons?domain=tvsupreme.lk&sz=256",
  "asia-tv": "https://www.google.com/s2/favicons?domain=asiatvnet.com&sz=256",
  "siyatha-tv": "https://i.imgur.com/9Zc8G7i.png",
  "monara-tv": "https://i.imgur.com/EB99mzR.png",
  "ndtv-lanka": "https://i.imgur.com/5cyTVRJ.png",
  "imai-tv": "https://i.imgur.com/9tODclu.png",
  "shakthi-tv": "https://www.google.com/s2/favicons?domain=shakthitv.lk&sz=256",
  "channel-eye": "https://www.google.com/s2/favicons?domain=channeleye.lk&sz=256",
  "al-jazeera": "https://i.imgur.com/7bRVpnu.png",
  "france-24": "https://upload.wikimedia.org/wikipedia/commons/8/8a/France24.png",
  "fox-news": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Fox_News_Channel_logo.svg/512px-Fox_News_Channel_logo.svg.png",
  "espn": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/512px-ESPN_wordmark.svg.png",
  "bbc-world-news": "https://www.google.com/s2/favicons?domain=bbc.com&sz=256",
  "cnn": "https://www.google.com/s2/favicons?domain=cnn.com&sz=256",
  "dw": "https://www.google.com/s2/favicons?domain=dw.com&sz=256",
  "nasa-tv": "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/NASA_logo.svg/512px-NASA_logo.svg.png",
  "discovery-channel": "https://www.google.com/s2/favicons?domain=discovery.com&sz=256",
  "national-geographic": "https://www.google.com/s2/favicons?domain=nationalgeographic.com&sz=256",
  "cartoon-network": "https://www.google.com/s2/favicons?domain=cartoonnetwork.com&sz=256",
  "nickelodeon": "https://www.google.com/s2/favicons?domain=nick.com&sz=256",
  "disney-channel": "https://www.google.com/s2/favicons?domain=disney.com&sz=256",
  "hbo": "https://www.google.com/s2/favicons?domain=hbo.com&sz=256",
  "mtv": "https://www.google.com/s2/favicons?domain=mtv.com&sz=256",
  "bein-sports": "https://www.google.com/s2/favicons?domain=beinsports.com&sz=256",
  "sky-sports": "https://www.google.com/s2/favicons?domain=skysports.com&sz=256",
  "bloomberg": "https://www.google.com/s2/favicons?domain=bloomberg.com&sz=256",
  "euronews": "https://www.google.com/s2/favicons?domain=euronews.com&sz=256",
  "red-bull-tv": "https://www.google.com/s2/favicons?domain=redbull.com&sz=256",
  "pbs-kids": "https://www.google.com/s2/favicons?domain=pbskids.org&sz=256",
};

export function getFaviconUrl(domain: string, size = 128): string {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
}

export function getLogoCandidates(channelId: string, logoDevUrl?: string): string[] {
  const candidates: string[] = [];
  const seen = new Set<string>();

  const add = (url: string) => {
    if (!url || seen.has(url)) return;
    seen.add(url);
    candidates.push(url);
  };

  if (CHANNEL_LOGO_URLS[channelId]) {
    add(CHANNEL_LOGO_URLS[channelId]);
  }

  const domain = CHANNEL_LOGO_DOMAINS[channelId];
  if (domain) {
    add(getFaviconUrl(domain, 256));
    add(getFaviconUrl(domain, 128));
    add(`https://icons.duckduckgo.com/ip3/${domain}.ico`);
  }

  if (logoDevUrl) {
    add(`${logoDevUrl}?token=pk_CvtKnlevScSGAPFV3KyoLA`);
  }

  add(`/channels/${channelId}.png`);

  return candidates;
}
