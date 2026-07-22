# CHITHRA — CINEMA

**චිත්‍ර — Cinema** — Sri Lanka's first full-featured streaming platform for films, TV series, and The God's Eye torrent search.

> **Live app:** [chithra-cinema.vercel.app](https://chithra-cinema.vercel.app)  
> **API server:** `https://chithra-cinema-api.onrender.com` (deployed via Koyeb)  
> **Desktop releases:** [GitHub Releases](https://github.com/Evil-Shown/Chithra-Cinema/releases)  
> **Mobile:** Android APK (Expo EAS)

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [Development Guide](#development-guide)
   - [Environment Setup](#environment-setup)
   - [Running Locally](#running-locally)
   - [Docker Development](#docker-development)
6. [Client Architecture](#client-architecture)
7. [Server Architecture](#server-architecture)
8. [Desktop App](#desktop-app)
9. [Mobile App](#mobile-app)
10. [Shared Package](#shared-package)
11. [API Reference](#api-reference)
12. [Database Schema](#database-schema)
13. [Deployment](#deployment)
14. [CI/CD Pipelines](#cicd-pipelines)
15. [Configuration Reference](#configuration-reference)
16. [Troubleshooting](#troubleshooting)
17. [License](#license)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          BROWSER / DESKTOP                         │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                   Next.js 16 App (client/)                    │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────────┐  │  │
│  │  │  Pages   │  │Components│  │  Hooks   │  │   Storage   │  │  │
│  │  │ (App Rtr)│  │  (React) │  │ (useBFF) │  │ (localStore)│  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └─────────────┘  │  │
│  │                                                               │  │
│  │  ┌─────────────────────────────────────────┐                 │  │
│  │  │       BFF Route Handlers (/api/*)        │                 │  │
│  │  │  search │ home │ browse │ movie │ sources │...             │  │
│  │  └─────────────────────────────────────────┘                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │ HTTP
                    ┌──────┴──────┐
                    │  Cloudflare  │  Embed proxy worker
                    │   Worker     │  (ad-stripping, M3U8 rewrite)
                    └──────┬──────┘
                           │ HTTP
┌──────────────────────────┴──────────────────────────────────────────┐
│                   Express 5 API (server/)                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐           │
│  │  Auth    │  │  Search  │  │  Embed   │  │  Mobile  │  ...domains│
│  │(Supabase)│  │(Torrents)│  │ (Proxy)  │  │  API     │           │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Infrastructure: Prisma │ Redis │ Supabase │ Sentry │ PayHere │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────┬──────────────────────────────────────────────────────────────┘
       │
  ┌────┴────┐    ┌──────┐
  │PostgreSQL│    │Redis │
  └─────────┘    └──────┘
```

### Data Flow

1. **Browser ↔ Next.js (client side)**: React renders pages, fetches from BFF or Express
2. **Next.js BFF ↔ TMDB/OMDB**: Server-side route handlers aggregate movie metadata
3. **Next.js → Express API**: Sources, subtitles, auth, watchlist, DB operations
4. **Express → Torrent providers**: Multi-source torrent search via `torrent-search-api`
5. **Embed pipeline**: Next.js `/api/sources` → Express `/api/v1/embed/proxy` → Cloudflare Worker → stripped embed HTML → client iframe
6. **Live TV pipeline**: HLS manifests rewritten through Express proxy to avoid CORS
7. **Desktop → Render API**: Electron app proxies most API calls to cloud-hosted Express, handles search & embed locally

---

## Tech Stack

### Frontend (client/)

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 16.2.7 | React framework with App Router |
| **React** | 19.2.4 | UI library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | 12.x | Page/component animations |
| **Three.js / React Three Fiber** | 0.184 / 9.x | 3D hero effects, particles, glow orbs |
| **TanStack React Query** | 5.x | Server state & caching |
| **HLS.js** | 1.6.x | HLS stream playback for Live TV |
| **next-themes** | 0.4.x | Dark/light/dim theme toggle |
| **@splinetool/react-spline** | 4.x | 3D Spline scenes |
| **Sentry** | 10.x | Error tracking |

### Backend (server/)

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 22 | Runtime |
| **Express** | 5.2.1 | HTTP server framework |
| **Prisma** | 5.x | ORM + migrations |
| **PostgreSQL** | 16 | Primary database |
| **Redis (Upstash)** | — | Caching, rate limiting, session state |
| **Supabase** | — | Auth (email/password, OAuth) |
| **Pino** | 10.x | Structured logging |
| **Helmet** | 7.x | Security headers |
| **Zod** | 4.x | Request validation |
| **torrent-search-api** | 2.x | Torrent aggregation |
| **Sentry** | 10.x | Error tracking |
| **PayHere** | — | Payment gateway (LKR subscriptions) |

### Desktop (scripts/desktop-shell/)

| Technology | Purpose |
|---|---|
| **Electron** | Desktop wrapper |
| **electron-builder** | NSIS Windows installer |
| **electron-updater** | Auto-update via GitHub Releases |

### Mobile (mobile/)

| Technology | Purpose |
|---|---|
| **React Native (Expo)** | Cross-platform mobile app |
| **EAS Build** | APK build & publish |

### Infrastructure

| Service | Purpose |
|---|---|
| **Vercel** | Frontend hosting (Next.js) |
| **Koyeb** | Backend API hosting (Docker) |
| **Cloudflare Workers** | Embed proxy (ad stripping) |
| **Supabase** | Auth + database |
| **Upstash** | Serverless Redis |
| **GitHub Actions** | CI/CD (deploy, release) |
| **Sentry** | Error monitoring |

---

## Project Structure

```
CHITHRA — CINEMA/
│
├── client/                          # Next.js 16 frontend
│   ├── app/                         # App Router pages & BFF routes
│   │   ├── page.tsx                 # Home (hero + rows)
│   │   ├── layout.tsx               # Root layout (providers, header, footer)
│   │   ├── browse/                  # /browse (catalog browser)
│   │   ├── search/                  # /search (full-text search)
│   │   ├── movie/[id]/              # /movie/:id (detail page)
│   │   ├── anime/                   # /anime hub
│   │   ├── live-tv/                 # /live-tv
│   │   ├── t-boom/                  # /t-boom (God's Eye torrent search)
│   │   ├── gods-eye/                # /gods-eye (lazy alias for t-boom)
│   │   ├── watchlist/               # /watchlist (auth required)
│   │   ├── dashboard/               # /dashboard (auth required)
│   │   ├── settings/                # /settings (auth required)
│   │   ├── notifications/           # /notifications (auth required)
│   │   ├── downloads/               # /downloads (auth required)
│   │   ├── login/                   # /login
│   │   ├── register/                # /register
│   │   ├── forgot-password/         # /forgot-password
│   │   ├── reset-password/          # /reset-password
│   │   ├── auth/callback/           # OAuth callback handler
│   │   ├── api/                     # BFF route handlers
│   │   │   ├── search/              # Full & instant search
│   │   │   ├── home/                # Aggregated home catalog
│   │   │   ├── browse/              # Genre/sort catalog
│   │   │   ├── movie/[id]/          # Movie detail + similar
│   │   │   ├── sources/[movieId]/   # Stream source URLs
│   │   │   ├── tv/[id]/seasons/     # TV season/episode data
│   │   │   ├── anime/browse/        # Anime catalog
│   │   │   ├── tmdb/search/         # TMDB search + external ratings
│   │   │   ├── recommendations/     # For You & Smart Shuffle
│   │   │   ├── external-ratings/    # Batch IMDb/RT ratings
│   │   │   ├── subtitles/           # Subtitle search & proxy
│   │   │   └── live-tv/             # Channels, discover, resolve, stream
│   │   ├── not-found.tsx            # 404 page
│   │   ├── error.tsx                # Error boundary
│   │   ├── global-error.tsx         # Root error boundary
│   │   ├── loading.tsx              # Global loading skeleton
│   │   └── globals.css              # Global styles
│   │
│   ├── components/                  # React components
│   │   ├── auth/                    # AuthModal, AuthProvider, ProtectedLink
│   │   ├── video-player/            # Player modal, embed frame, provider switcher
│   │   ├── movie-card/              # MovieCard, grid, row components
│   │   ├── browse/                  # GenrePills, SortTabs, Pagination
│   │   ├── search/                  # SearchBar, SearchFilters, Results
│   │   ├── live-tv/                 # ChannelGrid, Player, StreamPlayer
│   │   ├── gods-eye/                # Torrent search + magnet resolver
│   │   ├── 3d/                      # Three.js effects (HeroParticles, GlowOrb)
│   │   ├── ui/                      # Header, Footer, ThemeSelect, BackToTop
│   │   └── providers/               # QueryProvider, QuickViewProvider
│   │
│   ├── lib/                         # Utilities, hooks, services
│   │   ├── api/                     # API client (fetch wrapper, typed endpoints)
│   │   ├── hooks/                   # use-bff, useRequireAuth, useFocusTrap
│   │   ├── tmdb/                    # TMDB client, mapper, genres
│   │   ├── omdb/                    # OMDB client (IMDb ratings)
│   │   ├── storage/                 # localStorage persistence layer
│   │   ├── recommendations/         # Taste profile & recommendation engine
│   │   ├── live-tv/                 # Channel defs, stream resolver, scraper
│   │   ├── cache/                   # Redis client, rate limit utils
│   │   └── supabase/                # Supabase browser client
│   │
│   ├── proxy.ts                     # Next.js middleware (CORS headers)
│   ├── next.config.ts               # Next.js config
│   └── tsconfig.json                # TypeScript config
│
├── server/                          # Express 5 API
│   ├── src/
│   │   ├── index.ts                 # App entry (normal / desktop proxy modes)
│   │   ├── embed-proxy.ts           # Embed iframe proxy
│   │   ├── embed-anti-ad-guard.ts   # Ad-block bypass detection
│   │   ├── mobile-api.ts            # Mobile-optimized TMDB proxy
│   │   ├── config/                  # App configuration
│   │   ├── domains/                 # Domain logic (routes → controller → service → repo)
│   │   │   ├── auth/                # Supabase Auth, OAuth relay
│   │   │   ├── user/                # Profile, preferences
│   │   │   ├── watchlist/           # Watchlist CRUD
│   │   │   ├── continue-watching/   # Playback progress tracking
│   │   │   ├── episodes/            # Watched episode tracking
│   │   │   ├── search/              # Multi-source torrent search
│   │   │   ├── embed-proxy/         # Embed HTML proxy
│   │   │   ├── analytics/           # Stream/download event tracking
│   │   │   ├── telemetry/           # Desktop heartbeat & stats
│   │   │   ├── security/            # VirusTotal lookups
│   │   │   ├── subscription/        # PayHere payments
│   │   │   ├── tmdb/                # Generic TMDB proxy (cached)
│   │   │   ├── bff/                 # Aggregated BFF endpoints
│   │   │   ├── omdb/                # OMDB proxy
│   │   │   ├── wyzie/               # Subtitle search
│   │   │   └── health/              # Health check
│   │   ├── infrastructure/          # Prisma, Supabase, Redis, circuit breaker
│   │   ├── jobs/                    # Background jobs (stubs)
│   │   ├── middleware/              # Auth, rate-limit, error handler
│   │   ├── lib/                     # Shared utilities
│   │   ├── types/                   # TypeScript types
│   │   └── utils/                   # Helper functions
│   ├── prisma/
│   │   ├── schema.prisma            # Database schema (10 models)
│   │   └── seed.ts                  # Database seeder
│   └── tsconfig.json
│
├── mobile/                          # Expo React Native app
│   ├── app/                         # Expo Router pages
│   ├── components/                  # Mobile UI components
│   └── app.json                     # Expo config
│
├── packages/
│   └── core/                        # @chithra/core shared package
│       └── src/
│           ├── index.ts             # Barrel exports
│           ├── types.ts             # Movie, Genre, CastMember, MediaType
│           ├── movies.ts            # 17-film hardcoded catalog
│           ├── providers.ts         # Stream provider configs
│           ├── ad-block.ts          # Ad-blocking patterns (all platforms)
│           ├── cache.ts             # Cache utilities
│           └── tmdb/                # TMDB types, client, mapper, genres
│
├── workers/
│   └── embed-proxy/                 # Cloudflare Worker
│       ├── wrangler.toml
│       └── worker.js                # HTML rewrite, M3U8 proxy, ad stripping
│
├── scripts/
│   ├── desktop-shell/               # Electron desktop app source
│   │   ├── main.js                  # Electron main process
│   │   ├── preload.js               # Context bridge
│   │   └── renderer/                # React renderer (update UI)
│   ├── build-desktop.ps1            # NSIS installer build
│   ├── publish-desktop-release.ps1  # Build + publish to GitHub Releases
│   └── package-for-friend.ps1       # Portable zip build
│
├── turbo.json                       # Turborepo pipeline
├── Dockerfile                       # Multi-stage Express build
├── docker-compose.yml               # PostgreSQL + Redis + API
├── koyeb.yaml                       # Koyeb deployment manifest
├── eslint.config.mjs                # ESLint Flat config
└── prettier.config.mjs              # Prettier config
```

---

## Quick Start

### Prerequisites

- Node.js 22+
- npm 10+
- PostgreSQL 16 (or Supabase remote)
- Redis 7 (or Upstash remote)

### 1. Clone & Install

```bash
git clone https://github.com/Evil-Shown/Chithra-Cinema.git
cd Chithra-Cinema
npm install
```

### 2. Environment Setup

```bash
# Frontend
cp client/.env.example client/.env.local

# Backend
cp server/.env.example server/.env

# Mobile (optional)
cp mobile/.env.example mobile/.env
```

Edit the `.env` files with your API keys. See [Configuration Reference](#configuration-reference) for details.

### 3. Start Development

```bash
# All apps (via Turborepo)
npm run dev

# Individual apps:
cd client && npm run dev      # http://localhost:3000
cd server && npm run dev      # http://localhost:5000
cd mobile && npx expo start   # Expo Go
```

---

## Development Guide

### Daily Workflow

```bash
# Work on all workspaces with hot reload
npm run dev

# Run BFF-only (if you don't need Express backend for your task)
# The BFF routes handle TMDB/OMDB fetches and local data, so many
# client features work without the Express server running.

# Run Express server separately (needed for auth, DB, search, embeds)
cd server && npm run dev
```

### Database Commands (server/)

```bash
# Generate Prisma client after schema changes
npm run db:generate          # (from server/)

# Run migrations
npm run db:migrate

# Push schema directly (dev only)
npm run db:push

# Open Prisma Studio GUI
npm run db:studio

# Seed database
npm run db:seed
```

### Code Quality

```bash
# Type-check all workspaces
npm run lint

# Format all files
npm run format

# Type-check specific workspace
cd client && npm run lint
cd server && npm run lint
cd packages/core && npm run lint
```

### Docker Development

```bash
# Start all services (PostgreSQL + Redis + API)
docker compose up -d

# View logs
docker compose logs -f api

# Rebuild API image after changes
docker compose build api
docker compose up -d
```

---

## Client Architecture

### Route Groups & Authentication

| Route | Auth Required | Purpose |
|---|---|---|
| `/` | No | Landing page: hero, trending, new releases, top rated, popular TV, Sinhala cinema |
| `/browse` | No | Catalog browser with genre/sort/pagination (`?type=tv` for series) |
| `/search` | No | Full-text search with filters (genre, year, sort, media type) |
| `/movie/[id]` | No | Movie/TV detail with hero, cast, synopsis, ratings, similar |
| `/anime` | No | Anime hub: trending, movies, series, top rated |
| `/login` | No | Login form (email/password, Google OAuth) |
| `/register` | No | Registration form |
| `/forgot-password` | No | Password reset request |
| `/reset-password` | No | Password reset completion (reads `access_token` from URL hash) |
| `/auth/callback` | No | OAuth callback (stores token, handles Electron relay) |
| `/watchlist` | Yes | User's saved movies/series |
| `/live-tv` | Yes | Live TV channel grid & player |
| `/dashboard` | Yes | User stats, watch history, recommendations, profile |
| `/downloads` | Yes | Offline downloads (desktop only) |
| `/settings` | Yes | Profile, preferences, password |
| `/notifications` | Yes | Notification center |
| `/t-boom` | No | The God's Eye torrent search |
| `/gods-eye` | No | Lazy-loaded alias for /t-boom |

### Data Fetching Strategy

The client uses a **three-layer data architecture**:

1. **BFF Route Handlers** (`client/app/api/`) — Next.js server-side endpoints that aggregate TMDB, OMDB, and local data into optimized responses with `Cache-Control` headers (ranging from 15 min to 24 hr with `stale-while-revalidate`)

2. **TanStack React Query** — Client-side caching layer with automatic refetching, stale detection, and optimistic updates

3. **localStorage Persistence** (`client/lib/storage/`) — Offline-capable storage for watchlist, continue-watching, episode progress, provider preferences, notifications, and taste signals

### State Management

| Context | Provider | State |
|---|---|---|
| Auth | `AuthProvider` | User, token, isAuthenticated, login/register/logout |
| Auth Modal | `AuthModalProvider` | Modal open/close, redirect-on-close |
| Video Player | `VideoPlayerProvider` | Active movie, trailer mode, provider selection, resume time |
| Quick View | `QuickViewProvider` | Movie quick-view popover state |
| User Library | `UserLibraryProvider` | Watchlist, continue-watching, episode progress, toasts |
| Theme | `ThemeProvider` (next-themes) | Light / Dark / Dim |
| Query | `QueryProvider` (TanStack) | Server state caching |

### Stream Playback Pipeline

```
User clicks "Play"
  → VideoPlayerProvider.openMovie(movieId)
    → Auth check (if not authenticated, show AuthModal)
    → GET /api/sources/[movieId]?type=movie|tv&season=N&episode=N
      → BFF builds embed URLs from provider configs
      → Returns [{provider, label, url}, ...]
    → Player modal opens with ProviderSwitcher
    → EmbedStreamFrame renders iframe with:
      → Direct URL (NEXT_PUBLIC_USE_EMBED_PROXY=false)
      → OR Cloudflare Worker proxy (ad-stripped)
      → OR Express embed proxy (fallback)
    → SubtitlePicker (optional, for TV/movies with subtitles)
    → PlayerTvSelector (season/episode selector for TV)
    → Continue-watching auto-saves progress every 15s
    → PlayerNextEpisodeOverlay (shown at end of episode)
```

### Live TV Streaming Pipeline

```
User clicks a channel
  → GET /api/live-tv/discover?id=channelId
    → Server scrapes stream URL from provider
    → Returns stream URL or needs-resolve
  → GET /api/live-tv/resolve?id=channelId
    → Returns resolved playable URL
  → Player loads HLS.js with:
    → HLS manifest proxied through Express (/api/v1/embed/proxy)
    → Header rotation for geo-gated streams
    → M3U8 segment rewriting for CORS avoidance
  → If Puppeteer is available, browser-based scraping for complex sites
```

---

## Server Architecture

### Domain Pattern

Every domain follows a consistent layered architecture:

```
routes/       → HTTP route definitions + middleware
controller/   → Request/response handling, validation
service/      → Business logic
repository/   → Database access (Prisma)
validator/    → Zod schemas
types/        → TypeScript interfaces
```

### API Routes

#### Authentication (`/api/v1/auth`)

| Method | Path | Description |
|---|---|---|
| POST | `/register` | Email/password registration via Supabase |
| POST | `/login` | Email/password login |
| POST | `/oauth` | Google/GitHub OAuth login |
| POST | `/logout` | Invalidate session |
| POST | `/forgot-password` | Send reset email |
| POST | `/reset-password` | Complete password reset |
| GET | `/session` | Get current session |
| POST | `/claim-relay` | Desktop OAuth claim relay |

#### User (`/api/v1/users`)

| Method | Path | Description |
|---|---|---|
| GET | `/profile` | Get current user profile |
| PATCH | `/profile` | Update display name, bio |
| PATCH | `/avatar` | Update profile icon |
| GET | `/preferences` | Get user settings |
| PATCH | `/preferences` | Update settings (language, autoplay, provider, subtitles, quality, theme) |

#### Watchlist (`/api/v1/watchlist`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all watchlist items |
| POST | `/` | Add item (tmdbId, mediaType, title, etc.) |
| DELETE | `/:tmdbId` | Remove item |

#### Continue Watching (`/api/v1/continue`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | List all in-progress items |
| POST | `/` | Upsert progress (tmdbId, season, episode, currentTime, duration) |
| DELETE | `/` | Clear all progress |
| DELETE | `/:tmdbId` | Remove specific item |

#### Episodes (`/api/v1/episodes`)

| Method | Path | Description |
|---|---|---|
| POST | `/watched` | Mark episode as watched |
| DELETE | `/watched` | Unmark episode |
| GET | `/watched` | List watched episodes |

#### Search (`/api/v1/search`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Multi-source search (TMDB, OMDB, Wyzie) |
| GET | `/suggest` | Instant search suggestions |
| GET | `/trending` | Trending torrents |
| GET | `/providers` | Available providers |
| GET | `/resolve-magnet` | Resolve magnet link to streamable URL |

#### Embed Proxy (`/api/v1/embed`)

| Method | Path | Description |
|---|---|---|
| GET | `/proxy` | Proxy embed HTML (ad-stripped). Query: `url`, `ref` |
| GET | `/passthrough` | Direct passthrough with CORS headers |

#### Analytics (`/api/v1/analytics`)

| Method | Path | Description |
|---|---|---|
| POST | `/track` | Record stream play / download event |
| GET | `/summary` | Moderator+ summary report |

#### Subscription (`/api/v1/subscription`)

| Method | Path | Description |
|---|---|---|
| POST | `/checkout` | Create PayHere checkout session |
| GET | `/status` | Check subscription status |
| POST | `/cancel` | Cancel subscription |
| POST | `/webhook` | PayHere webhook handler |

#### BFF (`/api/v1/bff`)

| Method | Path | Description |
|---|---|---|
| GET | `/home-page` | Full home page data (hero + trending + new + top rated + popular TV) |
| GET | `/movie-page/:id` | Movie detail + similar + trailer |
| GET | `/browse-page` | Filtered/sorted catalog with pagination |

#### Mobile API (`/api/v1/mobile`)

| Method | Path | Description |
|---|---|---|
| GET | `/home` | Mobile-optimized home feed |
| GET | `/browse` | Mobile browse |
| GET | `/search` | Mobile search |
| GET | `/movie/:id` | Mobile movie detail |
| GET | `/tv/:id` | Mobile TV detail |
| GET | `/tv/:id/seasons` | TV seasons |
| GET | `/tv/:id/seasons/:seasonNum` | Season episodes |
| GET | `/genres` | Genre list |

#### Health (`/api/v1/health`)

| Method | Path | Description |
|---|---|---|
| GET | `/` | Basic health check |
| GET | `/health` | Health with DB check |
| GET | `/ready` | Readiness probe |

### Dual Mode Architecture

The server operates in two modes controlled by the `RENDER_API_URL` environment variable:

**Normal Mode** (no env set)
- All routes mounted locally with full DB access
- Used in development and Koyeb production deployment

**Desktop Proxy Mode** (`RENDER_API_URL` set)
- Routes mounted locally: search, embed proxy (no secrets needed)
- All other routes proxied to the remote Render server (auth, TMDB, DB)
- Used by the Electron desktop app to avoid shipping API keys

### Background Jobs

Located in `server/src/jobs/`:

| Job | Schedule | Purpose | Status |
|---|---|---|---|
| `refresh-tmdb-cache` | Periodic | Refresh popular TMDB entries in Redis | **Stub** (TODO) |
| `prune-audit-logs` | Daily | Delete audit logs older than 1 year | **Stub** (TODO) |
| `cleanup-expired-sessions` | Hourly | Clean expired custom sessions | **Stub** (Supabase handles this) |

---

## Desktop App

See [scripts/desktop-shell/README.md](./scripts/desktop-shell/README.md) for complete docs.

### Key Details

- **Technology**: Electron + React renderer + electron-builder
- **Installer**: NSIS-based `.exe` (Windows only)
- **Auto-update**: Checks GitHub Releases on startup, tray menu "Check for updates…"
- **OAuth bridge**: Electron's system browser → OAuth claim/nonce relay → app session
- **Dual-mode**: Can run standalone with `RENDER_API_URL` pointing to cloud API
- **Progress UI**: Animated download progress window during updates

---

## Mobile App

Located in `mobile/` — Expo React Native app.

### Setup

```bash
cd mobile
cp .env.example .env
npx expo start
```

### Environment

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend API URL |

### Release

```bash
npm run release:mobile
```

Triggers `mobile-release.yml` GitHub Action that builds an Android preview APK via EAS Build and creates a GitHub Release.

---

## Shared Package

`packages/core/` — `@chithra/core`

Published as a workspace package, consumed by `client/`, `server/`, and potentially `mobile/`.

### Module Exports

| Import Path | Exports |
|---|---|
| `@chithra/core` | All types, movies, providers, ad-block, cache, TMDB utilities |
| `@chithra/core/types` | `MediaType`, `Genre`, `CastMember`, `Movie` interfaces |
| `@chithra/core/movies` | 17-film hardcoded catalog + query functions |
| `@chithra/core/providers` | Stream provider configs + embed URL builder |
| `@chithra/core/ad-block` | Ad patterns, sandbox rules, URL blocking, navigation guards |
| `@chithra/core/cache` | Cache key builder utilities |
| `@chithra/core/tmdb` | TMDB types, client, genre mapper, response mappers |

---

## Database Schema

**Database**: PostgreSQL 16 via Prisma ORM

### Models

```prisma
enum Role { USER, MODERATOR, CONTENT_MANAGER, SUPPORT, ADMIN, DEVELOPER, OWNER }
enum SubscriptionTier { FREE, PRO }

model User {
  id                   String   @id @default(cuid())
  email                String   @unique
  username             String   @unique
  displayName          String?
  bio                  String?
  avatarUrl            String?
  role                 Role     @default(USER)
  isVerified           Boolean  @default(false)
  authUserId           String   @unique
  subscriptionTier     SubscriptionTier @default(FREE)
  subscriptionExpiry   DateTime?
  currencyPreference   String   @default("LKR")
  trialStartDate       DateTime?
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  settings            UserSettings?
  devices             Device[]
  watchlist           WatchlistItem[]
  continueWatching    ContinueWatching[]
  watchedEpisodes     WatchedEpisode[]
  auditLogs           AuditLog[]
  analyticsEvents     AnalyticsEvent[]
  payments            Payment[]
}

model Payment {
  id         String   @id @default(cuid())
  userId     String
  orderId    String   @unique
  amount     Float
  currency   String   @default("LKR")
  status     String   @default("PENDING")
  paymentId  String?
  method     String?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}

model UserSettings {
  id                String   @id @default(cuid())
  userId            String   @unique
  language          String   @default("en")
  autoplay          Boolean  @default(true)
  preferredProvider String?
  subtitleLang      String   @default("en")
  quality           String   @default("auto")
  notifications     Boolean  @default(true)
  theme             String   @default("light")
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model Device {
  id            String   @id @default(cuid())
  userId        String
  deviceId      String
  deviceName    String?
  platform      String?
  browser       String?
  appVersion    String?
  lastActive    DateTime @default(now())
  lastIp        String?
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
  @@unique([userId, deviceId])
}

model WatchlistItem {
  id         String   @id @default(cuid())
  userId     String
  tmdbId     Int
  mediaType  String
  title      String
  posterPath String?
  year       Int?
  rating     Float?
  genres     String?
  addedAt    DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
  @@unique([userId, tmdbId])
}

model ContinueWatching {
  id           String   @id @default(cuid())
  userId       String
  tmdbId       Int
  mediaType    String
  title        String
  posterPath   String?
  season       Int?
  episode      Int?
  currentTime  Float
  duration     Float
  progress     Float
  provider     String?
  updatedAt    DateTime @updatedAt
  user         User     @relation(fields: [userId], references: [id])
  @@unique([userId, tmdbId, season, episode])
}

model WatchedEpisode {
  id        String   @id @default(cuid())
  userId    String
  tvdbId    Int
  season    Int
  episode   Int
  watchedAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
  @@unique([userId, tvdbId, season, episode])
}

model AuditLog {
  id         String   @id @default(cuid())
  userId     String
  action     String
  metadata   Json?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime @default(now())
  user       User     @relation(fields: [userId], references: [id])
}

model AnalyticsEvent {
  id          String   @id @default(cuid())
  userId      String?
  event       String
  properties  Json?
  sessionId   String?
  ipAddress   String?
  createdAt   DateTime @default(now())
  user        User?    @relation(fields: [userId], references: [id])
}
```

---

## Deployment

### Frontend → Vercel

Automatic via `deploy-client.yml` GitHub Action on push to `main`.

```bash
# Or manual deploy via Vercel CLI
cd client && npx vercel --prod
```

Required environment variables on Vercel:

| Variable | Value |
|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `https://chithra-cinema-api.onrender.com` |
| `NEXT_PUBLIC_GODS_EYE_API_URL` | `https://chithra-cinema-api.onrender.com` |
| `NEXT_PUBLIC_SITE_NAME` | `CHITHRA — CINEMA` |
| `NEXT_PUBLIC_USE_EMBED_PROXY` | `true` (or `false` per provider) |

### Backend → Koyeb (Docker)

Automatic via `deploy-server.yml` GitHub Action on push to `main`.

The `koyeb.yaml` manifest defines:
- **Port**: 5000
- **Health check**: `/api/v1/health` every 30s
- **Regions**: `fra` (France), `was` (Washington DC)
- **Scaling**: 1 instance (min/max)
- **Secrets**: All API keys passed as environment secrets

### Docker image structure (multi-stage):

```
Stage 1 (builder): node:22-alpine → npm ci → prisma generate → tsc build
Stage 2 (production): node:22-alpine → copy dist + prisma + node_modules → run
```

### Cloudflare Worker → Embed Proxy

```bash
cd workers/embed-proxy
npx wrangler deploy
```

---

## CI/CD Pipelines

| Workflow | File | Trigger | Action |
|---|---|---|---|
| **Deploy Client** | `.github/workflows/deploy-client.yml` | Push to `main` (client/** or core/**) | Lint → Build → Deploy to Vercel |
| **Deploy Server** | `.github/workflows/deploy-server.yml` | Push to `main` (server/** or core/** or Dockerfile) | Build → Docker → Deploy to Koyeb |
| **Mobile Release** | `.github/workflows/mobile-release.yml` | Tag `mobile-v*` | EAS Build → GitHub Release |
| **Desktop Release** | `.github/workflows/release-desktop.yml` | Manual dispatch (`workflow_dispatch`) | Build NSIS → Publish to GitHub Releases |

---

## Configuration Reference

### client/.env.local

| Variable | Required | Default | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | — | Backend API URL for client fetches |
| `NEXT_PUBLIC_GODS_EYE_API_URL` | Yes | — | God's Eye search API URL |
| `NEXT_PUBLIC_APP_URL` | Yes | — | Public site URL (OAuth redirects) |
| `BACKEND_API_URL` | Yes | — | Vercel rewrite target (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon key |
| `NEXT_PUBLIC_SITE_NAME` | No | CHITHRA — CINEMA | Site branding name |
| `NEXT_PUBLIC_USE_EMBED_PROXY` | No | `false` | Route embeds through Cloudflare Worker |
| `NEXT_PUBLIC_EMBED_PROXY_WORKER_URL` | No | — | Cloudflare Worker URL |
| `NEXT_PUBLIC_EMBED_PROXY_API_URL` | No | — | Express embed proxy URL |
| `STREAM_UPSTREAM_COOKIES` | No | — | Live TV upstream cookies |
| `STREAM_UPSTREAM_X_FORWARDED_FOR` | No | — | Sri Lankan IP for geo-gated streams |
| `STREAM_HEADER_ROTATION` | No | `false` | Rotate UA + Referer on retries |
| `STREAM_SCRAPER_BROWSER` | No | `false` | Enable Puppeteer headless browser |
| `HTTP_PROXY` / `HTTPS_PROXY` | No | — | Proxy for upstream stream requests |
| `WYZIE_API_KEY` | No | — | Worldwide subtitles key |
| `UPSTASH_REDIS_REST_URL` | No | — | Server-side Redis (Upstash) |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Redis auth token |

### server/.env

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `SUPABASE_URL` | Yes | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | — | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | — | Supabase service role key |
| `TMDB_API_KEY` | Yes | — | TMDB API key (or `_WEB`, `_DESKTOP`, `_MOBILE` variants) |
| `OMDB_API_KEY` | No | — | OMDB API key |
| `WYZIE_API_KEY` | No | — | Wyzie subtitles API key |
| `VIRUSTOTAL_API_KEY` | No | — | VirusTotal API key |
| `PAYHERE_MERCHANT_ID` | No | — | PayHere merchant ID |
| `PAYHERE_SECRET` | No | — | PayHere secret |
| `PAYHERE_API_URL` | No | `https://payhere.lk` | PayHere API base |
| `APP_URL` | Yes | — | Frontend app URL (CORS/OAuth) |
| `API_URL` | Yes | — | Backend API URL |
| `ADMIN_TELEMETRY_KEY` | No | — | 64-char hex key for admin telemetry |
| `UPSTASH_REDIS_REST_URL` | No | — | Redis URL (falls back to in-memory) |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Redis token |
| `EMBED_PROXY_LIST` | No | — | Comma-separated HTTP proxy list |
| `PORT` | No | 5000 | Server port |
| `RENDER_API_URL` | No | — | Desktop proxy mode target |
| `CORS_ORIGIN` | No | — | Allowed CORS origin |
| `LOG_LEVEL` | No | `info` | Pino log level |

---

## Troubleshooting

### Client Issues

| Problem | Cause | Solution |
|---|---|---|
| Module not found `@chithra/core` | Stale workspace symlink | Run `npm install` from root |
| TMDB data not loading | Missing `TMDB_API_KEY` | Set in `server/.env` or check Vercel/Koyeb secrets |
| Auth not working | Missing Supabase env vars | Check `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` |
| Embeds not loading | Cloudflare Worker not deployed | Run `npx wrangler deploy` or set `NEXT_PUBLIC_USE_EMBED_PROXY=false` |
| Live TV streams blank | Missing upstream cookies/headers | Configure `STREAM_UPSTREAM_*` env vars |
| Build errors | Stale `.next` cache | `cd client && npm run clean && npm run dev` |

### Server Issues

| Problem | Cause | Solution |
|---|---|---|
| Prisma connection error | DATABASE_URL wrong or DB not running | Check `docker compose ps` or Supabase connection string |
| Prisma "OpenSSL version" | Alpine + OpenSSL 3.21+ | Base image is pinned to `alpine3.20` |
| Rate limiting too aggressive | Redis not connected | Check `UPSTASH_REDIS_*` env vars |
| Search returns empty | API keys missing | Check `TMDB_API_KEY`, `OMDB_API_KEY` |
| CORS errors on desktop | `CORS_ORIGIN` not set | Set to `*` or specific Electron origin |

### Desktop Issues

| Problem | Cause | Solution |
|---|---|---|
| Auto-update not prompting | No newer GitHub Release | Publish a new version |
| OAuth login fails | Relay URL mismatch | Check `APP_URL` matches OAuth redirect URI |
| "Download update" button stuck | Token permissions | Ensure `GH_TOKEN` has `repo` scope |

---

## License

**Copyright © 2026 CHITHRA — CINEMA. All rights reserved.**

This project is **proprietary and confidential**. Copying, redistributing, modifying, reverse engineering, or creating derivative works of any part of this codebase is strictly prohibited and subject to legal action.

### Third-party licenses

This project uses open-source components whose licenses are included in their respective `node_modules/` directories or as specified in each package.
