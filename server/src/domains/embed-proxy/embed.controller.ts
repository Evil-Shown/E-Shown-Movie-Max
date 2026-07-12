import type { Request, Response, NextFunction } from "express";
import { logger } from "../../config/logger";
import { AppError } from "../../utils/response";
import {
  addCorsHeaders,
  getEmbedProxyErrorStatus,
  isAllowedEmbedUrl,
  proxyEmbedUrl,
  stripFrameBlockingHeaders,
} from "../../embed-proxy";

export async function proxy(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetUrl = String(req.query.url || "").trim();
    if (!targetUrl) {
      throw new AppError(400, "MISSING_URL", "Missing 'url' query parameter.");
    }

    if (!isAllowedEmbedUrl(targetUrl)) {
      throw new AppError(400, "URL_NOT_ALLOWED", "Embed URL host is not allowed.");
    }

    const proxied = await proxyEmbedUrl(targetUrl);
    const outgoing = stripFrameBlockingHeaders({
      "Content-Type": proxied.contentType,
      "Cache-Control": proxied.fromCache ? "public, max-age=300" : "public, max-age=120",
      "X-Embed-Proxy-Cache": proxied.fromCache ? "HIT" : "MISS",
    });

    res.set(addCorsHeaders(outgoing));
    if (Buffer.isBuffer(proxied.body)) {
      res.send(proxied.body);
      return;
    }
    res.send(proxied.body);
  } catch (error) {
    const statusCode = getEmbedProxyErrorStatus(error);
    const message = error instanceof Error ? error.message : "Unknown embed proxy error";
    logger.error({ error, message }, "Embed proxy error");
    res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502).json({
      success: false,
      error: {
        code: "EMBED_PROXY_ERROR",
        message: "Unable to load embed content right now. Try another provider.",
      },
    });
  }
}
