import { Router } from "express";
import { redisRateLimit } from "../../middleware/rate-limit";
import * as controller from "./omdb.controller";

const router = Router();

router.get("/search", redisRateLimit, controller.search);
router.get("/series", redisRateLimit, controller.searchSeries);
router.get("/by-imdb/:id", redisRateLimit, controller.byImdbId);
router.get("/by-title", redisRateLimit, controller.byTitle);

export default router;
