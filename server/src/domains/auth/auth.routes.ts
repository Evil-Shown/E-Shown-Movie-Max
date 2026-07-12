import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema, oauthSchema } from "./auth.validator";
import { storeSession, claimSession } from "./oauth-relay";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/oauth", validate(oauthSchema), controller.oauth);
router.post("/logout", authMiddleware, controller.logout);
router.get("/me", authMiddleware, controller.me);

// OAuth session relay (system browser → Electron app)
router.post("/store-session", (req, res) => {
  const { accessToken, user } = req.body;
  if (!accessToken || !user) {
    res.status(400).json({ success: false, error: { code: "INVALID", message: "Missing accessToken or user" } });
    return;
  }
  storeSession({ accessToken, user });
  res.json({ success: true });
});

router.get("/claim-session", (_req, res) => {
  const session = claimSession();
  res.json({ success: true, data: session });
});

export default router;
