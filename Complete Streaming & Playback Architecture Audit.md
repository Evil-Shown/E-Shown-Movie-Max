# Complete Streaming & Playback Architecture Audit

## Project: CHITHRA -- CINEMA

**Monorepo** (Turborepo) with 4 apps: Web (Next.js 16), Desktop (Electron 34), Mobile (Expo 56), Server (Express 5).

---

## 1. TWO DISTINCT STREAMING SYSTEMS

### System A: Movie/TV Streaming (Embed-based) -- CANNOT be directly downloaded

```
User clicks Play
  → VideoPlayerProvider.openMovie() (auth gate)
    → getMovieEmbedUrl(movie, provider, {season, episode, seek})
      → resolveMediaId(movie) → TMDB ID (e.g. "157336")
      → buildEmbedUrl(provider, tmdbId, type, ...) → raw embed URL
        e.g. https://vidfast.pro/movie/157336?autoPlay=true&startAt=120
      → proxifyEmbedUrl(rawUrl) → wraps through proxy
        1. Cloudflare Worker: {WORKER_URL}/?url={encoded}
        2. Express fallback: /api/v1/embed/proxy?url={encoded}
        3. Direct (localhost only)
    → EmbedStreamFrame renders <iframe src={proxiedUrl}>
    → Server fetches embed HTML, strips ads, injects anti-popup guard
    → Provider plays video inside iframe (provider's own player)
    → postMessage events flow back: play, ended, timeupdate, upnext
    → useVideoPlayer.ts listens for events, manages next-episode, resume, fullscreen
```

**Key insight:** The actual video URL (m3u8, mpd, mp4) is **hidden inside the embed provider's iframe**. The app never sees the raw stream URL. The iframe is cross-origin and sandboxed.

**6 providers** with automatic failover:
| Provider | Domain |
|---|---|
| vidfast | vidfast.pro |
| vidlink | vidlink.pro |
| superembed | multiembed.mov |
| autoembed | autoembed.co |
| vidsrcpm | vidsrc.pm |
| vidsrc | vidsrc.cc |

### System B: Live TV (HLS native) -- CAN be downloaded (already has m3u8 handling)

```
Channel selected
  → resolveChannelStream(channelId)
    1. Local STREAM_REGISTRY (80+ curated m3u8 URLs)
    2. iptv-org API (iptv-org.github.io/api/streams.json)
    3. Web scraping (stream-scraper.ts, stream-fetch.ts)
    → Validates streams (stream-validator.ts)
    → Sorts by stability score (stream-stability.ts)
    → Returns LiveTvStream config {type: "hls", url, fallbacks, referer}

  → HlsVideoPlayer component
    → If HLS: new Hls(config), hls.loadSource(url), hls.attachMedia(video)
    → URL routed through /api/live-tv/stream?url={m3u8}&referer={ref}
    → Server rewrites m3u8 manifest (all sub-URLs → ?sid= proxy URLs)
    → hls.js fetches segments through proxy
```

### System C: God's Eye Torrent (WebTorrent) -- Already downloads torrents

```
Torrent search → magnet URI
  → WebTorrent client.add(magnet)
    → Downloads .ts/.mp4 chunks via WebRTC
    → file.renderTo(videoRef) for streaming playback
    → file.getBlobURL() for download
```

---

## 2. CRITICAL FILES MAP

