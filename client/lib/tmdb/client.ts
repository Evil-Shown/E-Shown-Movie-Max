import { configureTmdbBaseUrl, configureTmdbCache } from "@chithra/core/tmdb";
import { cacheJson } from "@/lib/cache/request-cache";
import { resolveApiBase } from "@/lib/api-base";

configureTmdbCache(cacheJson);

const API_BASE = resolveApiBase() || "https://chithra-cinema-api.onrender.com";
configureTmdbBaseUrl(`${API_BASE}/api/v1/tmdb`);

export * from "@chithra/core/tmdb/client";
