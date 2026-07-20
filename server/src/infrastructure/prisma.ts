import { PrismaClient } from "../../generated/prisma";
import { env } from "../config/env";
import { logger } from "../config/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Neon + PgBouncer optimized URL.
 *
 * When using Neon's PgBouncer endpoint (port 6543), set connection_limit=1
 * because PgBouncer handles connection multiplexing. This prevents 4 server
 * instances × 25 connections = 100 open connections exhausting Neon.
 *
 * For direct connections (non-PgBouncer), use a small pool per instance.
 */
function prismaDatasourceUrl(raw: string): string {
  try {
    const url = new URL(raw);
    const isPgBouncer = url.port === "6543" || url.searchParams.has("pgbouncer");

    if (isPgBouncer) {
      // PgBouncer handles multiplexing — each instance needs only 1 connection
      url.searchParams.set("pgbouncer", "true");
      url.searchParams.set("connection_limit", "1");
      url.searchParams.set("pool_timeout", "10");
    } else {
      // Direct connection: small pool per instance
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "5");
      }
      if (!url.searchParams.has("pool_timeout")) {
        url.searchParams.set("pool_timeout", "20");
      }
    }

    if (!url.searchParams.has("connect_timeout")) {
      url.searchParams.set("connect_timeout", "15");
    }

    return url.toString();
  } catch {
    return raw;
  }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: prismaDatasourceUrl(env.DATABASE_URL),
    log: env.NODE_ENV === "development" ? ["query", "info", "warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
  logger.info("Prisma disconnected");
}
