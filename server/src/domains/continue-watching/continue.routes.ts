import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as controller from "./continue.controller";
import { upsertContinueSchema, removeContinueSchema } from "./continue.validator";

const router = Router();

router.get("/", authMiddleware, controller.getContinueWatching);
router.post("/", authMiddleware, validate(upsertContinueSchema), controller.upsertContinueWatching);
router.delete("/", authMiddleware, controller.clearContinueWatching);
router.delete("/:id", authMiddleware, validate(removeContinueSchema), controller.removeContinueWatching);

export default router;
