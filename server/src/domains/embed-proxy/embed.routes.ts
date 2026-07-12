import { Router } from "express";
import { redisRateLimit } from "../../middleware/rate-limit";
import * as controller from "./embed.controller";

const router = Router();

router.options("/proxy", (_req, res) => {
  res.set({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Max-Age": "86400",
  });
  res.status(204).end();
});

router.get("/proxy", redisRateLimit, controller.proxy);

export default router;
