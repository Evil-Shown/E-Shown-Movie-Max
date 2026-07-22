// Sentry initialization (must be before all other imports)
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || "development",
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
  profilesSampleRate: 0.1,
  integrations: [
    Sentry.expressIntegration(),
    Sentry.prismaIntegration(),
  ],
});

import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { corsOptions } from "./config/cors";
import { supabaseAdmin } from "./infrastructure/supabase";

import { errorHandler } from "./middleware/error-handler";
import { redisRateLimit } from "./middleware/rate-limit";
import { createProxySensitive } from "./middleware/proxy-sensitive";

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
import bffRoutes from "./domains/bff/bff.routes";

import { prisma } from "./infrastructure/prisma";

const app = express();

app.set("trust proxy", 1);
app.use(compression());

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

// Platform health check (no rate limiting)
app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", timestamp: new Date().toISOString() } });
});

app.use("/api/v1/health", healthRoutes);

// Global rate limiting for API routes
app.use("/api/v1", redisRateLimit);

if (env.RENDER_API_URL) {
  // ── Desktop proxy mode ─────────────────────────────────────────
  // Public routes handled locally (no secrets needed)
  app.use("/api/v1/search", searchRoutes);
  app.use("/api/v1/embed", embedRoutes);

  // Everything else → Render server (TMDB, auth, DB, etc.)
  app.use("/api/v1", createProxySensitive(env.RENDER_API_URL));
} else {
  // ── Normal mode — all routes ───────────────────────────────────
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
  app.use("/api/v1", bffRoutes);
}

// Legacy route redirects (301 permanent) — avoids double middleware execution
app.use("/api/auth", (_req, res) => { res.redirect(301, `/api/v1/auth${_req.url}`); });
app.use("/api/users", (_req, res) => { res.redirect(301, `/api/v1/users${_req.url}`); });
app.use("/api/watchlist", (_req, res) => { res.redirect(301, `/api/v1/watchlist${_req.url}`); });
app.use("/api/continue", (_req, res) => { res.redirect(301, `/api/v1/continue${_req.url}`); });
app.use("/api/episodes", (_req, res) => { res.redirect(301, `/api/v1/episodes${_req.url}`); });
app.use("/api/search", (_req, res) => { res.redirect(301, `/api/v1/search${_req.url}`); });
app.use("/api/embed", (_req, res) => { res.redirect(301, `/api/v1/embed${_req.url}`); });
app.use("/api/analytics", (_req, res) => { res.redirect(301, `/api/v1/analytics${_req.url}`); });
app.use("/api/telemetry", (_req, res) => { res.redirect(301, `/api/v1/telemetry${_req.url}`); });
app.use("/api/security", (_req, res) => { res.redirect(301, `/api/v1/security${_req.url}`); });
app.use("/api/mobile", (_req, res) => { res.redirect(301, `/api/v1/mobile${_req.url}`); });
app.use("/api/subscription", (_req, res) => { res.redirect(301, `/api/v1/subscription${_req.url}`); });
app.use("/api/tmdb", (_req, res) => { res.redirect(301, `/api/v1/tmdb${_req.url}`); });
app.get("/api/health", (_req, res) => {
  res.redirect(301, "/api/v1/health");
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

// Sentry error handler (must be before Express error handler)
Sentry.setupExpressErrorHandler(app);

// Global error handler
app.use(errorHandler);

async function main() {
  if (env.RENDER_API_URL) {
    // ── Desktop proxy mode — skip local DB/Supabase checks ──────
    logger.info("○ Desktop proxy mode — sensitive routes forward to Render");
    logger.info(`  Render API: ${env.RENDER_API_URL}`);
  } else {
    // ── Database connectivity check ──────────────────────────────
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

    // ── Supabase Auth check ──────────────────────────────────────
    const supabaseUrlOk = env.SUPABASE_URL?.startsWith("http");
    const supabaseKeyOk = env.SUPABASE_ANON_KEY?.length > 20;
    const supabaseSecretOk = env.SUPABASE_SERVICE_ROLE_KEY?.length > 20;
    if (supabaseUrlOk && supabaseKeyOk && supabaseSecretOk) {
      const { error: supabaseAdminError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });
      if (supabaseAdminError) {
        logger.error(
          { err: supabaseAdminError.message },
          "✘ Supabase service role key rejected — registration/login will fail"
        );
        logger.error(
          "  Fix server/.env: set SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY from Supabase Dashboard → Settings → API"
        );
        if (/unregistered api key/i.test(supabaseAdminError.message)) {
          logger.error(
            "  Use the project's active secret key (sb_secret_...) or legacy service_role JWT — deleted/rotated keys cause this error"
          );
        }
      } else {
        logger.info("✔ Supabase Auth configured");
      }
    } else {
      logger.warn("✘ Supabase Auth not fully configured — auth endpoints will fail");
    }

    // ── Redis check ──────────────────────────────────────────────
    if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
      logger.info("✔ Upstash Redis configured");
    } else {
      logger.warn("○ Upstash Redis not configured — using in-memory cache fallback");
    }
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
  if (!env.RENDER_API_URL) {
    await prisma.$disconnect();
  }
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Koyeb sends SIGTERM on stop; ensure clean exit
process.on("SIGQUIT", () => shutdown("SIGQUIT"));
