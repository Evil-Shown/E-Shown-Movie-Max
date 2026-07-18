import type { User } from "../../generated/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
      sessionId?: string;
      platform?: "web" | "desktop" | "mobile";
    }
  }
}

export {};
