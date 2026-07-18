import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import * as controller from "./telemetry.controller";

const router = Router();

router.post("/ping", controller.ping);
router.post("/heartbeat", controller.heartbeat);
router.get("/stats", authMiddleware, requireRole("ADMIN"), controller.stats);

export default router;
