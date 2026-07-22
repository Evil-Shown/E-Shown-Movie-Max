# CHITHRA Cinema — Deployment & Infrastructure TODO

> **Status**: Code is ready. Infrastructure needs configuration.
> **Goal**: Handle 1000+ concurrent users with p95 < 500ms and < 1% error rate.

---

## 🔴 CRITICAL (Do Before Next Load Test)

### 1. Upgrade Render.com to Standard Tier ($25/mo)

**Why**: Free tier has 512MB RAM and sleeps after 15 min idle. At 500+ users, the server OOMs and crashes.

**Steps**:
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your `chithra-cinema-api` service
3. Click "Settings" → "Instance Type"
4. Change from "Free" to "Standard" ($25/mo, 2GB RAM, 1 CPU)
5. Click "Save Changes" → service will redeploy

**Impact**: Eliminates cold starts, doubles RAM, prevents OOM crashes.

---

### 2. Enable Horizontal Scaling (2 Instances)

**Why**: A single instance is a single point of failure. With 2 instances, if one crashes, the other absorbs traffic. Our code is stateless (Redis-backed), so it scales horizontally perfectly.

**Steps**:
1. In Render Dashboard → your service → "Settings"
2. Find "Instance Count" or "Autoscaling"
3. Set minimum instances to 2
4. Render will load-balance automatically

**Impact**: High availability + 2x throughput capacity.

---

### 3. Deploy the New Code to Render

**Why**: The BFF endpoints, circuit breakers, single-flight, and Sentry integration are in local code but NOT on the server.

**Steps**:
```bash
# Commit all changes
git add -A
git commit -m "feat: BFF aggregation, circuit breakers, single-flight, Sentry"

# Push to trigger Render deploy (if auto-deploy is enabled)
git push origin main

# OR manually deploy via Render Dashboard → "Manual Deploy"
```

**Impact**: Activates all the distributed systems patterns we built.

---

### 4. Set Environment Variables on Render

**Required env vars** (set in Render Dashboard → Environment):

| Variable | Value | Purpose |
|----------|-------|---------|
| `SENTRY_DSN` | Your Sentry DSN | Error tracking + performance tracing |
| `DATABASE_URL` | Neon PgBouncer URL (port 6543) | Connection multiplexing |

**Optional but recommended**:

| Variable | Value | Purpose |
|----------|-------|---------|
| `TMDB_API_KEY_WEB` | Valid TMDB key | API key rotation for web clients |
| `TMDB_API_KEY_DESKTOP` | Valid TMDB key | API key rotation for desktop |
| `TMDB_API_KEY_MOBILE` | Valid TMDB key | API key rotation for mobile |
| `UPSTASH_REDIS_REST_URL` | Your Upstash URL | Redis for distributed caching |
| `UPSTASH_REDIS_REST_TOKEN` | Your Upstash token | Redis auth |

---

### 5. Configure Neon PgBouncer

**Why**: Without PgBouncer, 4 server instances × 5 connections = 20 open DB connections. With PgBouncer, each instance uses 1 connection, and PgBouncer multiplexes queries.

