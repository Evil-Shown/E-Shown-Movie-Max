import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import {
  createCheckoutSession,
  handlePayHereWebhook,
  getSubscriptionStatus,
  cancelSubscription,
} from "./subscription.service";

const router = Router();

router.post("/create-checkout", authMiddleware, async (req, res) => {
  try {
    if (!req.user) throw new Error("Authentication required");
    const checkoutData = await createCheckoutSession(req.user.id);
    res.json({ success: true, data: checkoutData });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.get("/status", authMiddleware, async (req, res) => {
  try {
    if (!req.user) throw new Error("Authentication required");
    const status = await getSubscriptionStatus(req.user.id);
    res.json({ success: true, data: status });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/cancel", authMiddleware, async (req, res) => {
  try {
    if (!req.user) throw new Error("Authentication required");
    await cancelSubscription(req.user.id);
    res.json({ success: true, message: "Subscription cancelled" });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
});

router.post("/webhook", (req, res) => {
  handlePayHereWebhook(req.body)
    .then(() => res.status(200).send("OK"))
    .catch((err) => {
      console.error("Webhook error:", err);
      res.status(200).send("OK");
    });
});

export default router;
