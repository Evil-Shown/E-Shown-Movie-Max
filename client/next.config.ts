import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent native torrent deps from entering the server/client SSR graph if referenced elsewhere.
  serverExternalPackages: ["webtorrent", "node-datachannel"],
  async redirects() {
    return [
      {
        source: "/t-boom",
        destination: "/gods-eye",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
        pathname: "/images/**",
      },
      {
        protocol: "https",
        hostname: "img.omdbapi.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