**Steps**:
1. Go to [Neon Dashboard](https://console.neon.tech)
2. Select your project
3. Go to "Connection Details"
4. Copy the **Pooled Connection** URL (port 6543)
5. It should look like: `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?pgbouncer=true`
6. Update `DATABASE_URL` in Render to this URL

**Impact**: Prevents DB connection exhaustion under load.

---

### 6. Run Cache Pre-Warming After Deploy

**Why**: First users after deploy hit cold Redis cache and wait for TMDB API. Pre-warming keeps the cache hot.

**Steps**:
```bash
# After deploy completes, run locally:
node server/scripts/warm-cache.mjs

# Or set up a cron job (Vercel Cron, Render Cron, or external):
# Run every 2 hours: 0 */2 * * * node /path/to/warm-cache.mjs
```

**Impact**: 99% of users get <50ms responses (data already in Redis).

---

## 🟡 IMPORTANT (Do Within 1 Week)

### 7. Set Up Sentry (Observability)

**Why**: You can't fix what you can't see. Sentry shows exactly where latency occurs.

**Client Setup**:
```bash
cd client
npx @sentry/wizard@latest -i nextjs
# Follow the wizard — it auto-configures everything
```

**Server Setup**:
```bash
cd server
npm install @sentry/node
# Already done! Just set SENTRY_DSN env var on Render
```

**What you'll see in Sentry**:
- Waterfall charts: Request → Redis (5ms) → Prisma (20ms) → TMDB (400ms)
- p99 latency spikes with exact line numbers
- Error grouping and alerting
- Core Web Vitals (LCP, FID, CLS) from real users

---

### 8. Configure Upstash Redis Limits

**Why**: Free tier has ~256 commands/second limit. The single-flight polling mechanism might hit this under massive spikes.

**Steps**:
1. Go to [Upstash Dashboard](https://console.upstash.com)
2. Check your current command usage
3. If hitting limits, upgrade to "Pay As You Go" ($1/mo) — removes per-second limit
4. Verify you're using REST API (already configured via `@upstash/redis`)

---

### 9. Set Up Vercel Cron for Cache Warming

**Why**: Automated cache warming every 2 hours keeps Redis hot without manual intervention.

**Steps**:
1. Create `client/app/api/cron/warm-cache/route.ts`:
```typescript
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Hit BFF endpoints to warm cache
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
  const endpoints = [
    "/api/v1/home-page",
    "/api/v1/movie-page/27205",  // Inception
    "/api/v1/movie-page/157336", // Interstellar
    "/api/v1/movie-page/155",    // The Dark Knight
  ];

  const results = await Promise.allSettled(
    endpoints.map((path) =>
      fetch(`${baseUrl}${path}`, { cache: "no-store" }).then((r) => ({
        path,
        status: r.status,
        cache: r.headers.get("x-cache"),
      }))
    )
  );

  return NextResponse.json({
    success: true,
    warmed: results.filter((r) => r.status === "fulfilled").length,
    timestamp: new Date().toISOString(),
  });
}
```

2. Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/warm-cache",
      "schedule": "0 */2 * * *"
    }
  ]
}
```

3. Set `CRON_SECRET` env var in Vercel dashboard.

---

## 🟢 NICE TO HAVE (Do When Ready)

### 10. Add Cloudflare CDN in Front of Vercel

**Why**: Extra DDoS protection, WAF, and global edge caching.

**Steps**:
1. Add your domain to Cloudflare
2. Update nameservers to Cloudflare's
3. Enable "Caching" → "Standard" caching level
4. Enable "Speed" → "Auto Minify" for JS/CSS/HTML
5. Enable "Brotli" compression

---

### 11. Enable Neon Read Replicas

**Why**: Route all read queries (GET) to a replica, write queries (POST/PATCH) to primary. Reduces primary DB load.

**Steps**:
1. In Neon Dashboard → your project → "Read Replicas"
2. Create a read replica
3. Update Prisma to use two clients:
   - `prismaRead` → connects to replica URL
   - `prismaWrite` → connects to primary URL
4. Route GET endpoints to `prismaRead`, POST/PATCH to `prismaWrite`

---

### 12. Install fast-json-stringify (If CPU Pinning)

**Why**: BFF endpoints aggregate large TMDB payloads. Node.js parsing huge JSON 1000x concurrently can block the event loop.

**When**: Only if load test shows CPU at 100%.

**Steps**:
```bash
cd server
npm install fast-json-stringify
```

Pre-compile BFF response schemas for 3x faster serialization.

---

## 📋 Load Test Checklist

Run this after completing steps 1-6:

```bash
# 1. Verify server is healthy
curl https://chithra-cinema-api.onrender.com/health

# 2. Warm the cache
node server/scripts/warm-cache.mjs

# 3. Run load test
k6 run scripts/load-test.js

# 4. Check results
# Target: p95 < 500ms, errors < 1%
```

---

## 📊 Expected Results After All Steps

| Metric | Before (Free Tier) | After (Standard + BFF) |
|--------|-------------------|----------------------|
| p95 latency | 1.1s | **< 500ms** |
| p99 latency | 2.2s | **< 1s** |
| Error rate | 87% | **< 1%** |
| TMDB calls/min | ~10,000 | **~1,000** (90% reduction) |
| Concurrent users | ~100 before crash | **1000+** |
| Cold start time | 30-60s | **0s** (always-on) |

---

## 🚨 Monitoring After Go-Live

1. **Sentry Dashboard**: Check daily for errors and slow transactions
2. **Render Metrics**: Monitor CPU, RAM, and request count
3. **Upstash Dashboard**: Watch Redis command usage and hit rate
4. **Neon Dashboard**: Monitor connection count and query latency
5. **k6 Re-run**: Load test weekly to catch regressions

---

*Last updated: 2026-07-20*
