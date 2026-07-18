import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../../middleware/auth";
import { AppError } from "../../utils/response";
import { logger } from "../../config/logger";
import {
  createCheckoutSession,
  handlePayHereWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} from "./subscription.service";

const router = Router();

router.post("/create-checkout", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const checkoutData = await createCheckoutSession(req.user.id);
    res.json({ success: true, data: checkoutData });
  } catch (error: any) {
    next(error);
  }
});

router.get("/status", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    const status = await getSubscriptionStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error: any) {
    next(error);
  }
});

router.post("/cancel", authMiddleware, async (req, res, next) => {
  try {
    if (!req.user) throw new AppError(401, "UNAUTHORIZED", "Authentication required");
    await cancelSubscription(req.user.id);
    res.json({ success: true, message: "Subscription cancelled" });
  } catch (error: any) {
    next(error);
  }
});

router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const result = await handlePayHereWebhook(req.body);
    res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown webhook error";
    logger.error({ err }, "Webhook processing failed");
    res.status(400).send(`Webhook error: ${message}`);
  }
});

export default router;
