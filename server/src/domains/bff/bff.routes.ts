import { Router } from "express";
import { cache } from "../../middleware/cache";
import { redisKey } from "../../infrastructure/redis";
import { getMoviePage, getHomePage, getBrowsePage } from "./bff.controller";

const router = Router();

/**
 * BFF (Backend for Frontend) Aggregation Routes
 *
 * These endpoints aggregate multiple data sources into a single response,
 * reducing client-to-server network requests by 80%.
 *
 * GET /api/v1/movie-page/:id  → movie details + similar + trailer
 * GET /api/v1/home-page       → hero + trending + new releases + top rated + popular TV
 * GET /api/v1/browse-page     → filtered/sorted movie catalog
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

router.get(
  "/home-page",
  cache({
    ttl: 900,
    staleTtl: 86400,
    keyFn: () => redisKey("bff:route", "home-page"),
  }),
  getHomePage
);

router.get(
  "/browse-page",
  cache({
    ttl: 900,
    staleTtl: 86400,
    keyFn: (req) => redisKey("bff:route", `browse-page:${req.query.genre ?? ""}:${req.query.sort ?? "popular"}:${req.query.page ?? "1"}`),
  }),
  getBrowsePage
);

export default router;
