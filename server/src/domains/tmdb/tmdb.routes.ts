import { Router } from "express";
import { redisRateLimit } from "../../middleware/rate-limit";
import * as controller from "./tmdb.controller";

const router = Router();

router.get("/*", redisRateLimit, controller.proxy);

export default router;
