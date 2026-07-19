import { Router } from "express";
import { cache } from "../../middleware/cache";
import { redisKey } from "../../infrastructure/redis";
import { getMoviePage } from "./bff.controller";

const router = Router();

/**
 * BFF (Backend for Frontend) Aggregation Routes
 *
 * These endpoints aggregate multiple data sources into a single response,
 * reducing client-to-server network requests by 80%.
 *
 * GET /api/v1/movie-page/:id  → movie details + similar + trailer
 */
router.get(
  "/movie-page/:id",
  cache({
    ttl: 900,       // 15 min fresh
    staleTtl: 86400, // 24h stale-while-revalidate
    keyFn: (req) => redisKey("bff:route", `movie-page:${req.params.id}`),
  }),
  getMoviePage
);

export default router;
