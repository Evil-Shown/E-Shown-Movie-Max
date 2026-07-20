import { Router, type Request, type Response } from "express";
import { authMiddleware } from "../../middleware/auth";
import { strictRateLimit } from "../../middleware/rate-limit";
import { validate } from "../../middleware/validate";
import { AppError } from "../../utils/response";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema, oauthSchema, forgotPasswordSchema, resetPasswordSchema } from "./auth.validator";
import { createPendingClaim, getPendingNonce, storeSession, claimSession } from "./oauth-relay";

const router = Router();

router.post("/register", strictRateLimit, validate(registerSchema), controller.register);
router.post("/login", strictRateLimit, validate(loginSchema), controller.login);
router.post("/oauth", strictRateLimit, validate(oauthSchema), controller.oauth);
router.post("/logout", authMiddleware, controller.logout);
router.post("/forgot-password", strictRateLimit, validate(forgotPasswordSchema), controller.forgotPassword);
router.post("/reset-password", strictRateLimit, validate(resetPasswordSchema), controller.resetPassword);
router.get("/me", authMiddleware, controller.me);

router.post("/create-claim", strictRateLimit, (_req: Request, res: Response) => {
  try {
    const { claimId, nonce } = createPendingClaim();
    res.json({ success: true, data: { claimId, nonce } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create claim";
    res.status(429).json({ success: false, error: { code: "TOO_MANY_CLAIMS", message } });
  }
});

router.post("/store-session", strictRateLimit, (req: Request, res: Response) => {
  const { accessToken, user, claimId } = req.body as {
    accessToken?: string;
    user?: Record<string, unknown>;
    claimId?: string;
  };

  if (!accessToken || !user || !claimId) {
    res
      .status(400)
      .json({ success: false, error: { code: "INVALID", message: "Missing accessToken, user, or claimId" } });
    return;
  }

  const nonce = getPendingNonce(claimId);
  if (!nonce) {
    res.status(403).json({ success: false, error: { code: "EXPIRED", message: "Claim expired or invalid" } });
    return;
  }

  try {
    storeSession({ accessToken, user }, nonce);
    res.json({ success: true });
  } catch {
    res.status(403).json({ success: false, error: { code: "INVALID_NONCE", message: "Nonce mismatch" } });
  }
});

router.post("/claim-session", strictRateLimit, (req: Request, res: Response) => {
  const { nonce } = req.body as { nonce?: string };
  if (!nonce) {
    res.status(400).json({ success: false, error: { code: "INVALID", message: "Missing nonce" } });
    return;
  }

  const session = claimSession(nonce);
  if (!session) {
    res.status(404).json({ success: false, error: { code: "NOT_FOUND", message: "No session available" } });
    return;
  }

  res.json({ success: true, data: session });
});

export default router;
