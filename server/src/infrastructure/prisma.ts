import { PrismaClient } from "../../generated/prisma";
import { env } from "../config/env";
import { logger } from "../config/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/** Neon-friendly URL: small pool + longer connect timeout for cold starts. */
function prismaDatasourceUrl(raw: string): string {
  try {
    const url = new URL(raw);
    if (!url.searchParams.has("connection_limit")) {
      url.searchParams.set("connection_limit", "5");
    }
    if (!url.searchParams.has("pool_timeout")) {
      url.searchParams.set("pool_timeout", "20");
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
