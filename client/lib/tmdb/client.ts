import { configureTmdbBaseUrl, configureTmdbCache } from "@chithra/core/tmdb";
import { cacheJson } from "@/lib/cache/request-cache";

configureTmdbCache(cacheJson);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";
configureTmdbBaseUrl(`${API_BASE}/api/v1/tmdb`);

export * from "@chithra/core/tmdb/client";
