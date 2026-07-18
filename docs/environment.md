# Environment Variables & API Architecture

This document explains the environment variable strategy for the Chithra Cinema monorepo and why the TMDB API key lives on the backend, not in the mobile app.

> **⚠️ All environment variables are now validated at startup via Zod schema** (`server/src/config/env.ts`).
> If a required variable is missing, the server **will not start** — fail-safe by default.

---

## Variable Classification

### Public (Client-Side) — Prefixed `EXPO_PUBLIC_` / `NEXT_PUBLIC_`

**Embedded into the app bundle at build time.** Anyone with the APK/IPA/JS bundle can read these.

| Variable                | Apps   | Description                                                          |
| ----------------------- | ------ | -------------------------------------------------------------------- |
| `EXPO_PUBLIC_API_URL`   | Mobile | Base URL of the backend API (e.g., `https://api.chithra-cinema.com`) |
| `NEXT_PUBLIC_API_URL`   | Web    | Same as above, for Next.js client                                    |
| `NEXT_PUBLIC_SITE_NAME` | Web    | Display name for branding                                            |

**Rules:**

- Never put secrets here
- Safe to commit `.env.example` with placeholders
- Injected at build time via Expo/Next.js

### Private (Server-Side Only)

**Never leave the server process.** Stored in GitHub Actions secrets, server `.env`, or secret managers (AWS Secrets Manager, GCP Secret Manager, etc.).

All variables are validated by the Zod schema in `server/src/config/env.ts`. The server crashes on startup if required vars are missing.

| Variable                    | Required                   | Description                                                       |
| --------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `SUPABASE_URL`              | ✅ Yes                     | Supabase project URL                                              |
| `SUPABASE_ANON_KEY`         | ✅ Yes                     | Supabase anonymous key                                            |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ Yes                     | Supabase service role key (admin operations)                      |
| `DATABASE_URL`              | ✅ Yes                     | PostgreSQL connection string                                      |
| `TMDB_API_KEY`              | ✅ Yes                     | TMDB API key — proxies all movie/TV metadata requests             |
| `PAYHERE_MERCHANT_ID`       | ✅ Yes                     | PayHere merchant ID for payment processing                        |
| `PAYHERE_SECRET`            | ✅ Yes                     | PayHere merchant secret for webhook verification                  |
| `ADMIN_TELEMETRY_KEY`       | ✅ Yes                     | Secret for telemetry stats endpoint (no hardcoded fallback)       |
| `PAYHERE_API_URL`           | Dev Default; Prod Required | PayHere API base URL — sandbox in dev, https://payhere.lk in prod |
| `APP_URL`                   | Dev Default; Prod Required | Frontend URL for PayHere return redirects                         |
| `API_URL`                   | Dev Default; Prod Required | Backend URL for PayHere webhook notifications                     |
| `PORT`                      | Default                    | HTTP port (default 5000)                                          |
| `NODE_ENV`                  | Default                    | Environment: development/production/test                          |
| `LOG_LEVEL`                 | Default                    | Pino log level                                                    |
| `EMBED_CACHE_TTL_MS`        | Default                    | Embed proxy cache TTL                                             |
| `EMBED_REQUEST_TIMEOUT_MS`  | Default                    | Embed proxy request timeout                                       |
| `EMBED_MAX_CACHE_BYTES`     | Default                    | Max embed cache entry size                                        |
| `VIRUSTOTAL_API_KEY`        | Optional                   | VirusTotal API for hash scanning                                  |
| `OMDB_API_KEY`              | Optional                   | OMDB API key for additional metadata                              |
| `WYZIE_API_KEY`             | Optional                   | Wyzie streaming API key                                           |
| `UPSTASH_REDIS_REST_URL`    | Optional                   | Redis connection URL                                              |
| `UPSTASH_REDIS_REST_TOKEN`  | Optional                   | Redis auth token                                                  |
| `EMBED_PROXY_LIST`          | Optional                   | Comma-separated proxy URLs                                        |
| `USER_DATA_PATH`            | Optional                   | Custom user data path (desktop app)                               |
| `GH_TOKEN`                  | Optional                   | GitHub token for release automation                               |

---

## Why TMDB Key Is Server-Only

### Threat Model

| Scenario                      | If Key in Client                                           | If Key on Server                                   |
| ----------------------------- | ---------------------------------------------------------- | -------------------------------------------------- |
| Bundle reverse-engineered     | **Key stolen** — attacker uses your quota, gets you banned | Key safe                                           |
| MITM on user network          | Key visible in traffic                                     | Only proxied requests visible                      |
| Malicious user scripts client | Can scrape TMDB directly, bypassing your rate limits       | Must go through your API (rate-limited, monitored) |
| Key rotation needed           | Requires app update + user update                          | Instant server-side change                         |