| File | Role |
|---|---|
| `packages/core/src/providers.ts` | Provider definitions, embed URL builder |
| `client/lib/streaming.ts` | ID resolution, movie/TV embed URL construction |
| `client/lib/embed-proxy.ts` | Client-side proxy routing |
| `client/lib/embed-events.ts` | postMessage event parsing |
| `client/lib/stream-optimizer.ts` | Provider timeouts, preconnect |
| `client/lib/stream-prefetch.ts` | Pre-warm DNS/TLS before player opens |
| `client/components/video-player/VideoPlayerProvider.tsx` | Player state context |
| `client/components/video-player/VideoPlayerModal.tsx` | Main player UI (514 lines) |
| `client/components/video-player/hooks/useVideoPlayer.ts` | Core player logic (456 lines) |
| `client/components/video-player/hooks/useProviderFallback.ts` | Auto provider failover (148 lines) |
| `client/components/video-player/hooks/useSubtitles.ts` | Subtitle overlay (190 lines) |
| `client/components/video-player/EmbedStreamFrame.tsx` | iframe wrapper |
| `server/src/embed-proxy.ts` | Server-side embed HTML proxy (308 lines) |
| `server/src/embed-anti-ad-guard.ts` | Ad stripping + anti-popup JS (158 lines) |
| `client/lib/live-tv/streams.ts` | 80+ channel stream registry (520 lines) |
| `client/lib/live-tv/stream-resolver.ts` | Multi-source stream resolver (109 lines) |
| `client/lib/live-tv/stream-scraper.ts` | m3u8 URL extraction (286 lines) |
| `client/lib/live-tv/stream-fetch.ts` | Anti-bot fetch with retries (183 lines) |
| `client/lib/live-tv/manifest-proxy.ts` | m3u8 URL rewriting (97 lines) |
| `client/lib/live-tv/hls-config.ts` | hls.js tuning (44 lines) |
| `client/app/api/live-tv/stream/route.ts` | Server-side manifest proxy (195 lines) |
| `client/components/live-tv/HlsVideoPlayer.tsx` | HLS player component (394 lines) |
| `client/components/gods-eye/hooks/useMagnetResolver.ts` | WebTorrent streaming (842 lines) |
| `scripts/desktop-shell/main.js` | Electron main process (585 lines) |
| `scripts/desktop-shell/preload.js` | Electron IPC bridge (20 lines) |

---

## 3. END-TO-END DATA FLOW (Movie/TV)

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                       │
│                                                                │
│  User clicks "Play" on MovieCard                              │
│       │                                                        │
│       ▼                                                        │
│  VideoPlayerProvider.openMovie(movie, mode)                   │
│       │  [Auth gate: requires login]                          │
│       │                                                        │
│       ▼                                                        │
│  useProviderFallback                                          │
│       │  provider = "vidfast" (default)                       │
│       │                                                        │
│       ▼                                                        │
│  getMovieEmbedUrl(movie, "vidfast", {season, episode, seek})  │
│       │                                                        │
│       ├─ resolveMediaId(movie) → TMDB numeric ID              │
│       │   (e.g. "interstellar" → "157336")                   │
│       │                                                        │
│       ├─ buildEmbedUrl("vidfast", "157336", "movie")          │
│       │   → "https://vidfast.pro/movie/157336?autoPlay=true" │
│       │                                                        │
│       └─ proxifyEmbedUrl(rawUrl)                              │
│           → CF Worker: "{WORKER}/?url=https%3A%2F%2F..."     │
│                                                                │
│  EmbedStreamFrame renders <iframe src={proxiedUrl}>           │
│                                                                │
│  [Cloudflare Worker]                                          │
│       │  Fetches vidfast.pro/movie/157336                     │
│       │  Strips CSP, X-Frame-Options                          │
│       │  Strips ad scripts (popads, propellerads...)          │
│       │  Injects anti-popup guard JS                          │
│       │  Adds fullscreen allow attributes                     │
│       └  Returns cleaned HTML to iframe                       │
│                                                                │
│  [Inside iframe - vidfast.pro]                                │
│       │  Provider's JS loads its own player                   │
│       │  Resolves actual video stream URL (m3u8/mpd)          │
│       │  Plays video via HLS.js or native player              │
│       └  Sends postMessage events to parent                   │
│                                                                │
│  useVideoPlayer.ts listens:                                   │
│       ├─ "play" → confirmPlayback()                           │
│       ├─ "timeupdate" → savePlayback() (resume position)     │
│       ├─ "ended" → openNextEpisodeOverlay(auto: true)         │
│       └─ "upnext" → openNextEpisodeOverlay(auto: false)       │
│                                                                │
│  useProviderFallback monitors:                                │
│       ├─ Load timeout (5.5s-12s per provider)                 │
│       ├─ Playback confirm timeout (11s-28s)                   │
│       └  On failure → switchProvider() → try next provider    │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. BOTTLENECKS FOR OFFLINE DOWNLOAD

### Challenge 1: Movie/TV streams are inside cross-origin iframes
- The actual video URL (m3u8/mp4) is resolved **inside the embed provider's iframe**, not by Chithra's code
- The app only has the embed URL (e.g. `vidfast.pro/movie/157336`), not the stream URL
- The embed provider's player handles all video resolution internally

### Challenge 2: No direct access to raw video segments
- Even if you extract the m3u8 from inside the iframe, CORS blocks cross-origin segment fetches
- The embed proxy only rewrites HTML, it doesn't intercept video URLs

