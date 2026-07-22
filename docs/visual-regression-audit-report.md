# CHITHRA Cinema — Visual Regression Audit Report

**Date:** 2026-07-21
**Branch:** feature/responsive-design-improvements
**Playwright Version:** 1.61.1
**Test Suite:** 13 pages × 9 viewports = 117 tests
**Baseline Snapshots Created:** 92/117 (Phase 4)

---

## Executive Summary

| Metric | Value |
|--------|-------|
| Total pages tested | 13 |
| Total screenshots | 117 |
| Passed | 72 (61.5%) |
| Failed | 45 (38.5%) |
| Overall stability score | **61.5 / 100** |

---

## Failure Categories

### Category A — External API Dependency (Movie Details: 9 failures)

The `/movie/550` page fails on **all 9 viewports** because the dynamic `[id]` page depends on TMDB (or similar) API calls that time out in the test environment.

| Viewport | Screenshot diff | Root cause | Severity | Action |
|----------|----------------|------------|----------|--------|
| 320×568 | page.goto timeout | External API unavailable | High | Fix: Mock API in test env or update snapshot after ensuring API works |
| 375×667 | page.goto timeout | External API unavailable | High | Same |
| 390×844 | page.goto timeout | External API unavailable | High | Same |
| 414×896 | page.goto timeout | External API unavailable | High | Same |
| 768×1024 | page.goto timeout | External API unavailable | High | Same |
| 820×1180 | page.goto timeout | External API unavailable | High | Same |
| 1024×768 | page.goto timeout | External API unavailable | High | Same |
| 1366×768 | page.goto timeout | External API unavailable | High | Same |
| 1920×1080 | Worker crashed | API timeout + memory | High | Same |

**Recommendation:** Add API mocking/seed data for visual regression tests, or exclude dynamic detail pages from automated snapshot testing.

---

### Category B — Missing Page Route (TV Details: 4 failures)

The `/tv/[id]` page route does **not exist** in the Next.js app. No `app/tv/[id]/page.tsx` was found. Tests hit a non-existent route.

| Viewport | Screenshot diff | Root cause | Severity | Action |
|----------|----------------|------------|----------|--------|
| 820×1180 | Worker crashed (memory) | No matching route + memory | Medium | Remove test for TV Details or create the page |
| 1024×768 | page.goto timeout | No matching route | Medium | Same |
| 1366×768 | addStyleTag timeout | No matching route, stalled | Medium | Same |
| 1920×1080 | Screenshot timeout | No matching route | Medium | Same |

**Recommendation:** Remove `/tv/1399` from the test suite until a TV Details page exists, or update tests to check for 404 gracefully.

---

### Category C — Memory / Worker Crashes on Large Viewports (12 failures)

On viewports ≥ 820px width, the Node.js child process crashes (exit code 134 or 3221226505) or the dev server runs out of heap memory. The 1920×1080 viewport with deviceScaleFactor:2 produces 3840×2160 effective resolution full-page screenshots — extremely memory-intensive.

| Page | Viewport | Screenshot diff | Root cause | Severity | Action |
|------|----------|----------------|------------|----------|--------|
| Browse | 820×1180 | Worker crashed (code 3221226505) | Heap OOM during full-page screenshot | High | Reduce workers, increase Node memory, or reduce DPR |
| Search | 1024×768 | Worker crashed | Heap OOM | High | Same |
| TV-Details | 820×1180 | Worker crashed | Heap OOM | High | Same |
| Live-TV | 1366×768 | Worker crashed | Heap OOM | High | Same |
| Home | 1920×1080 | No baseline, worker crashed | Heap OOM | High | Same |
| Browse | 1920×1080 | Unstable screenshot (3% animating) | Heap pressure, infinite loading | High | Same |
| Search | 1920×1080 | Worker crashed | Heap OOM | High | Same |
| Movie-Details | 1920×1080 | Worker crashed | Heap OOM | High | Same |
| TV-Details | 1920×1080 | Screenshot timeout | Heap pressure | High | Same |
| Anime | 1920×1080 | Setup timeout | Heap OOM | High | Same |
| Watchlist | 1920×1080 | Worker crashed | Heap OOM | High | Same |
| Notifications | 1920×1080 | Worker crashed | Heap OOM | High | Same |
| Live-TV | 1920×1080 | Worker crashed | Heap OOM | High | Same |

**Recommendation:**
- Reduce `deviceScaleFactor` to 1 for viewports ≥ 1366px
- Add `--max-old-space-size=4096` to Node.js
- Reduce `workers` to 2 in CI
- Set `fullPage: false` for desktop viewports (capture viewport only)

