import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: appRoot,
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/fiber", "@react-three/drei"],
  },
  // Prevent native torrent deps from entering the server/client SSR graph if referenced elsewhere.
  serverExternalPackages: ["webtorrent", "node-datachannel"],
  async redirects() {
    return [
      {
        source: "/t-boom",
        destination: "/gods-eye",
        permanent: true,
      },
      {
        source: "/LiveTV",
        destination: "/live-tv",
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
      {
        protocol: "https",
        hostname: "i.imgur.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.google.com",
        pathname: "/s2/favicons/**",
      },
      {
        protocol: "https",
        hostname: "img.logo.dev",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
