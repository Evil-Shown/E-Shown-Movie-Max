/** PEOTV live.peotv.com channel numbers (reverse-engineered from provider lineup) */
export const PEOTV_CHANNEL_IDS: Record<string, string[]> = {
  "rupavahini": ["001", "301"],
  "itn": ["003", "303"],
  "tv-derana": ["004", "304"],
  "swarnavahini": ["006"],
  "vasantham-tv": ["007"],
  "siyatha-tv": ["008", "300"],
  "sirasa-tv": ["010", "306"],
  "shakthi-tv": ["011"],
  "supreme-tv": ["013"],
  "hiru-tv": ["019", "307"],
  "star-tamil-tv": ["021"],
  "monara-tv": ["104"],
  "channel-eye": ["119"],
  "cnn": ["023"],
  "bbc-world-news": ["024"],
  "al-jazeera": ["026"],
  "france-24": ["027"],
  "dw": ["092"],
  "bloomberg": ["160"],
  "nhk-world": ["161"],
  "rt-news": ["162"],
};

export const PEOTV_REFERER = "https://webapp.peotv.com/";
export const PEOTV_ORIGIN = "https://webapp.peotv.com";

export const DIALOG_REFERER = "https://www.dialog.lk/";
export const DIALOG_ORIGIN = "https://www.dialog.lk";

/** Pages to scrape for embedded manifests (Dialog ViU / PEOTV web) */
export const PROVIDER_SCRAPE_PAGES: Record<string, { pageUrl: string; referer: string; origin?: string }[]> = {
  "tv-derana": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://www.derana.lk/live", referer: "https://www.derana.lk/" },
  ],
  "sirasa-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://www.sirasatv.lk/live", referer: "https://www.sirasatv.lk/" },
  ],
  "hiru-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://www.hirutv.lk/live", referer: "https://www.hirutv.lk/" },
  ],
  "itn": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://itn.lk/live/", referer: "https://itn.lk/" },
  ],
  "swarnavahini": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://swarnavahini.lk/live", referer: "https://swarnavahini.lk/" },
  ],
  "rupavahini": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://www.rupavahini.lk/live-tv", referer: "https://www.rupavahini.lk/" },
  ],
  "shakthi-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://shakthitv.lk/live", referer: "https://shakthitv.lk/" },
  ],
  "vasantham-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://vasantham.lk/", referer: "https://vasantham.lk/" },
  ],
  "supreme-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://tvsupreme.lk/live/", referer: "https://tvsupreme.lk/" },
  ],
  "channel-eye": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://www.channeleye.lk/live", referer: "https://www.channeleye.lk/" },
  ],
  "siyatha-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "monara-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "star-tamil-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
};

/** Dialog ViU pages — streams usually require subscription auth */
export const DIALOG_SCRAPE_PAGES = [
  { pageUrl: "https://www.dialog.lk/viu-app/livetv", referer: DIALOG_REFERER, origin: DIALOG_ORIGIN },
  { pageUrl: "https://dlg.dialog.lk/dialog-television", referer: "https://dlg.dialog.lk/", origin: "https://dlg.dialog.lk" },
];

export function buildPeotvStreamUrls(channelId: string): string[] {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  return ids.map(
    (id) => `https://live.peotv.com/bpk-tv/${id}/output/index.m3u8`
  );
}

export function getProviderReferer(channelId: string): string | undefined {
  if (PEOTV_CHANNEL_IDS[channelId]) return PEOTV_REFERER;
  return undefined;
}

export function getProviderOrigin(channelId: string): string | undefined {
  if (PEOTV_CHANNEL_IDS[channelId]) return PEOTV_ORIGIN;
  return undefined;
}
