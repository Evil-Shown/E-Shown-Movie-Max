import { configureTmdbCache } from "@chithra/core/tmdb";
import { cacheJson } from "@/lib/cache/request-cache";

configureTmdbCache(cacheJson);

export * from "@chithra/core/tmdb/client";
