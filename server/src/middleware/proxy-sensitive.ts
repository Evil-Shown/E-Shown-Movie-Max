import type { Request, Response, NextFunction } from "express";
import { logger } from "../config/logger";

const FORWARD_HEADERS = [
  "accept",
  "accept-encoding",
  "accept-language",
  "authorization",
  "content-type",
  "x-platform",
  "x-admin-secret",
  "cookie",
  "range",
];

const SKIP_HEADERS = new Set([
  "host",
  "connection",
  "transfer-encoding",
  "keep-alive",
  "proxy-connection",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "upgrade",
]);

export function createProxySensitive(renderApiUrl: string) {
  const renderOrigin = new URL(renderApiUrl).origin;

  return async function proxySensitive(req: Request, res: Response, _next: NextFunction): Promise<void> {
    const targetUrl = `${renderApiUrl}${req.originalUrl}`;

    try {
      const headers: Record<string, string> = {};
      for (const key of FORWARD_HEADERS) {
        const value = req.headers[key];
        if (value) {
          headers[key] = Array.isArray(value) ? value.join(", ") : value;
        }
      }
      headers["host"] = new URL(renderOrigin).host;
      headers["x-forwarded-for"] = req.ip || req.socket?.remoteAddress || "unknown";
      headers["x-proxy-source"] = "chithra-desktop";

      const hasBody = req.method !== "GET" && req.method !== "HEAD" && req.method !== "OPTIONS";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30_000);

      const fetchResponse = await fetch(targetUrl, {
        method: req.method,
        headers,
        body: hasBody ? JSON.stringify(req.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeout);

      res.status(fetchResponse.status);

      fetchResponse.headers.forEach((value, key) => {
        if (!SKIP_HEADERS.has(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });

      res.setHeader("x-proxy-source", "chithra-desktop");

      if (fetchResponse.body) {
        const reader = fetchResponse.body.getReader();
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(value);
          }
        } finally {
          reader.releaseLock();
        }
      }

      res.end();
    } catch (err: unknown) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      const message = isAbort ? "Render server timed out" : "Failed to reach Render server";

      logger.warn({ err, targetUrl }, `Proxy error: ${message}`);

      if (!res.headersSent) {
        res.status(502).json({
          success: false,
          error: {
            code: "PROXY_ERROR",
            message: `${message} — the server may be waking up, please retry in a moment`,
          },
        });
      } else {
        res.end();
      }
    }
  };
}
