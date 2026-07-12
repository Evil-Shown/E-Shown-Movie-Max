import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import * as controller from "./auth.controller";
import { loginSchema, registerSchema } from "./auth.validator";

const router = Router();

router.post("/register", validate(registerSchema), controller.register);
router.post("/login", validate(loginSchema), controller.login);
router.post("/logout", controller.logout);
router.get("/me", authMiddleware, controller.me);

export default router;
