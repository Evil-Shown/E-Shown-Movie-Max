import { Router } from "express";
import { authMiddleware, optionalAuthMiddleware } from "../../middleware/auth";
import { requireRole } from "../../middleware/require-role";
import * as controller from "./analytics.controller";

const router = Router();

router.use(optionalAuthMiddleware);

router.get("/summary", authMiddleware, requireRole("MODERATOR"), controller.summary);
router.post("/stream", controller.trackStream);
router.post("/download", controller.trackDownload);

export default router;