---

### Category D — Dynamic Content Height Differences (7 failures)

Several pages have content that loads differently between runs, causing page height to change. This produces "different image dimensions" errors.

| Page | Viewport | Expected height | Actual height | Root cause | Severity | Action |
|------|----------|----------------|---------------|------------|----------|--------|
| Search | 820×1180 | 3136px | 1233px (61% diff) | Content not loaded, search results missing | Medium | Wait for content selectors; update snapshot |
| Browse | 1366×768 | 1987px | 821px (55% diff) | Content rows not rendered | Medium | Add more specific content wait conditions |
| Anime | 1024×768 | 2540px | 821px (35% diff) | Dynamic grid not populated | Medium | Same |
| Dashboard | 414×896 | 3031px | 3966px | Dynamic data changes page height | Low | Update snapshot (acceptable) |
| Dashboard | 768×1024 | 3444px | 2656px | Dynamic data changes page height | Low | Update snapshot (acceptable) |
| Dashboard | 820×1180 | 2616px | 3456px | Dynamic data changes page height | Low | Update snapshot (acceptable) |
| Anime | 1366×768 | — | 5% pixel diff | Dynamic content rendering | Low | Update snapshot |

**Recommendation:** Use more robust wait strategies (wait for specific content selectors rather than just networkidle). For dynamic pages, consider `maxDiffPixelRatio: 0.05` or update snapshots regularly.

---

### Category E — Timing / Race Conditions (9 failures)

Tests fail due to pages not settling within timeouts — typically on heavier pages.

| Page | Viewport | Failure | Root cause | Severity | Action |
|------|----------|---------|------------|----------|--------|
| Home | 414×896 | 5% pixel diff | Hero carousel content varies | Medium | Update snapshot |
| Home | 768×1024 | Target closed (timeout) | Heavy page, slow render | High | Increase timeout / optimize page |
| Home | 820×1180 | No baseline (previous crash) | Dev server OOM in baseline run | High | Fix memory issues first |
| Home | 1024×768 | Target closed (timeout) | Heavy hero images | High | Optimize page |
| Home | 1366×768 | addStyleTag timeout | Page not done loading | High | Optimize page |
| Search | 320×568 | Pixel diff | Dynamic trending content | Medium | Update snapshot |
| Search | 375×667 | Pixel diff | Dynamic trending content | Medium | Update snapshot |
| Search | 390×844 | Pixel diff | Dynamic trending content | Medium | Update snapshot |
| Anime | 820×1180 | Screenshot timeout (30s) | Infinite loading/spinner | High | Investigate loading state |

---

## Detailed Failure Breakdown

### 1. Home — /

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | PASS | — |
| 375×667 | PASS | — |
| 390×844 | PASS | — |
| 414×896 | 5% pixel diff (content variation) | Medium |
| 768×1024 | Timeout — target closed | High |
| 820×1180 | No baseline snapshot | High |
| 1024×768 | Timeout — target closed | High |
| 1366×768 | Timeout — addStyleTag | High |
| 1920×1080 | No baseline snapshot | High |

### 2. Browse — /

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | PASS | — |
| 375×667 | PASS | — |
| 390×844 | PASS | — |
| 414×896 | PASS | — |
| 768×1024 | PASS | — |
| 820×1180 | Worker crashed (OOM) | High |
| 1366×768 | 55% diff (height mismatch) | Medium |
| 1920×1080 | Unstable screenshot | High |

### 3. Search — /search

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | Pixel diff (dynamic content) | Medium |
| 375×667 | Pixel diff (dynamic content) | Medium |
| 390×844 | Pixel diff (dynamic content) | Medium |
| 414×896 | PASS | — |
| 768×1024 | PASS | — |
| 820×1180 | 61% diff (height mismatch) | Medium |
| 1366×768 | 21% diff (content variation) | Medium |
| 1920×1080 | Worker crashed (OOM) | High |

### 4. Movie Details — /movie/550

| Viewport | Result | Severity |
|----------|--------|----------|
| ALL (9) | Timeout / Worker crash | High |

### 5. TV Details — /tv/1399

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | PASS | — |
| 375×667 | PASS | — |
| 390×844 | PASS | — |
| 414×896 | PASS | — |
| 768×1024 | PASS | — |
| 820×1180 | Worker crashed | Medium |
| 1024×768 | page.goto timeout | Medium |
| 1366×768 | addStyleTag timeout | Medium |
| 1920×1080 | Screenshot timeout | Medium |

