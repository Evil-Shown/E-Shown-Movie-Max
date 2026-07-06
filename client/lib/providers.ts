export type StreamProvider = "vidsrc" | "vidlink" | "superembed" | "embedsu";

export const STREAM_PROVIDERS: StreamProvider[] = ["vidsrc", "vidlink", "superembed", "embedsu"];

export const PROVIDER_LABELS: Record<StreamProvider, string> = {
  vidsrc: "VidSrc",
  vidlink: "VidLink",
  superembed: "SuperEmbed",
  embedsu: "Embed.su",
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
  options?: { autoPlay?: boolean; seek?: number }
): string {
  const autoPlay = options?.autoPlay !== false;
  const seek = options?.seek;

  switch (provider) {
    case "vidsrc": {
      const path =
        type === "movie"
          ? `https://vsembed.ru/embed/movie/${mediaId}`
          : `https://vsembed.ru/embed/tv/${mediaId}/${season}/${episode}`;
      return appendQuery(path, {
        autoplay: autoPlay ? "1" : "0",
        seek: seek ? String(seek) : undefined,
        color: PLAYER_THEME.accent,
        poster: "0",
        title: "0",
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
      });
    }
    case "superembed": {
      if (type === "movie") {
        return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1`;
      }
      return `https://multiembed.mov/directstream.php?video_id=${mediaId}&tmdb=1&s=${season}&e=${episode}`;
    }
    case "embedsu": {
      if (type === "movie") {
        return `https://embed.su/embed/movie/${mediaId}`;
      }
      return `https://embed.su/embed/tv/${mediaId}/${season}/${episode}`;
    }
  }
}

export function nextProvider(current: StreamProvider): StreamProvider {
  const index = STREAM_PROVIDERS.indexOf(current);
  return STREAM_PROVIDERS[(index + 1) % STREAM_PROVIDERS.length];
}
