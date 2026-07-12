import { Router } from "express";
import { mobileApiRouter } from "../../mobile-api";

const router = Router();

// Re-use the existing mobile API router under /api/v1/mobile
router.use("/", mobileApiRouter);

export default router;
