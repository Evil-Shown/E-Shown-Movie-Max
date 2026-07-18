import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { corsOptions } from "./config/cors";

import { errorHandler } from "./middleware/error-handler";
import { redisRateLimit } from "./middleware/rate-limit";
import { platformMiddleware } from "./middleware/platform";

import healthRoutes from "./domains/health/health.routes";
import authRoutes from "./domains/auth/auth.routes";
import userRoutes from "./domains/user/user.routes";
import watchlistRoutes from "./domains/watchlist/watchlist.routes";
import continueRoutes from "./domains/continue-watching/continue.routes";
import episodesRoutes from "./domains/episodes/episodes.routes";
import searchRoutes from "./domains/search/search.routes";
import embedRoutes from "./domains/embed-proxy/embed.routes";
import analyticsRoutes from "./domains/analytics/analytics.routes";
import telemetryRoutes from "./domains/telemetry/telemetry.routes";
import securityRoutes from "./domains/security/security.routes";
import mobileRoutes from "./domains/mobile/mobile.routes";
import subscriptionRoutes from "./domains/subscription/subscription.routes";
import tmdbRoutes from "./domains/tmdb/tmdb.routes";
import omdbRoutes from "./domains/omdb/omdb.routes";
import wyzieRoutes from "./domains/wyzie/wyzie.routes";

import { prisma } from "./infrastructure/prisma";

const app = express();

// trust the first proxy (Render load balancer / reverse proxy)
// required for req.ip to return the real client IP instead of the proxy IP
app.set("trust proxy", 1);

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https:", "blob:"],
        styleSrc: ["'self'", "'unsafe-inline'", "https:"],
        imgSrc: ["'self'", "data:", "https:", "blob:"],
        fontSrc: ["'self'", "https:", "data:"],
        frameSrc: ["'self'", "https:"],
        connectSrc: ["'self'", "https:", "wss:"],
        mediaSrc: ["'self'", "https:", "blob:"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

app.use(cors(corsOptions));
app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(platformMiddleware);

// Platform health check (no rate limiting)
app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

app.use("/api/v1/health", healthRoutes);

// Global rate limiting for API routes
app.use("/api/v1", redisRateLimit);

// API v1 routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/watchlist", watchlistRoutes);
app.use("/api/v1/continue", continueRoutes);
app.use("/api/v1/episodes", episodesRoutes);
app.use("/api/v1/search", searchRoutes);
app.use("/api/v1/embed", embedRoutes);
app.use("/api/v1/analytics", analyticsRoutes);
app.use("/api/v1/telemetry", telemetryRoutes);
app.use("/api/v1/security", securityRoutes);
app.use("/api/v1/mobile", mobileRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);
app.use("/api/v1/tmdb", tmdbRoutes);
app.use("/api/v1/omdb", omdbRoutes);
app.use("/api/v1/subtitles", wyzieRoutes);

// Legacy route compatibility (redirect /api/* to /api/v1/*)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/watchlist", watchlistRoutes);
app.use("/api/continue", continueRoutes);
app.use("/api/episodes", episodesRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/embed", embedRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/security", securityRoutes);
app.use("/api/mobile", mobileRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/tmdb", tmdbRoutes);
app.use("/api/omdb", omdbRoutes);
app.use("/api/subtitles", wyzieRoutes);
app.get("/api/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok" } });
});

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: "NOT_FOUND",
      message: "Route not found",
    },
  });
});

// Global error handler
app.use(errorHandler);

async function main() {
  // ── Database connectivity check ──────────────────────────────────
  try {
    await prisma.$queryRaw`SELECT 1`;
    logger.info("✔ PostgreSQL database connected successfully");
    const versionResult = await prisma.$queryRaw`SELECT version() as version`;
    const dbVersion = Array.isArray(versionResult) ? (versionResult[0] as { version?: string })?.version : "unknown";
    if (dbVersion && dbVersion !== "unknown") {
      logger.info(`  Database: ${dbVersion}`);
    }
  } catch (dbError) {
    logger.error({ err: dbError }, "✘ Failed to connect to PostgreSQL database");
    logger.error("  Check your DATABASE_URL in server/.env");
    process.exit(1);
  }

  // ── Supabase Auth check ─────────────────────────────────────────
  const supabaseUrlOk = env.SUPABASE_URL?.startsWith("http");
  const supabaseKeyOk = env.SUPABASE_ANON_KEY?.length > 20;
  const supabaseSecretOk = env.SUPABASE_SERVICE_ROLE_KEY?.length > 20;
  if (supabaseUrlOk && supabaseKeyOk && supabaseSecretOk) {
    logger.info("✔ Supabase Auth configured");
  } else {
    logger.warn("✘ Supabase Auth not fully configured — auth endpoints will fail");
  }

  // ── Redis check ─────────────────────────────────────────────────
  if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
    logger.info("✔ Upstash Redis configured");
  } else {
    logger.warn("○ Upstash Redis not configured — using in-memory cache fallback");
  }

  // ── Start HTTP server ───────────────────────────────────────────
  const PORT = Number(env.PORT) || 5000;
  app.listen(PORT, () => {
    logger.info(`──────────────────────────────────────────`);
    logger.info(`  Server running on http://localhost:${PORT}`);
    logger.info(`  Environment: ${env.NODE_ENV}`);
    logger.info(`  API base:    http://localhost:${PORT}/api/v1`);
    logger.info(`──────────────────────────────────────────`);
  });
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Koyeb sends SIGTERM on stop; ensure clean exit
process.on("SIGQUIT", () => shutdown("SIGQUIT"));
