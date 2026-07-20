import { Router } from "express";
import { cache } from "../../middleware/cache";
import { redisRateLimit } from "../../middleware/rate-limit";
import { redisKey } from "../../infrastructure/redis";
import * as controller from "./tmdb.controller";

const router = Router();

router.use(
  redisRateLimit,
  cache({
    ttl: 300,
    staleTtl: 3600,
    keyFn: (req) => redisKey("tmdb", req.originalUrl),
  }),
  controller.proxy
);

export default router;
