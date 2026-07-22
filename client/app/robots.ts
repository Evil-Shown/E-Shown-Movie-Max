import type { MetadataRoute } from "next";
import { DEFAULT_PRODUCTION_APP } from "@/lib/app-origin";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || DEFAULT_PRODUCTION_APP;

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/browse", "/search", "/anime", "/live-tv", "/movie/"],
        disallow: [
          "/api/",
          "/dashboard",
          "/settings",
          "/notifications",
          "/watchlist",
          "/auth/",
          "/login",
          "/register",
          "/gods-eye",
          "/t-boom",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