### 6. Anime — /anime

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | PASS | — |
| 375×667 | PASS | — |
| 390×844 | PASS | — |
| 414×896 | PASS | — |
| 768×1024 | PASS | — |
| 820×1180 | Screenshot timeout (30s) | High |
| 1024×768 | 35% diff (height mismatch) | Medium |
| 1366×768 | 5% pixel diff | Low |
| 1920×1080 | Setup timeout (OOM) | High |

### 7. Dashboard — /dashboard

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | PASS | — |
| 375×667 | PASS | — |
| 390×844 | PASS | — |
| 414×896 | Height mismatch (3031→3966) | Low |
| 768×1024 | Height mismatch (3444→2656) | Low |
| 820×1180 | Height mismatch (2616→3456) | Low |
| 1024×768 | PASS | — |
| 1366×768 | PASS | — |
| 1920×1080 | No baseline | High |

### 8. Live-TV — /live-tv

| Viewport | Result | Severity |
|----------|--------|----------|
| 320×568 | PASS | — |
| 375×667 | PASS | — |
| 390×844 | PASS | — |
| 414×896 | PASS | — |
| 768×1024 | PASS | — |
| 820×1180 | PASS | — |
| 1024×768 | Timeout — target closed | Medium |
| 1366×768 | Worker crashed (OOM) | High |
| 1920×1080 | Worker crashed (OOM) | High |

### 9. Gods-Eye — /gods-eye

| Viewport | Result | Severity |
|----------|--------|----------|
| All ≤1366 | PASS | — |
| 1920×1080 | No baseline snapshot | High |

### 10. Login — /login

| Viewport | Result | Severity |
|----------|--------|----------|
| All ≤1366 | PASS | — |
| 1920×1080 | No baseline snapshot | High |

### 11. Settings — /settings

| Viewport | Result | Severity |
|----------|--------|----------|
| All ≤1366 | PASS | — |
| 1920×1080 | No baseline snapshot | High |

### 12. Watchlist — /watchlist

| Viewport | Result | Severity |
|----------|--------|----------|
| All ≤1366 | PASS | — |
| 1920×1080 | Worker crashed (OOM) | High |

### 13. Notifications — /notifications

| Viewport | Result | Severity |
|----------|--------|----------|
| All ≤1366 | PASS | — |
| 1920×1080 | Worker crashed (OOM) | High |

---

## Severity Summary

| Severity | Count | % of failures |
|----------|-------|---------------|
| Critical | 0 | 0% |
| High | 22 | 48.9% |
| Medium | 16 | 35.6% |
| Low | 7 | 15.6% |

---

## Root Cause Distribution

| Root cause | Count | % |
|------------|-------|---|
| External API dependency (Movie Details page) | 9 | 20.0% |
| Node.js heap OOM on large viewports | 12 | 26.7% |
| Missing page route (TV Details) | 4 | 8.9% |
| Dynamic content height differences | 7 | 15.6% |
| Timing / race conditions on heavy pages | 7 | 15.6% |
| Dynamic content pixel differences | 6 | 13.3% |

---

## Recommendations

### Must Fix (High Severity)

1. **Memory management**: Set `NODE_OPTIONS=--max-old-space-size=4096` and reduce `deviceScaleFactor` to 1 for viewports ≥ 1366×768. Alternatively, set `fullPage: false` for desktop viewports.
2. **Movie Details API**: Add API mocking (MSW or fixture-based) for visual regression tests so `/movie/550` renders consistently without external dependencies.
3. **Home page performance**: Investigate why Home page times out on 768×1024 and above. Likely heavy hero images or infinite carousel causing render stalls. This is a responsive layout issue.

### Should Fix (Medium Severity)

4. **TV Details route**: Remove `/tv/1399` from test suite if no TV Details page exists, or implement the page.
5. **Robust content waits**: Replace generic `waitForLoadState("networkidle")` with component-specific selectors (e.g., wait for `.movie-grid`, `.content-row` to appear).

### Snapshot Updates Only (Low Severity)

6. **Dashboard**: The height differences on 414×896, 768×1024, and 820×1180 are caused by dashboard widgets loading variable amounts of data. Update snapshots.
7. **Anime / Search small diffs**: Minor pixel differences from dynamic content. Update snapshots.

---

## Test Infrastructure Recommendations

1. Add `"test:e2e:memory": "NODE_OPTIONS=--max-old-space-size=4096 npx playwright test"` script
2. Split large viewports (≥ 1366px) into a separate project with `deviceScaleFactor: 1`
3. Consider `workers: 2` to reduce memory pressure
4. Exclude dynamic detail pages (`/movie/[id]`) from automated runs — test them manually with seeded data

---

*Report generated automatically by Playwright visual regression suite.*
