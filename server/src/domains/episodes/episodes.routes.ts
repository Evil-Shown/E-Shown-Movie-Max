import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as controller from "./episodes.controller";
import { getEpisodesSchema, markEpisodeSchema } from "./episodes.validator";

const router = Router();

router.get("/", authMiddleware, validate(getEpisodesSchema), controller.getWatchedEpisodes);
router.post("/mark-watched", authMiddleware, validate(markEpisodeSchema), controller.markEpisodeWatched);
router.post("/unmark-watched", authMiddleware, validate(markEpisodeSchema), controller.unmarkEpisodeWatched);

export default router;