### Architecture

```
┌─────────────┐     HTTPS      ┌─────────────┐     HTTPS      ┌─────────┐
│  Mobile App │ ─────────────▶ │             │ ─────────────▶ │  TMDB   │
│             │  /api/mobile/* │   Backend   │  api.themoviedb│  API    │
│  No TMDB    │                │  (Server)   │     .org/3     │         │
│  key here   │                │  TMDB_KEY   │                │         │
└─────────────┘                │  (secret)   │                └─────────┘
                               └─────────────┘
┌─────────────┐     HTTPS      ▲
│  Web Client │ ───────────────┘
│  (Next.js)  │  /api/v1/tmdb/*
│  No TMDB    │
│  key here   │
└─────────────┘

Public:  EXPO_PUBLIC_API_URL / NEXT_PUBLIC_API_BASE_URL
Private: TMDB_API_KEY (server-only)
```

### Mobile App Requests

The mobile app **only** talks to your backend:

```typescript
// mobile/lib/api/config.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL; // e.g., https://api.example.com

// mobile/lib/api/movies.ts
export async function fetchHomeCatalog() {
  return apiGet<HomeCatalog>("/api/mobile/home"); // ← Your backend
}

export async function fetchMovieDetail(id: string) {
  return apiGet<Movie>(`/api/mobile/movie/${id}`); // ← Your backend
}

export async function searchMovies(query: string, page = 1) {
  return apiGet<BrowseResult>(`/api/mobile/search?q=${query}&page=${page}`);
}
```

### Backend Proxies to TMDB

The backend holds `TMDB_API_KEY` and exposes two proxy surfaces:

1. **Mobile API** (`/api/mobile/*`) — higher-level endpoints that transform TMDB responses into the mobile app's internal types.
2. **Web TMDB Proxy** (`/api/v1/tmdb/*`) — raw pass-through proxy used by the Next.js web client.

#### Mobile API

```typescript
// server/src/mobile-api.ts
import { Router } from "express";
import { tmdbGet } from "./lib/tmdb";

router.get("/movie/:id", async (req, res) => {
  const tmdbData = await tmdbGet(
    `/movie/${req.params.id}`,
    {
      append_to_response: "credits,videos,images,similar",
    },
    { region: "US" }
  );
  res.json(mapMovieDetail(tmdbData)); // Transform to mobile types
});
```

#### Web TMDB Proxy

```typescript
// server/src/domains/tmdb/tmdb.controller.ts
import { tmdbGet } from "../../lib/tmdb";

export async function proxy(req: Request, res: Response, next: NextFunction) {
  const data = await tmdbGet<unknown>(req.path, req.query as Record<string, string>);
  res.json(data); // Raw TMDB response
}
```

### Benefits

| Benefit            | How                                                            |
| ------------------ | -------------------------------------------------------------- |
| **Key protection** | Never in client bundle, never in client traffic                |
| **Rate limiting**  | Backend enforces per-IP / per-user limits                      |
| **Caching**        | Backend caches TMDB responses (Redis) — reduces upstream calls |
| **Transformation** | Backend maps TMDB schema → your internal types                 |
| **Fallbacks**      | Backend can combine TMDB + local + OMDB sources                |
| **Key rotation**   | Change `TMDB_API_KEY` in server env — no app update needed     |

---

## File Locations

| File                                 | Purpose                             | Committed?         |
| ------------------------------------ | ----------------------------------- | ------------------ |
| `mobile/.env.example`                | Template for mobile dev             | ✅ Yes             |
| `mobile/.env`                        | Local mobile dev values             | ❌ No (gitignored) |
| `server/.env.example`                | Template for server dev             | ✅ Yes             |
| `server/.env`                        | Local server dev values             | ❌ No (gitignored) |
| `client/.env.example`                | Template for web dev                | ✅ Yes             |
| `client/.env.local`                  | Local web dev values                | ❌ No (gitignored) |
| `desktop/package.json`               | Electron + builder config           | ✅ Yes             |
| `scripts/desktop-shell/package.json` | Version source of truth for desktop | ✅ Yes             |
| GitHub Actions Secrets               | CI/CD values                        | N/A (UI)           |

### `.gitignore` (Relevant Entries)

```gitignore
# Environment variables
.env
.env.*
!.env.example
```

---

## Setting Up Locally

### Mobile App

```bash
cd mobile
cp .env.example .env
# Edit .env:
# EXPO_PUBLIC_API_URL=http://192.168.1.50:5000
npx expo start
```

### Backend Server

