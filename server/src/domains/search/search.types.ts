export type TorrentRecord = {
  name: string;
  seeders: number;
  leechers: number;
  size?: string;
  uploaded?: string;
  magnet?: string;
  link?: string;
  _providers: string[];
  _providerHint?: string;
  _score?: number;
  _indexedAt?: number;
};

export type IndexedTorrent = TorrentRecord & {
  _indexedAt: number;
};

export type SearchMeta = {
  providersUsed: string[];
  providersFailed: string[];
  degraded: boolean;
};

export type SearchPayload = {
  results: TorrentRecord[];
  meta: SearchMeta;
};

export type ProviderResult = {
  provider: string;
  items: TorrentRecord[];
};
