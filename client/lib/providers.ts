export type StreamProvider =
  | "vidfast"
  | "vidlink"
  | "superembed"
  | "autoembed"
  | "vidsrcpm"
  | "vidsrc";

/** VidFast first — best uptime in current embed catalog. */
export const DEFAULT_STREAM_PROVIDER: StreamProvider = "vidfast";

export const STREAM_PROVIDERS: StreamProvider[] = [
  "vidfast",
  "vidlink",
  "superembed",
  "vidsrcpm",
  "vidsrc",
  "autoembed",
];

export const PROVIDER_LABELS: Record<StreamProvider, string> = {
  vidfast: "VidFast",
  vidlink: "VidLink",
  superembed: "SuperEmbed",
  autoembed: "AutoEmbed",
  vidsrcpm: "VidSrc.pm",
  vidsrc: "VidSrc",
};

/** Site palette passed to embed players so controls match Chithra. */
export const PLAYER_THEME = {
  accent: "e8a44a",
  primary: "c96a2b",
  background: "1c1917",
  icon: "f7f4ef",
} as const;

function appendQuery(base: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined) search.set(key, value);
  }
  const query = search.toString();
  return query ? `${base}?${query}` : base;
}

export function buildEmbedUrl(
  provider: StreamProvider,
  mediaId: string,
  type: "movie" | "tv",
  season?: number,
  episode?: number,
  options?: {
    autoPlay?: boolean;
    seek?: number;
    subtitleLang?: string;
    subtitleFile?: string;
    subtitleLabel?: string;
  }
): string {
  const autoPlay = options?.autoPlay !== false;
  const seek = options?.seek;
  const subtitleLang = options?.subtitleLang;
  const subtitleFile = options?.subtitleFile;
  const subtitleLabel = options?.subtitleLabel;

  switch (provider) {
    case "vidfast": {
      const path =
        type === "movie"
          ? `https://vidfast.pro/movie/${mediaId}`
          : `https://vidfast.pro/tv/${mediaId}/${season}/${episode}`;
      return appendQuery(path, {
        autoPlay: autoPlay ? "true" : "false",
        startAt: seek ? String(seek) : undefined,
        primaryColor: PLAYER_THEME.accent,
        secondaryColor: PLAYER_THEME.background,
        iconColor: PLAYER_THEME.icon,
        title: "false",
        poster: "false",
        sub: subtitleLang && subtitleLang !== "off" ? subtitleLang : undefined,
        sub_file: subtitleFile,
        sub_label: subtitleLabel,
      });
    }
    case "vidlink": {
      const path =
        type === "movie"
          ? `https://vidlink.pro/movie/${mediaId}`
          : `https://vidlink.pro/tv/${mediaId}/${season}/${episode}`;
      return appendQuery(path, {
        autoplay: String(autoPlay),
        startAt: seek ? String(seek) : undefined,
        primaryColor: PLAYER_THEME.accent,
        secondaryColor: PLAYER_THEME.background,
        iconColor: PLAYER_THEME.icon,
        title: "false",
        poster: "false",
        icons: "default",
        sub: subtitleLang && subtitleLang !== "off" ? subtitleLang : undefined,
        sub_file: subtitleFile,
        sub_label: subtitleLabel,
      });
    }
    case "superembed": {
      if (type === "movie") {
        return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1`;
      }
      return `https://multiembed.mov/?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}`;
    }
    case "autoembed": {
      if (type === "movie") {
        return `https://autoembed.co/movie/tmdb/${mediaId}`;
      }
      return `https://autoembed.co/tv/tmdb/${mediaId}-${season}-${episode}`;
    }
    case "vidsrcpm": {
      const path =
        type === "movie"
          ? `https://vidsrc.pm/embed/movie/${mediaId}`
          : `https://vidsrc.pm/embed/tv/${mediaId}/${season}/${episode}`;
      return appendQuery(path, {
        ...(autoPlay ? {} : { autoPlay: "false" }),
        ...(seek ? { startAt: String(seek) } : {}),
        color: PLAYER_THEME.accent,
        poster: "false",
      });
    }
    case "vidsrc": {
      const path =
        type === "movie"
          ? `https://vidsrc.cc/v2/embed/movie/${mediaId}`
          : `https://vidsrc.cc/v2/embed/tv/${mediaId}/${season}/${episode}`;
      return appendQuery(path, {
        ...(autoPlay ? {} : { autoPlay: "false" }),
        ...(seek ? { startAt: String(seek) } : {}),
        color: PLAYER_THEME.accent,
        poster: "false",
      });
    }
  }
}

export function nextProvider(current: StreamProvider): StreamProvider {
  const index = STREAM_PROVIDERS.indexOf(current);
  return STREAM_PROVIDERS[(index + 1) % STREAM_PROVIDERS.length];
}

export function getProviderOrigin(provider: StreamProvider): string {
  switch (provider) {
    case "vidfast":
      return "https://vidfast.pro";
    case "vidlink":
      return "https://vidlink.pro";
    case "superembed":
      return "https://multiembed.mov";
    case "autoembed":
      return "https://autoembed.co";
    case "vidsrcpm":
      return "https://vidsrc.pm";
    case "vidsrc":
      return "https://vidsrc.cc";
  }
}