```bash
cd server
cp .env.example .env
# Edit .env:
# TMDB_API_KEY=your_actual_tmdb_key
# VIRUSTOTAL_API_KEY=your_key (optional)
# UPSTASH_REDIS_REST_URL=... (optional)
# UPSTASH_REDIS_REST_TOKEN=... (optional)
npx tsx watch src/index.ts
```

### Desktop App

```bash
cd desktop
# No .env needed — the client and server .env files are bundled at build time
npm start
```

### Web Client

```bash
cd client
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:5000
npm run dev
```

---

## CI/CD (GitHub Actions)

### Required Secrets

| Secret                     | Workflow              | Scope                     |
| -------------------------- | --------------------- | ------------------------- |
| `EXPO_TOKEN`               | `mobile-release.yml`  | Expo auth for EAS builds  |
| `TMDB_API_KEY`             | Server deploy / build | Backend TMDB proxy        |
| `OMDB_API_KEY`             | `release-desktop.yml` | Desktop package env       |
| `WYZIE_API_KEY`            | `release-desktop.yml` | Desktop package env       |
| `VIRUSTOTAL_API_KEY`       | `release-desktop.yml` | Desktop security features |
| `UPSTASH_REDIS_REST_URL`   | Server deploy         | Caching                   |
| `UPSTASH_REDIS_REST_TOKEN` | Server deploy         | Caching                   |

### Mobile Release Workflow

The workflow injects `EXPO_PUBLIC_API_URL` at build time via EAS build profile configuration (or `.env` in the build context). The `TMDB_API_KEY` is **never** passed to the mobile build — it stays in the server's environment.

---

## Rotating Keys

### TMDB API Key

1. Generate new key at <https://www.themoviedb.org/settings/api>
2. Update `TMDB_API_KEY` in:
   - Server `.env` (local)
   - GitHub Actions secret
   - Production server environment
3. Revoke old key on TMDB dashboard
4. **No mobile app update needed**

### EXPO_PUBLIC_API_URL

If you change the API domain:

1. Update `EXPO_PUBLIC_API_URL` in:
   - `mobile/.env.example`
   - GitHub Actions (if used in build)
   - EAS build profile env vars
2. Run mobile release script → new build → users update

---

## Common Mistakes

| Mistake                                         | Consequence                              | Fix                                                |
| ----------------------------------------------- | ---------------------------------------- | -------------------------------------------------- |
| `TMDB_API_KEY` in `client/.env.local`           | Key exposed in browser bundle            | Move to `server/.env`                              |
| `TMDB_API_KEY` in `mobile/.env`                 | Key exposed in APK                       | Move to server only                                |
| `EXPO_PUBLIC_API_URL` pointing to TMDB directly | Bypasses your rate limits, no caching    | Point to your backend                              |
| Committing `.env` files                         | Secrets in git history                   | Add to `.gitignore`, rotate keys                   |
| Using `process.env.TMDB_API_KEY` in client code | Key undefined or leaked in bundle        | Only available on server                           |
| Missing required env var at startup             | Server crashes with Zod validation error | Check server startup logs, set the missing var     |
| Hardcoded env values in source code             | Security audit failure                   | Add to `.env.example`, import from `config/env.ts` |

---

## Testing the Proxy

```bash
# Start server locally
cd server && npx tsx watch src/index.ts

# Test mobile API endpoints
curl http://localhost:5000/api/mobile/health
curl http://localhost:5000/api/mobile/home
curl "http://localhost:5000/api/mobile/movie/550"  # Fight Club
curl "http://localhost:5000/api/mobile/search?q=inception"
curl "http://localhost:5000/api/mobile/tv/1399/seasons"  # Game of Thrones
curl "http://localhost:5000/api/mobile/genres/movie"

# Test web TMDB proxy (raw TMDB responses)
curl "http://localhost:5000/api/v1/tmdb/movie/popular"
curl "http://localhost:5000/api/v1/tmdb/movie/550"
curl "http://localhost:5000/api/v1/tmdb/search/movie?query=inception"
```

---

## Mobile API Endpoints Reference

All endpoints mounted at `/api/mobile/`:

