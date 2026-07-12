import { logger } from "../config/logger";

export async function cleanupExpiredSessions(): Promise<void> {
  logger.info("Running cleanup-expired-sessions job");
  // TODO: Implement session cleanup when custom session tracking is added.
  // For now, Supabase Auth owns refresh token lifecycle.
}

if (require.main === module) {
  cleanupExpiredSessions().catch(logger.error);
}
