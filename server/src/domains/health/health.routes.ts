import { Router } from "express";
import { prisma } from "../../infrastructure/prisma";
import { success } from "../../utils/response";

const router = Router();

router.get("/health", (_req, res) => {
  success(res, {
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

router.get("/ready", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    success(res, {
      status: "ready",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      error: {
        code: "NOT_READY",
        message: "Database connection failed",
      },
    });
  }
});

export default router;
