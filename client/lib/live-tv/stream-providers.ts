/** PEOTV live.peotv.com channel numbers (Dialog TV / SLT Mobitel lineup) */
export const PEOTV_CHANNEL_IDS: Record<string, string[]> = {
  "rupavahini": ["001", "301"],
  "channel-eye": ["119"],
  "itn": ["003", "303"],
  "tv-derana": ["004", "304"],
  "charana-tv": ["005", "305"],
  "swarnavahini": ["006"],
  "vasantham-tv": ["007"],
  "siyatha-tv": ["008", "300"],
  "haritha-tv": ["009"],
  "sirasa-tv": ["010", "306"],
  "shakthi-tv": ["011"],
  "tv1": ["012"],
  "supreme-tv": ["013"],
  "ada-derana-24": ["014"],
  "art-tv": ["017"],
  "hiru-tv": ["019", "307"],
  "star-tamil-tv": ["021"],
  "rangiri-tv": ["022"],
  "jaya-tv": ["094"],
  "verbum-tv": ["093"],
  "the-buddhist": ["096"],
  "shraddha-tv": ["099"],
  "monara-tv": ["104"],
  "tv-didula": ["117"],
  "damsathara-tv": ["126"],
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

export function buildPeotvManifestUrl(channelNum: string): string {
  const padded = channelNum.padStart(3, "0");
  return `https://live.peotv.com/bpk-tv/${padded}/output/index.m3u8`;
}

export interface PeotvStreamOptions {
  embedFallback?: string;
  fallbacks?: string[];
  iptvChannelId?: string;
  /** Use when a direct public CDN works better than PEOTV (e.g. Hiru host) */
  primaryUrl?: string;
}

/** Build HLS stream config from PEOTV channel number(s) */
export function peotvStreamConfig(
  channelNums: string[],
  options: PeotvStreamOptions = {}
) {
  const peotvUrls = channelNums.map(buildPeotvManifestUrl);
  const primary = options.primaryUrl ?? peotvUrls[0];
  const peotvFallbacks = options.primaryUrl ? peotvUrls : peotvUrls.slice(1);

  return {
    type: "hls" as const,
    url: primary,
    fallbacks: [...peotvFallbacks, ...(options.fallbacks ?? [])],
    referer: PEOTV_REFERER,
    origin: PEOTV_ORIGIN,
    embedFallback: options.embedFallback,
    iptvChannelId: options.iptvChannelId,
  };
}

export const DIALOG_REFERER = "https://www.dialog.lk/";
export const DIALOG_ORIGIN = "https://www.dialog.lk";

export const DIALOG_TV_REFERER = "https://www.dialogtv.lk/";
export const DIALOG_TV_ORIGIN = "https://www.dialogtv.lk";

/** Reverse-engineered PEOTV API endpoints (JSON channel manifests) */
export const PEOTV_API_ENDPOINTS = [
  "https://webapp.peotv.com/api/channels",
  "https://webapp.peotv.com/api/v1/channels",
  "https://webapp.peotv.com/api/live/channels",
];

/** Dialog TV public pages — may require LK IP or subscription cookies */
export const DIALOG_TV_SCRAPE_PAGES = [
  {
    pageUrl: "https://www.dialogtv.lk/live-tv",
    referer: DIALOG_TV_REFERER,
    origin: DIALOG_TV_ORIGIN,
  },
  {
    pageUrl: "https://www.dialogtv.lk/",
    referer: DIALOG_TV_REFERER,
    origin: DIALOG_TV_ORIGIN,
  },
  {
    pageUrl: "https://www.dialogtv.lk/live",
    referer: DIALOG_TV_REFERER,
    origin: DIALOG_TV_ORIGIN,
  },
  {
    pageUrl: "https://www.dialogtv.lk/channels",
    referer: DIALOG_TV_REFERER,
    origin: DIALOG_TV_ORIGIN,
  },
];

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
  "ada-derana-24": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://www.adaderana.lk/", referer: "https://www.adaderana.lk/" },
  ],
  "jaya-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://jayatv.lk/", referer: "https://jayatv.lk/" },
  ],
  "shraddha-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
    { pageUrl: "https://shraddha.lk/", referer: "https://shraddha.lk/" },
  ],
  "charana-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "the-buddhist": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "tv1": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "art-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "rangiri-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "haritha-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "tv-didula": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "damsathara-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
  "verbum-tv": [
    { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  ],
};

