# CHITHRA — CINEMA Client

Next.js 16 frontend for **CHITHRA — CINEMA** (චිත්‍ර — Cinema) — Sri Lanka's first full-featured streaming platform.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Route Map](#route-map)
3. [Component Architecture](#component-architecture)
4. [Data Layer](#data-layer)
5. [State Management](#state-management)
6. [Stream Pipeline](#stream-pipeline)
7. [Live TV Pipeline](#live-tv-pipeline)
8. [The God's Eye (Torrent Search)](#the-gods-eye-torrent-search)
9. [BFF API Reference](#bff-api-reference)
10. [Environment Variables](#environment-variables)
11. [Scripts](#scripts)
12. [Project Structure](#project-structure)
13. [Caching Strategy](#caching-strategy)
14. [Performance Optimizations](#performance-optimizations)
15. [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Technology | Version | Usage |
|---|---|---|
| Next.js | 16.2.7 | App Router, Server Components, Route Handlers |
| React | 19.2.4 | UI components |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Utility-first styling (no `@apply`, no config file) |
| Framer Motion | 12.x | Page transitions, hover effects, mount/unmount animations |
| Three.js | 0.184.0 | 3D hero particles, glow orbs, floating cards |
| React Three Fiber | 9.x | Declarative Three.js in React |
| @react-three/drei | 10.x | R3F utilities (OrbitControls, shaders) |
| TanStack React Query | 5.x | Server state fetching + caching |
| HLS.js | 1.6.x | Live TV HLS stream playback |
| @splinetool/react-spline | 4.1.x | 3D Spline scenes (desktop startup carousel) |
| next-themes | 0.4.x | Dark/Light/Dim theme toggle |
| @sentry/nextjs | 10.x | Error tracking + performance monitoring |
| @supabase/supabase-js | 2.x | Client-side Supabase auth |

---

## Route Map

### Public Routes

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Landing page — hero section (cinema intro, animated particles), trending row, new releases, top rated, popular TV, Sinhala cinema. Uses streaming `Suspense` boundaries. |
| `/browse` | `app/browse/page.tsx` | Movie catalog browser. Supports `?type=tv` for series. Genre filtering via `GenrePills`, sort via `BrowseSortTabs` (Popular, Top Rated, Now Playing), paginated via `CatalogPagination`. |
| `/search` | `app/search/page.tsx` | Full-text search. Filters: genre, year, sort, rating. Media tabs: Movies, TV, All, Anime. Uses `SearchBar` with rotating placeholders. |
| `/movie/[id]` | `app/movie/[id]/page.tsx` | Movie/TV detail — `MovieDetailHero` (backdrop image with parallax), `MovieDetailClient` (star rating, rating ring, cast list, synopsis, action buttons), and "You May Also Like" similar movies row. |
| `/anime` | `app/anime/page.tsx` | Anime hub — overview mode (trending, movies, series, top-rated rows) or browse mode (`?type=movie` / `?type=tv` with sort). |
| `/login` | `app/login/page.tsx` | Login form (email/password + Google OAuth). Renders `AuthPage` component with `mode="login"`. |
| `/register` | `app/register/page.tsx` | Registration form (username, email, password, confirm). Renders `AuthPage` with `mode="register"`. |
| `/forgot-password` | `app/forgot-password/page.tsx` | Password reset request — sends reset email via Supabase Auth. |
| `/reset-password` | `app/reset-password/page.tsx` | Password reset completion — reads `access_token` from URL hash fragment. |
| `/auth/callback` | `app/auth/callback/page.tsx` | OAuth callback — stores `access_token` in localStorage, handles Electron desktop session relay via claim/nonce system. |
| `/t-boom` | `app/t-boom/page.tsx` | **The God's Eye** — torrent/magnet search. `useGodsEyeSearch` hook + `useMagnetResolver`. Torrent result list with quality/size/seeds/peers, magnet resolution to streamable URL, continue-watching banner. |
| `/gods-eye` | `app/gods-eye/page.tsx` | Dynamic import of `/t-boom` with `ssr: false` (lazy-loaded alias). |

### Protected Routes (require auth)

| Route | File | Description |
|---|---|---|
| `/watchlist` | `app/watchlist/page.tsx` | User's saved movies and series. Client-side rendered, uses `useRequireAuth` redirect. |
| `/live-tv` | `app/live-tv/page.tsx` | Live TV — channel grid (categorized sections), search bar, player chrome with HLS.js playback. Full streaming experience with channel discovery and stream resolution. |
| `/dashboard` | `app/dashboard/page.tsx` | User dashboard — stats (watch hours, daily streaks, watchlist count), continue-watching grid, activity feed (recently watched), personalized recommendations, notification preview, profile icon selector. |
| `/downloads` | `app/downloads/page.tsx` | Offline downloads page (desktop Electron only). Client-side rendered. |
| `/settings` | `app/settings/page.tsx` | Account settings — profile icon picker, display name, bio, password change form. |
| `/notifications` | `app/notifications/page.tsx` | Notification center — read/unread filtering, "Mark all read", "Clear all" actions. |

### Error & Utility Pages

| Route | File | Description |
|---|---|---|
| 404 | `app/not-found.tsx` | Custom 404 page with "Go home" link |
| Error | `app/error.tsx` | Global error boundary (retry button, error message) |
| Root Error | `app/global-error.tsx` | Root-level error boundary (catches layout errors) |
| Loading | `app/loading.tsx` | Top-level loading skeleton (animated shimmer) |
| Layout | `app/layout.tsx` | Root layout — wraps all pages: `<ThemeProvider> <AuthProvider> <QueryProvider> <VideoPlayerProvider> <QuickViewProvider> <Header> <CinemaIntroLoader> <NavigationProgress> {children} <Footer> <BackToTop>` |

---

## Component Architecture

### Component Tree (root layout)

```
<html>
  <body>
    <ThemeProvider>          ← next-themes (light/dark/dim)
      <AuthProvider>         ← User session, login/register/logout
        <QueryProvider>      ← TanStack Query client
          <VideoPlayerProvider>  ← Player modal state
            <QuickViewProvider>  ← Movie quick-view popover
              <UserLibraryProvider>
                <Header />                     ← Nav bar
                <CinemaIntroLoader />          ← Initial animation
                <NavigationProgress />         ← Top progress bar
                <AuthModal />                  ← Login/register modal
                <VideoPlayerModal />           ← Full-screen player
                <MovieQuickView />             ← Hover popover
                {children}                     ← Page content
                <Footer />
                <BackToTop />
              </UserLibraryProvider>
            </QuickViewProvider>
          </VideoPlayerProvider>
        </QueryProvider>
      </AuthProvider>
    </ThemeProvider>
  </body>
</html>
```

### Key Component Categories

#### Auth Components

| Component | File | Purpose |
|---|---|---|
| `AuthProvider` | `components/auth/AuthProvider.tsx` | React Context: `user`, `token`, `isAuthenticated`, `isLoading`, `login()`, `register()`, `logout()`. Persists token in localStorage. Handles OAuth session polling for Electron desktop. |
| `AuthModal` | `components/auth/AuthModal.tsx` | Modal dialog with tabbed login/register forms. Rate-limited (cooldown on failures). Gradient background. |
| `AuthModalProvider` | `components/auth/AuthModalProvider.tsx` | Context: `open()`, `close()`, `redirectOnClose`. Used by `ProtectedLink` and any component needing auth gate. |
| `AuthPage` | `components/auth/AuthPage.tsx` | Full-page auth UI rendered by `/login` and `/register` routes. |
| `AuthActionHandler` | `components/auth/AuthActionHandler.tsx` | After login, redirects to the page the user originally intended to visit. |
| `ProtectedLink` | `components/auth/ProtectedLink.tsx` | `<Link>` wrapper — if user is not authenticated, intercepts click and opens AuthModal instead. |

#### Video Player Components

| Component | File | Purpose |
|---|---|---|
| `VideoPlayerProvider` | `components/video-player/VideoPlayerProvider.tsx` | Core state: `openMovie(options)`, `openTrailer()`, `closePlayer()`. Manages provider selection, resume time, mode (movie/trailer). Checks auth before playback. |
| `VideoPlayerModal` | `components/video-player/VideoPlayerModal.tsx` | Full-screen dark overlay with centered player. Animates in/out with Framer Motion. |
| `EmbedStreamFrame` | `components/video-player/EmbedStreamFrame.tsx` | Sanitized `<iframe>` for embed sources. Applies sandbox attributes from `@chithra/core/ad-block`. |
| `ProviderSwitcher` | `components/video-player/ProviderSwitcher.tsx` | Dropdown to switch between stream providers (VidSrc, VidLink, EmbedSu, etc.). Persists preference. |
| `PlayerTvSelector` | `components/video-player/PlayerTvSelector.tsx` | Season + episode dropdown picker for TV shows. Auto-loads next episode. |
| `PlayerSubtitlePicker` | `components/video-player/PlayerSubtitlePicker.tsx` | Subtitle track selector. Supports Sinhala auto-translation. |
| `PlayerNextEpisodeOverlay` | `components/video-player/PlayerNextEpisodeOverlay.tsx` | "Up next" overlay with countdown shown at episode end. |
| `PlayerLoadingOverlay` | `components/video-player/PlayerLoadingOverlay.tsx` | Spinning gradient ring while player loads. |
| `PlayerScrubber` | `components/video-player/PlayerScrubber.tsx` | Custom progress bar component. |

#### Movie Display Components

| Component | File | Purpose |
|---|---|---|
| `MovieCard` | `components/movie-card/MovieCard.tsx` | Poster card with hover effects. Subcomponents: `Poster` (image with blur placeholder), `Meta` (title, year, rating), `Progress` (watch progress bar), `PlayButton`, `QuickViewTrigger`, `ExternalRatings`. |
| `MovieRow` | `components/movie-card/MovieRow.tsx` | Horizontal scrolling row. `MovieRowScroller` (scroll container), `MovieRowHeader` (title + subtitle). |
| `MovieGrid` | `components/movie-card/MovieGrid.tsx` | Responsive grid layout for catalog pages. |
| `MovieDetailHero` | `components/movie-card/MovieDetailHero.tsx` | Backdrop image with gradient overlay, title, tagline, rating ring. |
| `MovieDetailClient` | `components/movie-card/MovieDetailClient.tsx` | Full movie info: cast list, synopsis, star rating bar, action buttons (play, trailer, watchlist). |
| `MovieQuickView` | `components/movie-card/MovieQuickView.tsx` | Hover/click popover with compact movie info + quick play. |
| `RatingRing` | `components/movie-card/RatingRing.tsx` | Circular SVG rating badge (color-coded by score). |
| `PosterImage` | `components/movie-card/PosterImage.tsx` | Optimized `<Image>` with blur data URL. Supports TMDB, OMDB, and fallback. |

#### Live TV Components

| Component | File | Purpose |
|---|---|---|
| `LiveTvPageClient` | `components/live-tv/LiveTvPageClient.tsx` | Page orchestrator — manages channel selection, player state, search. |
| `LiveTvChannelGrid` | `components/live-tv/LiveTvChannelGrid.tsx` | Sectioned grid of channel cards by category. |
| `LiveTvChannelCard` | `components/live-tv/LiveTvChannelCard.tsx` | Individual channel card with logo, name, category badge. |
| `LiveTvPlayer` | `components/live-tv/LiveTvPlayer.tsx` | Player wrapper with chrome/borders. |
| `LiveTvStreamPlayer` | `components/live-tv/LiveTvStreamPlayer.tsx` | HLS.js stream player instance. |
| `YouTubeLivePlayer` | `components/live-tv/YouTubeLivePlayer.tsx` | YouTube embed for YT-based channels. |
| `LiveTvSearchBar` | `components/live-tv/LiveTvSearchBar.tsx` | Channel search input. |
| `LiveTvHero` | `components/live-tv/LiveTvHero.tsx` | Page hero banner. |
| `LiveTvSkeletonGrid` | `components/live-tv/LiveTvSkeletonGrid.tsx` | Loading skeleton. |
| `LiveTvEmptyState` | `components/live-tv/LiveTvEmptyState.tsx` | No results / no streams available. |
| `ProviderSwitcher` | `components/live-tv/../ProviderSwitcher.tsx` | Shared provider dropdown. |

#### God's Eye (Torrent) Components

| Component | File | Purpose |
|---|---|---|
| `GodsEyeHero` | `components/gods-eye/GodsEyeHero.tsx` | Hero section with search bar. |
| `SearchBar` | `components/gods-eye/SearchBar.tsx` | Movie/series search input. |
| `TorrentResultList` | `components/gods-eye/TorrentResultList.tsx` | Results list with quality/size/seeds/peers. |
| `MagnetResolver` | `components/gods-eye/MagnetResolver.tsx` | Magnet → stream URL resolver UI. |
| `ResultCard` | `components/TBoom/ResultCard.tsx` | Individual result card. |
| `SkeletonCard` | `components/TBoom/SkeletonCard.tsx` | Loading skeleton. |
| `ErrorState` | `components/TBoom/ErrorState.tsx` | Error display. |
| `EmptyState` | `components/TBoom/EmptyState.tsx` | Empty search state. |
| `StreamingStats` | `components/TBoom/StreamingStats.tsx` | Torrent stats visualizer. |

#### 3D Visual Components

| Component | File | Purpose |
|---|---|---|
| `HeroParticles` | `components/3d/HeroParticles.tsx` | Particle system in hero section. |
| `HeroParticlesCanvas` | `components/3d/HeroParticlesCanvas.tsx` | R3F Canvas wrapper. |
| `ParticleField` | `components/3d/ParticleField.tsx` | Particle field effect with mouse interaction. |
| `GlowOrb` | `components/3d/GlowOrb.tsx` | Animated glowing orb visual. |
| `FloatingCard` | `components/3d/FloatingCard.tsx` | 3D floating poster card. |

#### UI Components

| Component | File | Purpose |
|---|---|---|
| `Header` | `components/Header.tsx` | Main nav: Home, Movies, Series, Watchlist, Live TV, Anime, God's Eye. Active route highlighting, responsive (hamburger on mobile). |
| `Footer` | `components/Footer.tsx` | Site footer with logo, links, social. |
| `FooterDivider` | `components/FooterDivider.tsx` | Decorative divider. |
| `ThemeSelect` | `components/ThemeSelect.tsx` | Theme dropdown (Light/Dark/Dim). |
| `BackToTop` | `components/BackToTop.tsx` | Floating scroll-to-top button. |
| `NavigationProgress` | `components/NavigationProgress.tsx` | Next.js route change progress bar. |
| `PageTransition` | `components/PageTransition.tsx` | Framer Motion AnimatePresence wrapper. |
| `CinemaIntroLoader` | `components/CinemaIntroLoader.tsx` | Initial "CHITHRA — CINEMA" intro animation. |
| `StartupSplashLoader` | `components/StartupSplashLoader.tsx` | Alternative startup splash. |

---

## Data Layer

### Three Data Sources

```
BFF Route Handler (/api/...)
  ├── TMDB (primary)
  │   └── Movies, TV, trending, discover, search, genres
  ├── OMDB (enrichment)
  │   └── IMDb ratings, Rotten Tomatoes, Metacritic
  └── Local catalog (fallback)
      └── 17 hardcoded films (when TMDB not configured)
```

### BFF (Backend-for-Frontend)

Next.js Route Handlers aggregate data from multiple sources into optimized responses:

| Route Handler | Purpose | Aggregates |
|---|---|---|
| `GET /api/home` | Home page data | Trending (TMDB) + New Releases (TMDB) + Top Rated (TMDB) + Popular TV (TMDB) + Sinhala Cinema (TMDB discover). Cached with Redis (Upstash). |
| `GET /api/browse` | Catalog browse | TMDB discover by genre/sort/type. Paginated. |
| `GET /api/search` | Full search | TMDB multi-search + external ratings. |
| `GET /api/search/instant` | Instant search | TMDB multi-search (limit 8). |
| `GET /api/movie/[id]` | Movie detail | TMDB movie/TV detail + OMDB IMDb ratings + external ratings + cast/credits. |
| `GET /api/movie/[id]/similar` | Similar movies | TMDB similar + limit param. |
| `GET /api/sources/[movieId]` | Stream sources | Embed URLs built from provider configs per platform (web/desktop/mobile). |
| `POST /api/recommendations/for-you` | Personalized | Taste profile → similar genre/actor recommendations. |
| `POST /api/recommendations/smart-shuffle` | Shuffle | Random weighted by taste profile. |
| `POST /api/external-ratings/batch` | Batch ratings | IMDb/RT/Metacritic for up to 30 items. |

### API Client

`client/lib/api.ts` — Generic fetch wrapper:
- Auto-resolves base URL from `NEXT_PUBLIC_API_BASE_URL` or BFF fallback
- Adds auth token from `AuthProvider`
- Sets `Content-Type: application/json`
- Parses JSON responses
- Handles errors (throws typed errors)

### Caching Strategy

| Layer | Technology | Duration |
|---|---|---|
| BFF Route Handlers | `Cache-Control` headers | 15 min (home), 24 hr (static data) with `stale-while-revalidate` |
| Client State | TanStack React Query | Configurable staleTime per query (5 min default) |
| Server API | Redis (Upstash) | TMDB responses cached for 1-6 hours |
| Storage | localStorage | Watchlist, progress, preferences (persistent) |

---

## State Management

### Context Providers

| Provider | State | Persistence |
|---|---|---|
| `AuthProvider` | `{ user, token, isAuthenticated, isLoading }` + `login()`, `register()`, `logout()` | localStorage (token) |
| `AuthModalProvider` | `{ isOpen, open(), close(), redirectOnClose }` | — |
| `VideoPlayerProvider` | `{ activeMovie, isOpen, mode, provider, openMovie(), closePlayer() }` | — |
| `QuickViewProvider` | `{ activeMovie, isOpen }` | — |
| `UserLibraryProvider` | `{ watchlist, continueWatching, episodeProgress, toasts, addToast() }` | localStorage + API sync |
| `ThemeProvider` | `{ theme, setTheme }` (light/dark/dim) | localStorage |

### localStorage Persistence (`client/lib/storage/`)

All storage modules use a typed wrapper around `localStorage`:

| Module | Key | Data |
|---|---|---|
| `storage/watchlist.ts` | `chithra_watchlist` | `{ tmdbId, mediaType, title, posterPath, year, rating, genres, addedAt }[]` |
| `storage/continue-watching.ts` | `chithra_continue_watching` | `{ tmdbId, title, posterPath, season, episode, currentTime, duration, progress, updatedAt }[]` |
| `storage/episode-progress.ts` | `chithra_episode_progress` | `{ tvdbId, season, episode }[]` |
| `storage/provider-pref.ts` | `chithra_provider_pref` | `{ providerId }` |
| `storage/provider-performance.ts` | `chithra_provider_perf` | `{ providerId, avgLoadTime, successCount, failCount }[]` |
| `storage/notifications.ts` | `chithra_notifications` | `{ id, type, title, message, read, createdAt }[]` |
| `storage/taste-signals.ts` | `chithra_taste_signals` | `{ type, tmdbId, genres, rating, timestamp }[]` |
| `storage/profile-icon.ts` | `chithra_profile_icon` | `{ iconId }` |

On login, `api/migrate.ts` syncs localStorage data to the backend (watchlist, progress, episodes).

---

## Stream Pipeline

```
User clicks "Play"
  │
  ▼
VideoPlayerProvider.openMovie(movieId, { type, season, episode })
  │
  ├── Auth check ─── not authenticated ──► Open AuthModal
  │
  ▼
GET /api/sources/[movieId]?type=movie|tv&season=N&episode=N
  │
  ▼
BFF builds embed URLs:
  [{ provider: "VidSrc", label: "VidSrc HD", url: "https://..." },
   { provider: "VidLink", label: "VidLink", url: "https://..." },
   { provider: "EmbedSu", label: "Embed Super", url: "https://..." },
   { provider: "MultiEmbed", label: "MultiEmbed", url: "https://..." }]
  │
  ▼
Player modal opens (full-screen overlay)
  │
  ├── ProviderSwitcher ─── user selects provider
  │
  ▼
EmbedStreamFrame renders <iframe> with:
  │
  ├── Direct embed (NEXT_PUBLIC_USE_EMBED_PROXY=false)
  │   └── <iframe src="direct_url" sandbox="...ad-block rules..." />
  │
  ├── Cloudflare Worker proxy (NEXT_PUBLIC_EMBED_PROXY_WORKER_URL)
  │   └── Worker fetches HTML, strips ads, injects anti-popup guard,
  │       rewrites M3U8 URLs, returns sanitized iframe content
  │
  └── Express embed proxy (fallback)
      └── Express /api/v1/embed/proxy does same as Worker
  │
  ▼
PlayerTvSelector (if TV show) ─── season/episode picker
  │
  ▼
PlayerSubtitlePicker ─── subtitle track selection
  │
  ▼
Continue-watching auto-saves every 15 seconds
  │
  ▼
PlayerNextEpisodeOverlay ─── shown when episode ends (auto-play countdown)
```

---

## Live TV Pipeline

```
User clicks a channel
  │
  ▼
GET /api/live-tv/discover?id=channelId
  │
  ├── Returns stream URL (if directly known)
  └── Returns "needs resolve" ──► GET /api/live-tv/resolve?id=channelId
                                    └── Express server scrapes provider page
                                        for playable stream URL
  │
  ▼
HLS.js loads the stream:
  │
  ├── HLS manifest proxied through Express (/api/v1/embed/proxy)
  │     └── Manifest rewriting: segments re-routed through same-origin
  ├── Header rotation for geo-restricted streams
  │     └── STREAM_HEADER_ROTATION env rotates UA + Referer on retries
  ├── M3U8 segment URLs rewritten for CORS avoidance
  └── Optional: Puppeteer browser-based scraping for complex sites
      └── STREAM_SCRAPER_BROWSER must be "true"
  │
  ▼
Live TV playback in LiveTvStreamPlayer (HLS.js)
```

### Channel Categories

Channels are organized into categories defined in `client/lib/live-tv/channels.ts`:

| Category | Example Channels |
|---|---|
| News & Current Affairs | Derana 24x7, Sirasa TV, ITN, Rupavahini |
| Entertainment | Sirasa TV, TV Derana, Swarnavahini |
| Sports | (Various sports channels) |
| Movies | (Movie channels) |
| Music | (Music channels) |
| Kids | (Children's channels) |
| International | (International channels) |
| Religious | (Religious channels) |

---

## The God's Eye (Torrent Search)

The God's Eye is a built-in torrent search engine for finding and streaming movies/series via magnet links.

### Flow

```
User enters search query in /t-boom
  │
  ▼
useGodsEyeSearch hook ──► Express /api/v1/search
  │                         └── Aggregates multiple torrent providers
  │                             via torrent-search-api
  ▼
Results displayed in TorrentResultList
  │  (name, quality, size, seeds, peers, provider)
  ▼
User clicks "Resolve" on a result
  │
  ▼
useMagnetResolver hook ──► Express /api/v1/search/resolve-magnet
  │                         └── Converts magnet link → streamable URL
  ▼
Stream opens in VideoPlayerModal
```

### Hooks

| Hook | File | Purpose |
|---|---|---|
| `useGodsEyeSearch` | `components/gods-eye/hooks/useGodsEyeSearch.ts` | Search state, debounce, pagination, provider selection |
| `useMagnetResolver` | `components/gods-eye/hooks/useMagnetResolver.ts` | Magnet → stream URL resolution progress |

---

## BFF API Reference

### GET /api/home

Returns aggregated home page data.

**Response:**
```json
{
  "trending": [...],
  "newReleases": [...],
  "topRated": [...],
  "popularTv": [...],
  "sinhalaCinema": [...]
}
```

**Cache:** 900s (15 min) with `stale-while-revalidate=300`

### GET /api/browse

Browse catalog with filters.

**Query params:** `genre`, `sort` (popular|top_rated|now_playing|upcoming), `page`, `type` (movie|tv)

**Response:**
```json
{
  "results": [...],
  "page": 1,
  "totalPages": 10,
  "totalResults": 200
}
```

**Cache:** 900s

### GET /api/search

Full-text search.

**Query params:** `q` (query), `page`, `media` (movie|tv|multi|anime)

**Response:** Paginated search results.

**Cache:** 300s (5 min)

### GET /api/search/instant

Lightweight instant search (8 results).

**Query params:** `q`

**Response:** `{ results: [...] }`

**Cache:** 300s

### GET /api/movie/[id]

Movie/TV detail.

**Query params:** `type` (movie|tv)

**Response:** Full movie/TV object with external ratings, cast, credits.

**Cache:** 3600s (1 hr)

### GET /api/movie/[id]/similar

Similar movies.

**Query params:** `limit` (default 10)

**Response:** `{ results: [...] }`

### GET /api/sources/[movieId]

Stream source URLs.

**Query params:** `type` (movie|tv), `season`, `episode`

**Response:**
```json
{
  "sources": [
    { "provider": "VidSrc", "label": "VidSrc HD", "url": "https://...", "type": "embed" }
  ]
}
```

### GET /api/tv/[id]/seasons

TV show seasons.

**GET response:** `{ seasons: [...] }`

**POST:** Body `{ seasonNumber }` → `{ episodes: [...] }`

### GET /api/subtitles/search

Search subtitles.

**Query params:** `tmdb_id`, `season`, `episode`, `language`

### GET /api/subtitles/proxy

Proxy subtitle file.

**Query params:** `url`, `translate` (target language)

### GET /api/external-ratings/batch

Batch IMDb/Rotten Tomatoes/Metacritic lookup.

**Body:** `{ items: [{ title, year, type }] }`

### POST /api/recommendations/for-you

Personalized recommendations.

**Body:** `{ signals: [...taste signals...], limit: 10 }`

### POST /api/recommendations/smart-shuffle

Smart shuffle.

**Body:** `{ signals: [...], limit: 20 }`

### Live TV Endpoints

| Endpoint | Params | Description |
|---|---|---|
| `GET /api/live-tv/channels` | — | Returns all channels with metadata |
| `GET /api/live-tv/discover` | `id` | Discover stream source for a channel |
| `GET /api/live-tv/resolve` | `id` | Resolve to playable stream URL |
| `GET /api/live-tv/stream` | `url`, `headers` (JSON) | Proxy stream content/playlists |
| `POST /api/live-tv/stream` | `{ url, sid }` | Register long URL with short SID |

---

## Environment Variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | Yes | — | Backend API URL for data fetches |
| `NEXT_PUBLIC_GODS_EYE_API_URL` | Yes | — | God's Eye search API URL |
| `NEXT_PUBLIC_TBOOM_API_URL` | Yes | — | TBoom API URL |
| `NEXT_PUBLIC_APP_URL` | Yes | — | Public site URL (OAuth redirects) |
| `BACKEND_API_URL` | Yes | — | Vercel rewrite target (server-only) |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | — | Supabase URL (Google OAuth) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | — | Supabase anon key |
| `NEXT_PUBLIC_SITE_NAME` | No | CHITHRA — CINEMA | Site brand name |
| `NEXT_PUBLIC_USE_EMBED_PROXY` | No | `false` | Route embeds through HTML-rewriting proxy |
| `NEXT_PUBLIC_EMBED_PROXY_WORKER_URL` | No | — | Cloudflare Worker embed proxy URL |
| `NEXT_PUBLIC_EMBED_PROXY_API_URL` | No | — | Express embed proxy URL |
| `STREAM_UPSTREAM_COOKIES` | No | — | Live TV upstream cookies |
| `STREAM_UPSTREAM_X_FORWARDED_FOR` | No | — | Sri Lankan IP for geo-gated streams |
| `STREAM_UPSTREAM_EXTRA_HEADERS` | No | — | Extra upstream request headers |
| `STREAM_HEADER_ROTATION` | No | `false` | Rotate User-Agent/Referer on retries |
| `STREAM_SCRAPER_BROWSER` | No | `false` | Enable Puppeteer headless browser |
| `HTTP_PROXY` / `HTTPS_PROXY` | No | — | Proxy for upstream stream requests |
| `WYZIE_API_KEY` | No | — | Worldwide subtitles key |
| `UPSTASH_REDIS_REST_URL` | No | — | Server-side Redis (Upstash) |
| `UPSTASH_REDIS_REST_TOKEN` | No | — | Redis auth token |

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js dev server (Turbopack) |
| `npm run dev:clean` | Remove `.next` cache, then start dev |
| `npm run build` | Production build (`next build`) |
| `npm run start` | Serve production build (`next start`) |
| `npm run lint` | ESLint check |
| `npm run clean` | Remove `.next` build cache |
| `npm run scrape:tv` | Execute TV provider scraping script (`scripts/scrape-dialog-peotv.mjs`) |
| `npm run probe:tv` | Probe TV provider endpoints (`scripts/probe-providers.mjs`) |

---

## Project Structure

```
client/
├── app/                        # Next.js App Router
│   ├── page.tsx                # Home page
│   ├── layout.tsx              # Root layout
│   ├── browse/page.tsx         # /browse
│   ├── search/page.tsx         # /search
│   ├── movie/[id]/page.tsx     # /movie/:id
│   ├── anime/page.tsx          # /anime
│   ├── live-tv/page.tsx        # /live-tv
│   ├── t-boom/page.tsx         # /t-boom (God's Eye)
│   ├── gods-eye/page.tsx       # /gods-eye
│   ├── watchlist/page.tsx      # /watchlist
│   ├── dashboard/page.tsx      # /dashboard
│   ├── settings/page.tsx       # /settings
│   ├── notifications/page.tsx  # /notifications
│   ├── downloads/page.tsx      # /downloads
│   ├── login/page.tsx          # /login
│   ├── register/page.tsx       # /register
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   ├── auth/callback/page.tsx
│   ├── api/                    # BFF Route Handlers
│   │   ├── search/             # Full + instant search
│   │   ├── search/instant/
│   │   ├── home/
│   │   ├── browse/
│   │   ├── movie/[id]/
│   │   ├── movie/[id]/similar/
│   │   ├── sources/[movieId]/
│   │   ├── tv/[id]/seasons/
│   │   ├── anime/browse/
│   │   ├── tmdb/search/
│   │   ├── recommendations/for-you/
│   │   ├── recommendations/smart-shuffle/
│   │   ├── external-ratings/batch/
│   │   ├── subtitles/search/
│   │   ├── subtitles/proxy/
│   │   └── live-tv/{channels,discover,resolve,stream}/
│   ├── not-found.tsx
│   ├── error.tsx
│   ├── global-error.tsx
│   ├── loading.tsx
│   └── globals.css
│
├── components/                 # React components
│   ├── auth/                   # AuthProvider, AuthModal, ProtectedLink
│   ├── video-player/           # PlayerModal, EmbedFrame, ProviderSwitcher
│   ├── movie-card/             # MovieCard, MovieRow, MovieGrid, MovieQuickView
│   ├── browse/                 # GenrePills, SortTabs, Pagination
│   ├── search/                 # SearchBar, SearchFilters, SearchResults
│   ├── live-tv/                # ChannelGrid, Player, StreamPlayer
│   ├── gods-eye/               # Torrent search + magnet resolver
│   ├── TBoom/                  # ResultCard, SkeletonCard, ErrorState
│   ├── 3d/                     # HeroParticles, GlowOrb, FloatingCard
│   └── ui/                     # Header, Footer, ThemeSelect, BackToTop
│
├── lib/                        # Utilities, hooks, services
│   ├── api.ts                  # Generic fetch wrapper
│   ├── api-base.ts             # API URL resolver
│   ├── api/                    # Typed API endpoint functions
│   ├── hooks/                  # use-bff, useRequireAuth, useFocusTrap
│   ├── movie-service.ts        # Orchestration layer
│   ├── movies.ts               # Local hardcoded catalog
│   ├── streaming.ts            # Stream URL resolution
│   ├── embed-proxy.ts          # Embed URL proxification
│   ├── stream-optimizer.ts     # Stream pre-warming
│   ├── stream-prefetch.ts      # Stream source prefetching
│   ├── subtitles-client.ts     # Subtitle search + proxy
│   ├── providers.ts            # Provider configs (from @chithra/core)
│   ├── types.ts                # Re-exported types
│   ├── tmdb/                   # TMDB client, mapper, genres
│   ├── omdb/                   # OMDB client (IMDb ratings)
│   ├── storage/                # localStorage persistence layer
│   ├── recommendations/        # Taste profile + recommendation engine
│   ├── live-tv/                # Channel defs, stream resolver, scraper
│   ├── cache/                  # Redis client, rate limit utils
│   ├── supabase/               # Supabase browser client
│   ├── brand.ts                # Brand constants
│   ├── search-params.ts        # URL param helpers
│   ├── external-ratings.ts     # IMDb/RT/Metacritic fetcher
│   ├── fullscreen.ts           # Fullscreen API wrapper
│   ├── motion.ts               # Framer Motion config
│   ├── app-origin.ts           # Origin URL resolver
│   ├── trailers.ts             # YouTube trailer lookup
│   ├── tv-episodes.ts          # Episode utilities
│   ├── spline-config.ts        # Spline 3D config
│   ├── login-rate-limit.ts     # Login cooldown logic
│   ├── shuffle-rate-limit.ts   # Shuffle cooldown logic
│   └── block-ad-nav.ts         # Ad navigation blocker
│
├── public/                     # Static assets
├── types/                      # TypeScript type defs
├── utils/                      # Helper functions
├── scripts/                    # Build & data scraping scripts
│   ├── scrape-dialog-peotv.mjs # TV provider scraper
│   └── probe-providers.mjs     # Provider endpoint probe
│
├── proxy.ts                    # Next.js middleware (CORS)
├── next.config.ts              # Next.js config
├── tsconfig.json
├── postcss.config.mjs
├── eslint.config.mjs
└── package.json
```

---

## Caching Strategy

### Server-Side (Next.js Route Handlers)

| Endpoint | Cache-Control |
|---|---|
| `/api/home` | `public, max-age=900, stale-while-revalidate=300` |
| `/api/browse` | `public, max-age=900, stale-while-revalidate=300` |
| `/api/movie/[id]` | `public, max-age=3600, stale-while-revalidate=600` |
| `/api/search` | `public, max-age=300, stale-while-revalidate=60` |
| `/api/search/instant` | `public, max-age=300, stale-while-revalidate=60` |
| `/api/sources/[movieId]` | `private, max-age=60` (no CDN cache) |

### Client-Side (TanStack React Query)

| Query Key | staleTime | gcTime |
|---|---|---|
| `["home"]` | 5 min | 30 min |
| `["movie", id]` | 10 min | 60 min |
| `["browse", genre, sort, page]` | 5 min | 30 min |
| `["search", query]` | 2 min | 10 min |
| `["sources", movieId]` | 30 sec | 5 min |
| `["live-tv", "channels"]` | 5 min | 30 min |

### Redis Cache (Server-Side via Express)

| Cache Key Prefix | TTL |
|---|---|
| `tmdb:trending` | 6 hr |
| `tmdb:popular` | 6 hr |
| `tmdb:detail:*` | 24 hr |
| `tmdb:search:*` | 1 hr |

---

## Performance Optimizations

- **Image Optimization**: Next.js `<Image>` with AVIF/WebP formats, remote patterns for TMDB/Amazon/OMDb
- **Package Optimization**: `experimental.optimizePackageImports` for framer-motion, @react-three/fiber, @react-three/drei
- **Turbopack**: Monorepo-aware bundling with `turbopack.root` pointing to monorepo root
- **Transpilation**: `transpilePackages: ["@chithra/core"]` — transpiles workspace package for browser compatibility
- **Dynamic Loading**: `/gods-eye` uses `dynamic(() => import(...), { ssr: false })`
- **Streaming Suspense**: Home page uses `<Suspense>` boundaries for each row
- **Caching**: Multi-layer caching (CDN → BFF → React Query → localStorage)
- **Font Optimization**: No custom fonts loaded (system font stack)

---

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| `@chithra/core` module not found | Stale workspace symlink | `npm install` from root |
| TMDB data not loading | Missing `TMDB_API_KEY` | Set in `server/.env` |
| Auth not working | Missing Supabase env vars | Check `NEXT_PUBLIC_SUPABASE_URL` and `ANON_KEY` |
| Embeds not loading | Worker not deployed / proxy disabled | Deploy Cloudflare Worker or set `NEXT_PUBLIC_USE_EMBED_PROXY=false` |
| Live TV streams blank | Missing upstream cookies | Configure `STREAM_UPSTREAM_*` env vars |
| Build errors | Stale cache | `npm run clean && npm run dev` |
| 404 on `/api/*` | Backend not running | Start Express server or check `BACKEND_API_URL` |
| CORS errors | Missing proxy middleware | Check `proxy.ts` is properly placed |

---

## License

**Copyright © 2026 CHITHRA — CINEMA. All rights reserved.**