| Endpoint                  | TMDB Source                                                            | Description                       |
| ------------------------- | ---------------------------------------------------------------------- | --------------------------------- |
| `GET /health`             | —                                                                      | Health check                      |
| `GET /home`               | `/trending`, `/movie/popular`, `/movie/top_rated`, `/tv/popular`, etc. | Aggregated home catalog           |
| `GET /browse`             | `/discover/movie` or `/movie/*`                                        | Browse with genre/sort/pagination |
| `GET /search`             | `/search/multi`, `/search/movie`, `/search/tv`                         | Search movies/TV                  |
| `GET /movie/:id`          | `/movie/{id}` + append_to_response                                     | Movie details                     |
| `GET /movie/:id/similar`  | `/movie/{id}/similar`                                                  | Similar movies                    |
| `GET /tv/:id`             | `/tv/{id}` + append_to_response                                        | TV show details                   |
| `GET /tv/:id/seasons`     | `/tv/{id}`                                                             | Season list                       |
| `GET /tv/:id/season/:num` | `/tv/{id}/season/{num}`                                                | Episodes for season               |
| `GET /genres/movie`       | `/genre/movie/list`                                                    | Movie genres                      |
| `GET /genres/tv`          | `/genre/tv/list`                                                       | TV genres                         |

### Request/Response Examples

**GET `/api/mobile/home`**

```json
{
  "featured": { "id": "550", "title": "Fight Club", ... },
  "heroMovies": [...],
  "trending": [...],
  "trendingDay": [...],
  "newReleases": [...],
  "topRated": [...],
  "popularTv": [...],
  "source": "tmdb",
  "stats": { "filmCount": 0, "genreCount": 0, "avgRating": 0 }
}
```

**GET `/api/mobile/browse?page=1&genre=28&sort=popular`**

```json
{
  "movies": [...],
  "source": "tmdb",
  "page": 1,
  "totalPages": 500,
  "totalResults": 10000,
  "lastLoadedPage": 1
}
```

**GET `/api/mobile/movie/550`**

```json
{
  "id": "550",
  "title": "Fight Club",
  "overview": "...",
  "posterPath": "/path.jpg",
  "backdropPath": "/backdrop.jpg",
  "voteAverage": 8.4,
  "releaseDate": "1999-10-15",
  "runtime": 139,
  "genres": ["Drama"],
  "cast": [...],
  "crew": [...],
  "trailers": [...],
  "watchProviders": { "US": {...} }
}
```

---

## Rate Limiting & Caching

### Server-Side Rate Limiting

```typescript
// In server/src/mobile-api.ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req, res, next) {
  const ip = req.ip || "unknown";
  const now = Date.now();
  const window = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60000 };

  if (now > window.resetAt) {
    window.count = 0;
    window.resetAt = now + 60000;
  }

  if (window.count >= 60) {
    return res.status(429).json({ error: "Too many requests" });
  }

  window.count++;
  rateLimitMap.set(ip, window);
  res.setHeader("X-RateLimit-Limit", "60");
  res.setHeader("X-RateLimit-Remaining", 60 - window.count);
  next();
}

router.use(rateLimit);
```

### Redis Caching (Optional)

```typescript
// In server/src/mobile-api.ts
import { cacheGetJson, cacheSetJson } from "./redis";

async function tmdbGetCached<T>(path: string, params: Record<string, string>, ttl = 3600) {
  const cacheKey = `tmdb:${path}:${JSON.stringify(params)}`;
  const cached = await cacheGetJson<T>(cacheKey);
  if (cached) return cached;

  const data = await tmdbGet<T>(path, params);
  await cacheSetJson(cacheKey, data, ttl);
  return data;
}
```

---

## Type Mapping (Mobile ↔ Server)

### Mobile Types (`mobile/lib/api/types.ts`)

```typescript
export interface Movie {
  id: string;
  tmdbId: string;
  title: string;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate: string;
  voteAverage: number;
  voteCount: number;
  genreIds: number[];
  adult: boolean;
  originalLanguage: string;
  popularity: number;
  mediaType: "movie" | "tv";
}
```

### Server Response (Transformed)

```typescript
function mapMovie(data: TMDBMovie): Movie {
  return {
    id: String(data.id),
    tmdbId: String(data.id),
    title: data.title || data.name || "Unknown",
    overview: data.overview || "",
    posterPath: data.poster_path,
    backdropPath: data.backdrop_path,
    releaseDate: data.release_date || data.first_air_date,
    voteAverage: data.vote_average || 0,
    voteCount: data.vote_count || 0,
    genreIds: data.genre_ids || [],
    adult: data.adult || false,
    originalLanguage: data.original_language,
    popularity: data.popularity || 0,
    mediaType: data.media_type || (data.name ? "tv" : "movie"),
  };
}
```

---

## Summary

- **Mobile app** = thin client, only knows `EXPO_PUBLIC_API_URL`
- **Web/desktop client** = thin client, only knows `NEXT_PUBLIC_API_BASE_URL`
- **Backend** = gatekeeper, holds `TMDB_API_KEY`, proxies via `/api/mobile/*` and `/api/v1/tmdb/*`, caches, rate-limits
- **Key rotation** = server-only change, zero client updates
