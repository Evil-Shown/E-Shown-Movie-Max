import { Router } from "express";
import { optionalAuthMiddleware } from "../../middleware/auth";
import * as controller from "./analytics.controller";

const router = Router();

router.use(optionalAuthMiddleware);

router.get("/summary", controller.summary);
router.post("/stream", controller.trackStream);
router.post("/download", controller.trackDownload);

export default router;
