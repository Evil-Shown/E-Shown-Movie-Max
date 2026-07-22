export type StreamProvider =
  | "vidfast"
  | "vidlink"
  | "superembed"
  | "autoembed"
  | "vidsrcpm"
  | "vidsrc"
  | "dynamic_hls"
  | "hotstar";

export type ProviderType = "embed" | "hls";

export interface ProviderMeta {
  name: string;
  type: ProviderType;
  requiresBackendResolution: boolean;
  timeout: number;
}

export const PROVIDER_META: Record<StreamProvider, ProviderMeta> = {
  vidfast: { name: "VidFast", type: "embed", requiresBackendResolution: false, timeout: 8000 },
  vidlink: { name: "VidLink", type: "embed", requiresBackendResolution: false, timeout: 8000 },
  superembed: { name: "SuperEmbed", type: "embed", requiresBackendResolution: false, timeout: 8000 },
  autoembed: { name: "AutoEmbed", type: "embed", requiresBackendResolution: false, timeout: 8000 },
  vidsrcpm: { name: "VidSrc.pm", type: "embed", requiresBackendResolution: false, timeout: 7000 },
  vidsrc: { name: "VidSrc", type: "embed", requiresBackendResolution: false, timeout: 7000 },
  dynamic_hls: {
    name: "Dynamic HLS Resolver",
    type: "hls",
    requiresBackendResolution: true,
    timeout: 10000,
  },
  hotstar: {
    name: "Hotstar (IN)",
    type: "hls",
    requiresBackendResolution: true,
    timeout: 12000,
  },
};

export function isEmbedProvider(provider: StreamProvider): boolean {
  return PROVIDER_META[provider]?.type === "embed";
}

export function isHlsProvider(provider: StreamProvider): boolean {
  return PROVIDER_META[provider]?.type === "hls";
}

/** VidFast first — best uptime in current embed catalog. */
export const DEFAULT_STREAM_PROVIDER: StreamProvider = "vidfast";

export const STREAM_PROVIDERS: StreamProvider[] = [
  "vidfast",
  "vidlink",
  "superembed",
  "vidsrcpm",
  "vidsrc",
  "autoembed",
  "dynamic_hls",
  "hotstar",
];

export const PROVIDER_LABELS: Record<StreamProvider, string> = {
  vidfast: "VidFast",
  vidlink: "VidLink",
  superembed: "SuperEmbed",
  autoembed: "AutoEmbed",
  vidsrcpm: "VidSrc.pm",
  vidsrc: "VidSrc",
  dynamic_hls: "Dynamic HLS",
  hotstar: "Hotstar (IN)",
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
    default:
      return "";
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
    default:
      return "";
  }
}

export interface StreamSource {
  provider: StreamProvider;
  label: string;
  url: string;
}

export interface SourcesResponse {
  movieId: string;
  mediaId: string | null;
  type: "movie" | "tv";
  sources: StreamSource[];
}
