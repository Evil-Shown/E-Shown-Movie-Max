import type { Request, Response, NextFunction } from "express";

const VALID_PLATFORMS = new Set(["web", "desktop", "mobile"]);

export function platformMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers["x-platform"];
  if (typeof header === "string" && VALID_PLATFORMS.has(header)) {
    req.platform = header as "web" | "desktop" | "mobile";
  } else {
    req.platform = undefined;
  }
  next();
}
