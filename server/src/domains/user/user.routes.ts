import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as controller from "./user.controller";
import { updatePreferencesSchema, updateProfileSchema } from "./user.validator";
import { z } from "zod";

const router = Router();

const updateAvatarSchema = z.object({
  body: z.object({
    avatarUrl: z.string().min(1),
  }),
});

router.get("/profile", authMiddleware, controller.getProfile);
router.patch("/profile", authMiddleware, validate(updateProfileSchema), controller.updateProfile);
router.patch("/avatar", authMiddleware, validate(updateAvatarSchema), controller.updateAvatar);
router.patch("/preferences", authMiddleware, validate(updatePreferencesSchema), controller.updatePreferences);

export default router;
