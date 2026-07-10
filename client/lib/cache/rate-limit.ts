import { cacheIncr, redisKey } from "@/lib/cache/redis";

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Sliding-window counter backed by Redis (or in-memory fallback when unconfigured). */
export async function checkRateLimit(
  request: Request,
  bucket: string,
  maxRequests: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  const ip = getClientIp(request);
  const key = redisKey("ratelimit", bucket, ip);
  const count = await cacheIncr(key, windowSeconds);

  if (count > maxRequests) {
    return { allowed: false, retryAfterSeconds: windowSeconds };
  }

  return { allowed: true };
}

export function rateLimitResponse(retryAfterSeconds: number): Response {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please try again shortly." }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSeconds),
      },
    }
  );
}

export async function enforceRateLimit(
  request: Request,
  bucket: string,
  maxRequests: number,
  windowSeconds: number
): Promise<Response | null> {
  const result = await checkRateLimit(request, bucket, maxRequests, windowSeconds);
  if (!result.allowed) {
    return rateLimitResponse(result.retryAfterSeconds ?? windowSeconds);
  }
  return null;
}
