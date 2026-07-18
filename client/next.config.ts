import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const monorepoRoot = path.join(appRoot, "..");

const backendApi = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://chithra-cinema-api.onrender.com"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  transpilePackages: ["@chithra/core"],
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/fiber", "@react-three/drei"],
  },
  // Prevent native torrent deps from entering the server/client SSR graph if referenced elsewhere.
  serverExternalPackages: ["webtorrent", "node-datachannel", "puppeteer"],
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
  async rewrites() {
    // Browser calls same-origin /api/v1/*; Vercel proxies to Render (avoids localhost + CORS).
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApi}/api/v1/:path*`,
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
      {
        protocol: "https",
        hostname: "icon.brandfetch.io",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "logo.clearbit.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "icons.duckduckgo.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
