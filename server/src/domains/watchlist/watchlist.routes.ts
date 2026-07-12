import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as controller from "./watchlist.controller";
import { addWatchlistSchema, removeWatchlistSchema } from "./watchlist.validator";

const router = Router();

router.get("/", authMiddleware, controller.getWatchlist);
router.post("/", authMiddleware, validate(addWatchlistSchema), controller.addToWatchlist);
router.delete("/:id", authMiddleware, validate(removeWatchlistSchema), controller.removeFromWatchlist);

export default router;
