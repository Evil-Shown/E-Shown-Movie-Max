declare module "torrent-search-api" {
  export interface TorrentSearchItem {
    title?: string;
    name?: string;
    seeds?: number;
    seeders?: number;
    peers?: number;
    leechers?: number;
    size?: string;
    time?: string;
    uploaded?: string;
    magnet?: string;
    link?: string;
  }

  const TorrentSearchApi: {
    enableProvider(provider: string): void;
    search(query: string, category: string, limit: number): Promise<TorrentSearchItem[]>;
    getMagnet(item: TorrentSearchItem): Promise<string>;
  };

  export default TorrentSearchApi;
}
