import { Router } from "express";
import * as controller from "./telemetry.controller";

const router = Router();

router.post("/ping", controller.ping);
router.post("/heartbeat", controller.heartbeat);
router.get("/stats", controller.stats);

export default router;
