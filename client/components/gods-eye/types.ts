export type TorrentResult = {
  name?: string;
  seeders?: number | string;
  leechers?: number | string;
  magnet?: string;
  size?: string;
  uploaded?: string;
  _providers?: string[];
  _providerHint?: string;
  link?: string;
};

export type ParsedTitle = {
  cleanTitle: string;
  year: string | null;
  quality: string | null;
  source: string | null;
  codec: string | null;
  language: string | null;
  group?: string | null;
};

export type ParsedOperatorQuery = {
  baseQuery: string;
  operators: {
    year?: string;
    quality?: string;
    language?: string;
    type?: "movie" | "tv" | "anime";
    size?: { op: "<" | ">" | "<=" | ">="; valueGb: number };
  };
};

export type EnrichedTorrent = TorrentResult & {
  parsed: ParsedTitle;
  seedersNumber: number;
  leechersNumber: number;
  health: string;
  readiness: string;
};

export type GroupedTorrentResult = {
  key: string;
  title: string;
  year: string | null;
  uploads: EnrichedTorrent[];
  qualityCounts: Record<string, number>;
  bestSeeders: number;
};

export type SearchApiResponse = {
  results: TorrentResult[];
  meta?: {
    providersUsed?: string[];
    providersFailed?: string[];
  };
};

export type ContinueWatching = {
  magnetURI: string;
  title: string;
  timestamp: number;
  poster?: string | null;
};

export type ActionMessage = {
  type: "info" | "success" | "warning";
  text: string;
};

export type TorrentNotice = {
  title: string;
  message: string;
  tips: string[];
};

export type DownloadState = {
  status: "idle" | "connecting" | "downloading" | "finalizing" | "done" | "failed" | "cancelled";
  title: string;
  message: string;
  progress: number;
  peers: number;
  speedMbps: number;
};

export type WebTorrentLikeCtor = new () => {
  add: (
    magnetUri: string,
    callback: (torrent: {
      infoHash?: string;
      numPeers?: number;
      progress?: number;
      downloadSpeed?: number;
      on?: (event: string, cb: () => void) => void;
      files: Array<{
        name: string;
        renderTo: (video: HTMLVideoElement, cb: (error: Error | null) => void) => void;
        getBlobURL?: (cb: (error: Error | null, url: string) => void) => void;
      }>;
    }) => void
  ) => void;
  destroy: () => Promise<void> | void;
};

declare global {
  interface Window {
    WebTorrent?: WebTorrentLikeCtor;
  }
}