### Challenge 3: Provider-specific video resolution
- Each provider resolves video URLs differently
- Some use m3u8 (HLS), some use mpd (DASH), some use direct mp4
- No standardized video URL output

---

## 5. POSSIBLE APPROACHES FOR OFFLINE DOWNLOAD

### Approach A: Live TV (Easy - already has m3u8)
- Already has full m3u8 pipeline: fetch, parse, rewrite, proxy
- Could add: m3u8 → ffmpeg conversion → mp4 download
- Already has `fetchStreamResource()` with anti-bot headers

### Approach B: God's Eye Torrents (Already works)
- WebTorrent already downloads content to browser
- Could expose `file.getBlobURL()` → `<a download>` pattern
- Already has `downloadState` tracking in `useMagnetResolver.ts`

### Approach C: Movie/TV Embed Providers (Hard - requires new infrastructure)
Three sub-approaches:

**C1: Server-side video extraction**
- Server fetches embed provider page → extracts video URL from HTML/JS
- Parses m3u8/mpd from response body
- Downloads segments server-side, concatenates, serves as mp4
- **Problem:** Provider-specific, fragile, bandwidth-heavy

**C2: Service Worker interception**
- Register Service Worker that intercepts all requests from the iframe
- Capture m3u8/mpd URLs and segment requests
- Save to IndexedDB for offline playback
- **Problem:** CORS, iframe sandbox restrictions, complex SW lifecycle

**C3: Electron-only approach (Desktop only)**
- Use Electron's `session.defaultSession.webRequest.onBeforeRequest` to intercept video requests
- Already has ad blocking interceptor (`shouldCancelNetworkRequest`)
- Can intercept `.m3u8` and `.ts` requests from the embed iframe
- Download and concatenate segments → save as mp4
- **Problem:** Desktop only, complex segment management

---

## 6. EXISTING INFRASTRUCTURE THAT CAN BE REUSED

| Component | Reuse for Download |
|---|---|
| `stream-fetch.ts` | Anti-bot headers, retry logic for m3u8 fetching |
| `manifest-proxy.ts` | m3u8 parsing and URL extraction |
| `stream-validator.ts` | Validate m3u8 URLs before download |
| `embed-proxy.ts` (server) | Fetch and cache embed HTML for URL extraction |
| `stream-scraper.ts` | Regex patterns for m3u8 URL extraction from HTML |
| `hls-config.ts` | hls.js config reference |
| `useMagnetResolver.ts` | Download state management, progress tracking |
| Electron `main.js` | Network request interception, file system access |
| Prisma schema | Could add `Download` model for tracking |
| Redis cache | Cache extracted video URLs |
| Circuit breaker | Protect download endpoints from overload |

---

## 7. RECOMMENDED ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                    DOWNLOAD FEATURE PLAN                      │
├─────────────────────────────────────────────────────────────┤
│                                                                │
│  Phase 1: Live TV Download (Easy)                             │
│  ├─ New API: /api/v1/downloads/live-tv/{channelId}           │
│  ├─ Server fetches m3u8 → ffmpeg → mp4                       │
│  ├─ Store in /downloads/ directory                            │
│  └─ UI: Download button on LiveTvPlayer                      │
│                                                                │
│  Phase 2: God's Eye Download (Medium)                        │
│  ├─ Enhance useMagnetResolver with download-to-file          │
│  ├─ Electron: use file:// protocol for saved files           │
│  ├─ Track downloads in DB (Prisma Download model)            │
│  └─ UI: Download button on torrent results                   │
│                                                                │
│  Phase 3: Movie/TV Download (Hard)                           │
│  ├─ Server-side embed page scraping for video URLs           │
│  ├─ New service: video-extractor.service.ts                  │
│  ├─ Try each provider until video URL found                  │
│  ├─ Download m3u8 segments → concatenate → mp4               │
│  ├─ Queue system for long downloads                          │
│  ├─ DB: Download model with status/progress                  │
│  └─ UI: Download button on movie/TV detail page              │
│                                                                │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. KEY CONCERNS

1. **Legal/TOS**: Embed providers may prohibit downloading; live TV streams may be geo-restricted
2. **Storage**: Movie downloads can be 1-4GB each; need disk space management
3. **Bandwidth**: Server-side download doubles bandwidth (upstream + downstream)
4. **DRM**: Some streams may have DRM (Widevine/FairPlay) blocking download
5. **Electron**: Desktop-only approach is more reliable due to network interception access
6. **Mobile**: React Native doesn't have the same iframe interception; Expo has limited native modules
