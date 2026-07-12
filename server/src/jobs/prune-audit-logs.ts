import { logger } from "../config/logger";

export async function pruneAuditLogs(): Promise<void> {
  logger.info("Running prune-audit-logs job");
  // TODO: Delete audit logs older than retention period (e.g., 1 year).
}

if (require.main === module) {
  pruneAuditLogs().catch(logger.error);
}
