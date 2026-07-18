import { Router } from "express";
import { redisRateLimit } from "../../middleware/rate-limit";
import * as controller from "./wyzie.controller";

const router = Router();

router.get("/search", redisRateLimit, controller.search);

export default router;
