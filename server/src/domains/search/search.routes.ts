import { Router } from "express";
import { redisRateLimit } from "../../middleware/rate-limit";
import * as controller from "./search.controller";

const router = Router();

router.get("/", redisRateLimit, controller.search);
router.get("/suggest", redisRateLimit, controller.suggest);
router.get("/trending", controller.trending);
router.get("/providers", controller.providers);
router.post("/resolve-magnet", redisRateLimit, controller.resolveMagnet);

export default router;
