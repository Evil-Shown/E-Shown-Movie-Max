import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { logger } from "./config/logger";
import { corsOptions } from "./config/cors";

import { errorHandler } from "./middleware/error-handler";
import { redisRateLimit } from "./middleware/rate-limit";

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

import { prisma } from "./infrastructure/prisma";

const app = express();

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
app.use(cookieParser());

// Public health checks (no rate limiting)
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

const PORT = Number(env.PORT) || 5000;

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Graceful shutdown
async function shutdown(signal: string) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  await prisma.$disconnect();
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