/** Dialog ViU pages — streams usually require subscription auth */
export const DIALOG_SCRAPE_PAGES = [
  ...DIALOG_TV_SCRAPE_PAGES,
  { pageUrl: "https://www.dialog.lk/viu-app/livetv", referer: DIALOG_REFERER, origin: DIALOG_ORIGIN },
  { pageUrl: "https://dlg.dialog.lk/dialog-television", referer: "https://dlg.dialog.lk/", origin: "https://dlg.dialog.lk" },
];

/** PEOTV marketing pages to scan when webapp is geo-blocked */
export const PEOTV_SCRAPE_PAGES = [
  { pageUrl: "https://webapp.peotv.com/", referer: PEOTV_REFERER, origin: PEOTV_ORIGIN },
  { pageUrl: "https://www.peotv.com/", referer: "https://www.peotv.com/", origin: "https://www.peotv.com" },
  { pageUrl: "https://www.peotv.com/live", referer: "https://www.peotv.com/", origin: "https://www.peotv.com" },
  { pageUrl: "https://www.peotv.com/live-tv", referer: "https://www.peotv.com/", origin: "https://www.peotv.com" },
  { pageUrl: "https://peotv.com/", referer: "https://peotv.com/", origin: "https://peotv.com" },
  { pageUrl: "https://peotv.com/live-tv", referer: "https://peotv.com/", origin: "https://peotv.com" },
  { pageUrl: "https://peotv.com/live", referer: "https://peotv.com/", origin: "https://peotv.com" },
];

export interface ProviderScrapeTarget {
  pageUrl: string;
  referer: string;
  origin?: string;
}

/** Per-channel Dialog TV deep-link pages (reverse-engineered URL patterns) */
export function buildDialogTvChannelPages(channelId: string): ProviderScrapeTarget[] {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  return ids.flatMap((id) => {
    const padded = id.padStart(3, "0");
    return [
      {
        pageUrl: `https://www.dialogtv.lk/live-tv/channel-${padded}`,
        referer: DIALOG_TV_REFERER,
        origin: DIALOG_TV_ORIGIN,
      },
      {
        pageUrl: `https://www.dialogtv.lk/live-tv/${padded}`,
        referer: DIALOG_TV_REFERER,
        origin: DIALOG_TV_ORIGIN,
      },
      {
        pageUrl: `https://www.dialogtv.lk/live-tv?channel=${padded}`,
        referer: DIALOG_TV_REFERER,
        origin: DIALOG_TV_ORIGIN,
      },
    ];
  });
}

/** Per-channel PEOTV marketing / embed pages */
export function buildPeotvChannelPages(channelId: string): ProviderScrapeTarget[] {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  return ids.flatMap((id) => {
    const padded = id.padStart(3, "0");
    return [
      {
        pageUrl: `https://www.peotv.com/live-tv/channel-${padded}`,
        referer: "https://www.peotv.com/",
        origin: "https://www.peotv.com",
      },
      {
        pageUrl: `https://www.peotv.com/live-tv/${padded}`,
        referer: "https://www.peotv.com/",
        origin: "https://www.peotv.com",
      },
      {
        pageUrl: `https://peotv.com/live-tv/channel-${padded}`,
        referer: "https://peotv.com/",
        origin: "https://peotv.com",
      },
      {
        pageUrl: `https://webapp.peotv.com/watch/${padded}`,
        referer: PEOTV_REFERER,
        origin: PEOTV_ORIGIN,
      },
    ];
  });
}

export function buildPeotvApiUrls(channelId: string): string[] {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  return ids.flatMap((id) => [
    ...PEOTV_API_ENDPOINTS.map((base) => `${base.replace(/\/$/, "")}/${id}/stream`),
    `https://webapp.peotv.com/api/channels/${id}`,
    `https://webapp.peotv.com/api/v1/channels/${id}/playback`,
    `https://webapp.peotv.com/api/live/${id}`,
  ]);
}

export function buildPeotvStreamUrls(channelId: string): string[] {
  const ids = PEOTV_CHANNEL_IDS[channelId];
  if (!ids?.length) return [];

  return ids.map(buildPeotvManifestUrl);
}

export function getProviderReferer(channelId: string): string | undefined {
  if (PEOTV_CHANNEL_IDS[channelId]) return PEOTV_REFERER;
  return undefined;
}

export function getProviderOrigin(channelId: string): string | undefined {
  if (PEOTV_CHANNEL_IDS[channelId]) return PEOTV_ORIGIN;
  return undefined;
}
