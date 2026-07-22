# CHITHRA — CINEMA API

Express 5 backend for **CHITHRA — CINEMA** (චිත්‍ර — Cinema) — torrent search, embed proxy, auth, mobile API, and database.

> **Production:** `https://chithra-cinema-api.onrender.com` (Koyeb)  
> **Health:** `GET /api/v1/health`

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Architecture](#architecture)
3. [Dual Mode](#dual-mode)
4. [Full API Reference](#full-api-reference)
5. [Domain Architecture](#domain-architecture)
6. [Database Schema](#database-schema)
7. [Middleware Stack](#middleware-stack)
8. [Background Jobs](#background-jobs)
9. [Docker Development](#docker-development)
10. [Deployment](#deployment)
11. [Environment Variables](#environment-variables)
12. [Scripts](#scripts)
13. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22 | Runtime |
| Express | 5.2.1 | HTTP framework |
| TypeScript | 5.9 | Type safety |
| Prisma | 5.x | ORM, migrations, client generation |
| PostgreSQL | 16 | Primary database |
| Redis (Upstash) | — | Caching, rate limiting, session state |
| Supabase | — | Auth (email/password, OAuth: Google/GitHub) |
| Pino | 10.x | Structured JSON logging |
| Pino-Pretty | 13.x | Dev log formatting |
| Helmet | 7.x | Security headers (CSP, HSTS, X-Frame-Options) |
| Zod | 4.x | Request validation schemas |
| axios | 1.x | HTTP client for external APIs |
| compression | 1.x | Gzip/brotli response compression |
| cookie-parser | 1.x | Cookie parsing middleware |
| cors | 2.x | Cross-origin resource sharing |
| express-rate-limit | 8.x | Rate limiting middleware |
| torrent-search-api | 2.x | Multi-provider torrent aggregation |
| ws | 8.x | WebSocket support |
| @prisma/client | 5.x | Database client |
| @sentry/node | 10.x | Error tracking + performance |
| @supabase/supabase-js | 2.x | Supabase Auth admin client |
| tsx | 4.x | TypeScript execution + watch |
| pg | 8.x | PostgreSQL driver |

---

## Architecture

### High-Level Design

```
Incoming Request
  │
  ▼
Sentry (error tracking)
  │
  ▼
Helmet (security headers)
  │
  ▼
CORS (origin validation)
  │
  ▼
Compression (gzip/brotli)
  │
  ▼
Cookie Parser
  │
  ▼
Global Rate Limiter (Redis-backed)
  │
  ▼
──┴── Route Matcher ──────────────────────────────────────────────
│                                                                │
│  Normal Mode (RENDER_API_URL not set)                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  All routes mounted locally:                             │  │
│  │  /api/v1/auth        → Supabase Auth + OAuth relay       │  │
│  │  /api/v1/users       → Profile & preferences             │  │
│  │  /api/v1/watchlist   → Watchlist CRUD                     │  │
│  │  /api/v1/continue    → Continue-watching progress         │  │
│  │  /api/v1/episodes    → Episode tracking                   │  │
│  │  /api/v1/search      → Torrent + TMDB + OMDB search       │  │
│  │  /api/v1/embed       → Embed proxy (ad stripping)         │  │
│  │  /api/v1/analytics   → Event tracking                      │  │
│  │  /api/v1/telemetry   → Admin telemetry                     │  │
│  │  /api/v1/security    → VirusTotal lookups                  │  │
│  │  /api/v1/subscription→ PayHere payments                    │  │
│  │  /api/v1/mobile      → Mobile-optimized TMDB proxy         │  │
│  │  /api/v1/tmdb        → Generic TMDB proxy (cached)         │  │
│  │  /api/v1/bff         → Aggregated BFF endpoints            │  │
│  │  /api/v1/omdb        → OMDB proxy                          │  │
│  │  /api/v1/health      → Health check                         │  │
│  │  Legacy /api/* 301s  → Redirect to /api/v1/*               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
│  Desktop Proxy Mode (RENDER_API_URL set)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Local routes: /api/v1/search, /api/v1/embed             │  │
│  │  Proxied to Render: everything else (auth, DB, TMDB...)  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
  │
  ▼
Error Handler (maps AppError → JSON, sends to Sentry)
```

### Dependency Graph

```
Controller Layer
  └── Service Layer (business logic)
        ├── Repository Layer (Prisma DB access)
        ├── Infrastructure (Supabase, Redis, Sentry)
        └── External APIs (TMDB, OMDB, VirusTotal, PayHere)
```

---

## Dual Mode

The server runs in two modes controlled by the `RENDER_API_URL` environment variable:

### Normal Mode (Full API)

`RENDER_API_URL` is **not set**.

All routes are mounted locally with full database access. Used in:
- Local development
- Koyeb production deployment (Docker)
- Any environment with direct DB + API key access

### Desktop Proxy Mode

`RENDER_API_URL` is **set** to a remote server URL (e.g. `https://chithra-cinema-api.onrender.com`).

Only two route groups are handled locally (no secrets needed):
- **Search** (`/api/v1/search`) — Torrent search and magnet resolution
- **Embed proxy** (`/api/v1/embed`) — Ad-stripping embed HTML proxy

All other requests are proxied to the remote server (auth, TMDB, DB operations, etc.).

Used by the Electron desktop app to:
- Avoid shipping API keys in the desktop binary
- Keep search and embed low-latency (local)
- Delegate auth, TMDB, and DB to the cloud

---

## Full API Reference

### Health (`/api/v1/health`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Basic health check — `{ status: "ok", uptime, timestamp }` |
| GET | `/health` | Detailed health — includes DB connectivity check |
| GET | `/ready` | Readiness probe — checks DB before returning 200 |

### Authentication (`/api/v1/auth`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/register` | `{ email, password, username }` | Register via Supabase Auth. Creates User + UserSettings in DB. |
| POST | `/login` | `{ email, password }` | Login via Supabase Auth. Returns session token. |
| POST | `/oauth` | `{ provider, accessToken }` | Google/GitHub OAuth login. Upserts user in DB. |
| POST | `/logout` | — | Invalidate current session (requires auth). |
| POST | `/forgot-password` | `{ email }` | Send password reset email via Supabase. |
| POST | `/reset-password` | `{ password, accessToken }` | Complete password reset. |
| GET | `/session` | — | Get current user session (requires auth). |
| POST | `/claim-relay` | `{ nonce }` | Desktop OAuth claim relay. Used by Electron to bridge system browser auth. |

### Users (`/api/v1/users`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/profile` | — | Get authenticated user's profile (requires auth). |
| PATCH | `/profile` | `{ displayName?, bio?, ... }` | Update profile fields (requires auth). |
| PATCH | `/avatar` | `{ iconId }` | Update profile icon (requires auth). |
| GET | `/preferences` | — | Get user settings (requires auth). |
| PATCH | `/preferences` | `{ language?, autoplay?, preferredProvider?, subtitleLang?, quality?, notifications?, theme? }` | Update user preferences (requires auth). All fields optional. |

### Watchlist (`/api/v1/watchlist`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/` | — | List all watchlist items for auth'd user. |
| POST | `/` | `{ tmdbId, mediaType, title, posterPath?, year?, rating?, genres? }` | Add item to watchlist. |
| DELETE | `/:tmdbId` | — | Remove item from watchlist. |

### Continue Watching (`/api/v1/continue`)

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/` | — | List all in-progress items for auth'd user. |
| POST | `/` | `{ tmdbId, mediaType, title, posterPath?, season?, episode?, currentTime, duration, provider? }` | Upsert playback progress. Calculates `progress` as `currentTime / duration`. |
| DELETE | `/` | — | Clear all continue-watching items. |
| DELETE | `/:tmdbId` | — | Remove specific item. |

### Episodes (`/api/v1/episodes`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/watched` | `{ tvdbId, season, episode }` | Mark episode as watched. |
| DELETE | `/watched` | `{ tvdbId, season, episode }` | Unmark episode. |
| GET | `/watched` | — | List all watched episodes for auth'd user. |

### Search (`/api/v1/search`)

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/` | `q, page?, type?` | Multi-source search: TMDB, OMDB, Wyzie subtitles. |
| GET | `/suggest` | `q` | Instant search suggestions (returns top 5). |
| GET | `/trending` | — | Current trending torrents across providers. |
| GET | `/providers` | — | List available torrent providers. |
| GET | `/resolve-magnet` | `magnet` | Convert magnet link to streamable URL. |

### Embed Proxy (`/api/v1/embed`)

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/proxy` | `url, ref?` | Fetch embed HTML, strip ads, inject anti-popup guard, return sanitized HTML. |
| GET | `/passthrough` | `url` | Direct passthrough with CORS headers (for non-HTML assets). |

**How the embed proxy works:**
1. Fetches the embed URL's HTML content (with referer spoofing)
2. Strips Content-Security-Policy meta tags
3. Injects a `<base>` tag pointing to the original URL
4. Injects JavaScript that:
   - Proxies all `fetch()` / `XMLHttpRequest` through the proxy
   - Blocks `window.open` / popup creation
   - Neutralizes anchor `target` attributes
   - Prevents navigation on link clicks

### Analytics (`/api/v1/analytics`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/track` | `{ event, properties?, sessionId? }` | Record analytics event (stream play, download, etc.). |
| GET | `/summary` | — | Get summary report (requires MODERATOR+ role). |

### Subscription (`/api/v1/subscription`)

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/checkout` | `{ tier }` | Create PayHere checkout session. Returns checkout URL. |
| GET | `/status` | — | Check current subscription status (FREE/PRO + expiry). |
| POST | `/cancel` | — | Cancel subscription. |
| POST | `/webhook` | — | PayHere webhook handler (verifies signature, updates user). |

**Tiers:**
- `FREE` — Default. Basic access.
- `PRO` — Paid. PayHere subscription via LKR payments.

### BFF (`/api/v1/bff`)

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/home-page` | — | Aggregated home page data: hero movie, trending, new releases, top rated, popular TV. Redis-cached. |
| GET | `/movie-page/:id` | `type?` (movie/tv) | Full movie detail: metadata, similar movies, trailer. |
| GET | `/browse-page` | `genre?, sort?, page?, type?` | Filtered + sorted catalog with pagination metadata. |

### Mobile API (`/api/v1/mobile`)

Mobile-optimized endpoints returning lighter payloads.

| Method | Path | Description |
|---|---|---|
| GET | `/home` | Mobile home feed (simplified rows). |
| GET | `/browse` | Browse with mobile-friendly pagination. |
| GET | `/search` | Search with mobile-optimized results. |
| GET | `/movie/:id` | Movie detail (lighter payload). |
| GET | `/tv/:id` | TV show detail. |
| GET | `/tv/:id/seasons` | TV seasons list. |
| GET | `/tv/:id/seasons/:seasonNum` | Season episodes. |
| GET | `/genres` | Genre list. |

### Generic TMDB Proxy (`/api/v1/tmdb`)

Cached pass-through to TMDB API.

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/:path` | All TMDB params | Generic TMDB API proxy. Redis-cached (1-24h TTL). |
| GET | ... | Any TMDB endpoint | Forwarded to `api.themoviedb.org/3/:path` with API key injection. |

### OMDB Proxy (`/api/v1/omdb`)

Pass-through to OMDB API (IMDb data).

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/search` | `q, page?` | Search movies by title. |
| GET | `/series` | `q, page?` | Search TV series. |
| GET | `/by-id` | `imdbId` | Get by IMDb ID. |
| GET | `/by-title` | `title, year?` | Get by title + optional year. |

### Wyzie Proxy (`/api/v1/wyzie`)

Subtitle search pass-through.

| Method | Path | Query | Description |
|---|---|---|---|
| GET | `/search` | `tmdb_id, season?, episode?, language?` | Search subtitles. |
| GET | `/download` | `id` | Download subtitle file. |

### Legacy Routes

All `/api/*` routes return **301 redirect** to their `/api/v1/*` equivalents.

| Legacy Path | Redirects To |
|---|---|
| `/api/auth/*` | `/api/v1/auth/*` |
| `/api/users/*` | `/api/v1/users/*` |
| `/api/watchlist/*` | `/api/v1/watchlist/*` |
| `/api/search/*` | `/api/v1/search/*` |
| `/api/embed/*` | `/api/v1/embed/*` |
| `/api/analytics/*` | `/api/v1/analytics/*` |

---

## Domain Architecture

Every domain follows a consistent layered pattern:

```
Domain: auth
├── auth.routes.ts          ← Route definitions + middleware
├── auth.controller.ts      ← Request/response handling, validation (Zod)
├── auth.service.ts         ← Business logic
├── auth.repository.ts      ← Database access (Prisma)
├── auth.validator.ts       ← Zod schemas for request bodies
├── auth.types.ts           ← TypeScript interfaces
└── oauth-relay.ts          ← Desktop OAuth claim/nonce system
```

### Domains Overview

| Domain | Files | Description |
|---|---|---|
| **auth** | `routes`, `controller`, `service`, `repository`, `validator`, `types`, `oauth-relay` | Supabase Auth integration. Register, login (email/password), OAuth (Google/GitHub), forgot/reset password, session management, desktop OAuth relay via claim/nonce. |
| **user** | `routes`, `controller`, `service`, `repository`, `validator`, `types` | User profile CRUD. Avatar selection, preference updates (language, autoplay, provider, subtitles, quality, notifications, theme). |
| **watchlist** | `routes`, `controller`, `service`, `repository`, `validator`, `types` | Watchlist CRUD with Prisma persistence. Unique constraint on `(userId, tmdbId)`. |
| **continue-watching** | `routes`, `controller`, `service`, `repository`, `validator`, `types` | Playback progress tracking. Upsert behavior. Unique on `(userId, tmdbId, season, episode)`. |
| **episodes** | `routes`, `controller`, `service`, `repository`, `validator`, `types` | Episode watched/unwatched tracking. Unique on `(userId, tvdbId, season, episode)`. |
| **search** | `routes`, `controller`, `service` | Multi-source search orchestrator. TMDB text search, OMDB IMDb lookup, Wyzie subtitles, torrent aggregation via `torrent-search-api`, magnet resolution. |
| **embed-proxy** | `routes`, `controller` | Embed HTML fetch + ad stripping + anti-popup guard injection. Also handles passthrough proxying (CORS headers only). |
| **analytics** | `routes`, `controller`, `service` | Event tracking (stream plays, downloads). Summary reports for MODERATOR+. |
| **telemetry** | `routes`, `controller`, `service` | Desktop app heartbeat/ping. Admin endpoints for cluster stats. |
| **security** | `routes`, `controller`, `service` | VirusTotal URL/domain/IP report lookups. |
| **subscription** | `routes`, `service` | PayHere integration. Checkout session creation, status checks, cancellation, webhook signature verification. |
| **tmdb** | `routes`, `controller` | Generic TMDB proxy with Redis caching (1-24h TTL per endpoint) and configurable rate limiting. |
| **bff** | `routes`, `controller` | Backend-for-Frontend aggregation. `/home-page`, `/movie-page/:id`, `/browse-page` — combines TMDB, OMDB, and DB data into single responses. |
| **mobile** | `routes` | Mobile-optimized version of TMDB proxy. Lighter payloads, simplified responses. Reuses `mobile-api.ts`. |
| **omdb** | `routes`, `controller` | OMDB (IMDb) API pass-through. Search, series, by-ID, by-title. |
| **wyzie** | `routes`, `controller` | Wyzie subtitle search pass-through. |
| **health** | `routes` | Health checks: basic, detailed (DB connectivity), readiness. |

---

## Database Schema

**Database:** PostgreSQL 16  
**ORM:** Prisma 5  
**Connection:** `DATABASE_URL` env var (Supabase or local PostgreSQL)

### Enums

```prisma
enum Role {
  USER              // Default. Basic access.
  MODERATOR         // Can view analytics summaries.
  CONTENT_MANAGER   // Can manage content.
  SUPPORT           // Support access level.
  ADMIN             // Full admin access.
  DEVELOPER         // Developer access.
  OWNER             // Root access.
}

enum SubscriptionTier {
  FREE              // Default tier. Basic streaming access.
  PRO               // Paid tier via PayHere. Premium features.
}
```

### Models

#### User
Central user account linked to Supabase Auth via `authUserId`.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | String (cuid) | Primary Key | Internal ID |
| `email` | String | Unique | User's email address |
| `username` | String | Unique | Display username |
| `displayName` | String? | — | Optional display name |
| `bio` | String? | — | User bio/about |
| `avatarUrl` | String? | — | Profile icon URL |
| `role` | Role | Default: USER | Access level |
| `isVerified` | Boolean | Default: false | Email verified |
| `authUserId` | String | Unique | Supabase Auth user ID |
| `subscriptionTier` | SubscriptionTier | Default: FREE | Current plan |
| `subscriptionExpiry` | DateTime? | — | PRO expiry date |
| `currencyPreference` | String | Default: "LKR" | Payment currency |
| `trialStartDate` | DateTime? | — | Trial start |
| `createdAt` | DateTime | Auto | Account creation |
| `updatedAt` | DateTime | Auto | Last update |

**Relations:**
- `settings` → UserSettings (1:1, cascade delete)
- `devices` → Device[] (1:N)
- `watchlist` → WatchlistItem[] (1:N)
- `continueWatching` → ContinueWatching[] (1:N)
- `watchedEpisodes` → WatchedEpisode[] (1:N)
- `auditLogs` → AuditLog[] (1:N)
- `analyticsEvents` → AnalyticsEvent[] (1:N)
- `payments` → Payment[] (1:N)

#### UserSettings
Per-user application preferences.

| Field | Type | Default | Description |
|---|---|---|---|
| `language` | String | "en" | UI language |
| `autoplay` | Boolean | true | Auto-play next episode |
| `preferredProvider` | String? | — | Preferred stream provider ID |
| `subtitleLang` | String | "en" | Default subtitle language |
| `quality` | String | "auto" | Preferred quality (auto/720p/1080p) |
| `notifications` | Boolean | true | Push notifications enabled |
| `theme` | String | "light" | UI theme preference |

#### Payment
PayHere payment transaction records.

| Field | Type | Description |
|---|---|---|
| `orderId` | String (unique) | PayHere order ID |
| `amount` | Float | Payment amount |
| `currency` | String | Currency code |
| `status` | String | PENDING/SUCCESS/FAILED |
| `paymentId` | String? | PayHere payment ID |
| `method` | String? | Payment method |

#### WatchlistItem
User's saved movies and series.

- Unique constraint: `(userId, tmdbId)`
- Stores: `tmdbId`, `mediaType` (movie/tv), `title`, `posterPath`, `year`, `rating`, `genres`

#### ContinueWatching
Playback progress tracking.

- Unique constraint: `(userId, tmdbId, season, episode)`
- Calculates `progress` as `currentTime / duration`
- Tools for movies (season/episode null) and TV (specific season/episode)

#### WatchedEpisode
Episode viewed markers for TV shows.

- Unique constraint: `(userId, tvdbId, season, episode)`
- Timestamp tracks when watched

#### Device
Recognized devices for session management.

- Unique constraint: `(userId, deviceId)`
- Tracks: platform, browser, app version, last active IP

#### AuditLog
Security audit trail.

- Stores: action name, metadata (JSON), IP address, user agent

#### AnalyticsEvent
Usage analytics.

- `userId` nullable (anonymous events allowed)
- Stores: event name, properties (JSON), session ID, IP

---

## Middleware Stack

Applied in order (top to bottom):

| Middleware | Purpose | Config |
|---|---|---|
| **Sentry** | Error + performance tracking | `SENTRY_DSN` env |
| **Helmet** | Security headers (CSP, X-Frame-Options, HSTS, etc.) | Default config |
| **CORS** | Cross-origin requests | `CORS_ORIGIN` env (default: `*`) |
| **Compression** | Gzip/brotli response compression | Default config (threshold: 1KB) |
| **Cookie Parser** | Parse cookies into `req.cookies` | Default |
| **Rate Limiter** | Global rate limiting (Redis-backed) | Customizable per route. Falls back to in-memory if Redis unavailable. |
| **Route Handlers** | Domain-specific routes | Per-domain |
| **Error Handler** | Maps `AppError` → JSON. 500 fallback. Sends to Sentry. | Custom |

### Rate Limiting

- **Global**: Redis-backed sliding window. Default: 100 req/min per IP.
- **Auth endpoints**: Strict limit (10 req/min per IP for login/register).
- **Fallback**: In-memory rate limiter when Redis is unavailable.

### Error Handling

All errors are normalized through a custom error class:

```typescript
class AppError extends Error {
  statusCode: number;     // HTTP status code
  code: string;           // Machine-readable error code
  details?: unknown;      // Additional error details
}
```

**Response format:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format",
    "details": { ... }
  }
}
```

---

## Background Jobs

Located in `src/jobs/`. Each can be run standalone or via cron:

| Job | File | Purpose | Status |
|---|---|---|---|
| `refresh-tmdb-cache` | `refresh-tmdb-cache.ts` | Periodically refresh popular TMDB entries in Redis to prevent cold starts. | **Stub** — logs intent, no implementation. |
| `prune-audit-logs` | `prune-audit-logs.ts` | Delete audit logs older than retention period (configurable, default 1 year). | **Stub** — logs intent, no implementation. |
| `cleanup-expired-sessions` | `cleanup-expired-sessions.ts` | Remove expired custom sessions. | **Stub** — Supabase Auth handles refresh token lifecycle natively. |

**Running a job directly:**
```bash
npx tsx src/jobs/refresh-tmdb-cache.ts
```

---

## Docker Development

### docker-compose.yml

Three services defined:

| Service | Image | Port | Purpose |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | Main database (`chithra_cinema`, user: `chithra`, password: `chithra_dev`). Persistent volume: `pgdata` |
| `redis` | `redis:7-alpine` | 6379 | In-memory cache (optional, falls back to in-memory if Upstash not configured) |
| `api` | Built from `./Dockerfile` | 5000 | API server. Depends on postgres + redis. Passes through env vars. |

### Getting Started

```bash
# Start all services
docker compose up -d

# View API logs
docker compose logs -f api

# Rebuild after code changes
docker compose build api
docker compose up -d

# Stop everything
docker compose down

# Reset database volume
docker compose down -v
```

### Dockerfile (multi-stage)

```dockerfile
# Stage 1: Builder
FROM node:22-alpine3.20 AS builder
# Install openssl (required by Prisma)
# Copy package files + server + packages/core
# npm ci (production only)
# prisma generate
# tsc build

# Stage 2: Production
FROM node:22-alpine3.20
# Install tini, curl, openssl
# Copy production node_modules, dist, prisma
# HEALTHCHECK /api/v1/health
# ENTRYPOINT ["tini", "--"]
# CMD ["node", "dist/src/index.js"]
```

> **Note:** Alpine pinned to `3.20` because Prisma 5 cannot detect OpenSSL 3.21+.

---

## Deployment

### Koyeb (Production)

Deployment manifest: `koyeb.yaml`

| Setting | Value |
|---|---|
| Port | 5000 |
| Health check | `/api/v1/health` (interval: 30s) |
| Regions | `fra` (France), `was` (Washington DC) |
| Scaling | 1 instance (min/max) |
| App URL | `https://chithra-cinema-api.koyeb.app` |

**Secrets required on Koyeb:**
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `TMDB_API_KEY`
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
- `PAYHERE_MERCHANT_ID`, `PAYHERE_SECRET`
- `ADMIN_TELEMETRY_KEY`

**Deployment:**
- Automatic via GitHub Action (push to `main` affecting `server/**`)
- Manual via Koyeb dashboard or CLI

### Render (Legacy)

`RENDER_API_URL` environment variable points to `https://chithra-cinema-api.onrender.com`

Used as the remote target for desktop proxy mode.

---

## Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | 5000 | Server listen port |
| `NODE_ENV` | No | development | Environment (production/development) |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | — | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | — | Supabase service role key (admin) |
| `TMDB_API_KEY` | Yes | — | TMDB API key. Sub-keys: `TMDB_API_KEY_WEB`, `_DESKTOP`, `_MOBILE` for per-platform |
| `OMDB_API_KEY` | No | — | OMDB API key. Sub-keys supported |
| `WYZIE_API_KEY` | No | — | Wyzie subtitles API key |
| `VIRUSTOTAL_API_KEY` | No | — | VirusTotal API key. Sub-keys supported |
| `PAYHERE_MERCHANT_ID` | No | — | PayHere merchant ID |
| `PAYHERE_SECRET` | No | — | PayHere merchant secret |
| `PAYHERE_API_URL` | No | https://payhere.lk | PayHere API base (use sandbox for testing) |
| `APP_URL` | Yes | — | Frontend app URL (for CORS, OAuth redirects) |
| `API_URL` | Yes | — | Backend API URL (self-reference) |
| `CORS_ORIGIN` | No | * | Allowed CORS origin |
| `ADMIN_TELEMETRY_KEY` | No | — | 64-char hex key for admin telemetry endpoints |
| `UPSTASH_REDIS_REST_URL` | No | — | Redis URL (falls back to in-memory Map) |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Redis auth token |
| `EMBED_PROXY_LIST` | No | — | Comma-separated HTTP proxy list for embed fetches |
| `RENDER_API_URL` | No | — | Desktop proxy mode target URL |
| `SENTRY_DSN` | No | — | Sentry DSN for error tracking |
| `LOG_LEVEL` | No | info | Pino log level (trace/debug/info/warn/error/fatal) |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start with hot reload (`tsx watch src/index.ts`) |
| `npm run build` | Clean `dist/`, compile TypeScript, copy generated files |
| `npm start` | Run compiled production build (`node dist/src/index.js`) |
| `npm run lint` | Type-check with `tsc --noEmit` |
| `npm run db:generate` | Generate Prisma client from schema |
| `npm run db:migrate` | Run pending Prisma migrations |
| `npm run db:push` | Push schema to database (dev only, no migration file) |
| `npm run db:studio` | Open Prisma Studio GUI (localhost:5555) |
| `npm run db:seed` | Run database seeder (`tsx prisma/seed.ts`) |

---

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| **Prisma connection error** | `DATABASE_URL` wrong or DB not running | Check connection string, run `docker compose ps`, verify Supabase status |
| **Prisma "OpenSSL version"** | Alpine 3.21+ incompatible with Prisma 5 | Dockerfile pinned to `alpine3.20` — ensure base image isn't updated |
| **"Cannot find module '@prisma/client'"** | Prisma client not generated | Run `npm run db:generate` |
| **Rate limiting too aggressive** | Redis not connected (falling back to in-memory with default limits) | Check `UPSTASH_REDIS_*` env vars, verify Redis connectivity |
| **Auth always fails** | Supabase env vars missing or wrong | Check `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| **Search returns empty** | API keys not configured | Check `TMDB_API_KEY`, `OMDB_API_KEY` |
| **Embeds broken / blank iframes** | Embed proxy URL malformed or provider unreachable | Check `EMBED_PROXY_LIST`, verify provider domains are accessible |
| **CORS errors (desktop app)** | `CORS_ORIGIN` not set or wrong origin | Set to `*` for desktop, or specific Electron origin |
| **PayHere webhook fails** | Signature verification fails | Verify `PAYHERE_SECRET` matches PayHere dashboard |
| **Health check fails on Koyeb** | DB connection issue on startup | Check `DATABASE_URL` secret, verify PostgreSQL is accessible from Koyeb region |
| **Server crashes on startup** | Missing env vars or Prisma migration pending | Check all required env vars, run `npm run db:migrate` |
| **"Port 5000 already in use"** | Another process running on that port | Change `PORT` env or kill existing process |

---

## License

**Copyright © 2026 CHITHRA — CINEMA. All rights reserved.**

This API server and its entire codebase are **proprietary and confidential**. Copying, modifying, reverse engineering, or redistributing any part of this software is strictly prohibited.
