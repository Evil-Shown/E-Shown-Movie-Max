import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = path.dirname(fileURLToPath(import.meta.url));

const monorepoRoot = path.join(appRoot, "..");

const RENDER_API = "https://chithra-cinema-api.onrender.com";

function resolveBackendForRewrites(): string {
  const candidates = [
    process.env.BACKEND_API_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_GODS_EYE_API_URL,
    process.env.NEXT_PUBLIC_TBOOM_API_URL,
  ];

  for (const raw of candidates) {
    const url = (raw || "").trim().replace(/\/$/, "");
    if (!url) continue;
    // Never proxy to localhost/private IPs on Vercel (causes DNS_HOSTNAME_RESOLVED_PRIVATE)
    if (/localhost|127\.0\.0\.1|192\.168\.|10\.|172\.(1[6-9]|2\d|3[0-1])\./i.test(url)) {
      continue;
    }
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
  }

  return RENDER_API;
}

const backendApi = resolveBackendForRewrites();

const nextConfig: NextConfig = {
  transpilePackages: ["@chithra/core"],
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    optimizePackageImports: ["framer-motion", "@react-three/fiber", "@react-three/drei"],
  },
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
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendApi}/api/v1/:path*`,
      },
    ];
  },
  images: {
    // Enable AVIF + WebP for 50-70% smaller images vs JPEG/PNG
    formats: ["image/avif", "image/webp"],
    // Responsive breakpoints for optimal device targeting
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache optimized images for 7 days (Vercel CDN)
    minimumCacheTTL: 60 * 60 * 24 * 7,
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
