import { logger } from "../config/logger";

export async function refreshTmdbCache(): Promise<void> {
  logger.info("Running refresh-tmdb-cache job");
  // TODO: Refresh popular TMDB entries in Redis cache.
}

if (require.main === module) {
  refreshTmdbCache().catch(logger.error);
}
