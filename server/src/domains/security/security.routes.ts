import { Router } from "express";
import { redisRateLimit } from "../../middleware/rate-limit";
import * as controller from "./security.controller";

const router = Router();

router.get("/virustotal/report", redisRateLimit, controller.virusTotalReport);

export default router;
