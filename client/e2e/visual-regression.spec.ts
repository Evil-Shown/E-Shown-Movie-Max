import { test, expect, type Page } from "@playwright/test";

interface PageConfig {
  path: string;
  name: string;
}

const STATIC_PAGES: PageConfig[] = [
  { path: "/browse", name: "Browse" },
  { path: "/watchlist", name: "Watchlist" },
  { path: "/notifications", name: "Notifications" },
  { path: "/gods-eye", name: "Gods-Eye" },
  { path: "/login", name: "Login" },
  { path: "/settings", name: "Settings" },
];

const DYNAMIC_PAGES: PageConfig[] = [
  { path: "/", name: "Home" },
  { path: "/search", name: "Search" },
  { path: "/anime", name: "Anime" },
  { path: "/dashboard", name: "Dashboard" },
  { path: "/live-tv", name: "Live-TV" },
];

const ALL_PAGES = [...STATIC_PAGES, ...DYNAMIC_PAGES];

type WaitFn = (page: Page) => Promise<void>;

async function stabilizeHeight(page: Page, maxChecks = 8): Promise<void> {
  for (let i = 0; i < maxChecks; i++) {
    const prev = await page.evaluate(() => document.body.scrollHeight).catch(() => 0);
    if (prev === 0) break;
    await page.waitForTimeout(500);
    const curr = await page.evaluate(() => document.body.scrollHeight).catch(() => 0);
    if (curr > 0 && prev === curr) return;
  }
}

const CHANNEL_LOGO_DOMAINS = [
  "**/img.logo.dev/**",
  "**/www.google.com/s2/favicons**",
  "**/icon.brandfetch.io/**",
  "**/logo.clearbit.com/**",
  "**/icons.duckduckgo.com/**",
  "**/i.imgur.com/**",
  "**/upload.wikimedia.org/**",
  "**/www.peomobile.com/**",
  "**/image.tmdb.org/**",
];

async function blockChannelLogoImages(page: Page): Promise<void> {
  for (const pattern of CHANNEL_LOGO_DOMAINS) {
    await page.route(pattern, (route) => route.abort()).catch(() => {});
  }
}

async function blockAllStreamingRequests(page: Page): Promise<void> {
  await page.route("**/api/live-tv/resolve*", (route) => route.abort()).catch(() => {});
  await page.route("**/api/live-tv/stream*", (route) => route.abort()).catch(() => {});
  await page.route("**/api/live-tv/discover*", (route) => route.abort()).catch(() => {});
  await page.route("**/*.m3u8", (route) => route.abort()).catch(() => {});
  await page.route("**/*.ts", (route) => route.abort()).catch(() => {});
  await page.route("**/*.m3u", (route) => route.abort()).catch(() => {});
  await page.route("**/live-tv/stream*", (route) => route.abort()).catch(() => {});
  await page.route("**/iptv-org.github.io/**", (route) => route.abort()).catch(() => {});
  await page.route("**/tv.hiruhost.com/**", (route) => route.abort()).catch(() => {});
  await page.route("**/resolve*", (route) => route.abort()).catch(() => {});
}

async function blockWebTorrent(page: Page): Promise<void> {
  await page.route("**/cdn.jsdelivr.net/npm/webtorrent**", (route) => route.abort()).catch(() => {});
  await page.route("**/webtorrent**", (route) => route.abort()).catch(() => {});
  await page.route("**/torrent**", (route) => route.abort()).catch(() => {});
}

async function ensureFontsReady(page: Page): Promise<void> {
  await Promise.race([
    page.evaluate(() => document.fonts.ready),
    page.waitForTimeout(6_000),
  ]).catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll("link[rel=stylesheet]").forEach((el) => {
      const sheet = el as HTMLLinkElement;
      if (sheet.sheet) {
        try {
          for (let i = 0; i < sheet.sheet.cssRules.length; i++) {
            const rule = sheet.sheet.cssRules[i];
            if (rule instanceof CSSFontFaceRule) {
              rule.style.setProperty("font-display", "swap");
            }
          }
        } catch {}
      }
    });
  }).catch(() => {});
  await page.waitForTimeout(300);
}

async function injectCrashPrevention(page: Page): Promise<void> {
  await page.addInitScript(() => {
    Object.defineProperty(window, "WebTorrent", {
      get() { return undefined; },
      set() {},
      configurable: true,
    });
    const origCreateElement = document.createElement.bind(document);
    document.createElement = (tagName: string, options?: ElementCreationOptions) => {
      const el = origCreateElement(tagName, options);
      if (tagName === "video" || tagName === "VIDEO") {
        const origPlay = el.play.bind(el);
        el.play = () => Promise.resolve();
        el.load = () => {};
      }
      return el;
    };
    const origAppendChild = Node.prototype.appendChild;
    Node.prototype.appendChild = function (child: Node) {
      if ((child as HTMLScriptElement).src?.includes("webtorrent")) {
        return child;
      }
      return origAppendChild.call(this, child);
    };
  });
}

async function injectStableStyles(page: Page): Promise<void> {
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = `
      *, *::before, *::after {
        animation: none !important;
        animation-delay: 0s !important;
        transition: none !important;
        transition-delay: 0s !important;
      }
    `;
    document.head.appendChild(style);
  }).catch(() => {});
}

async function clearPersistentState(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  }).catch(() => {});
}

async function setupPageRouteBlocking(page: Page, pageName: string): Promise<void> {
  if (pageName === "Live-TV") {
    await blockAllStreamingRequests(page);
    await blockChannelLogoImages(page);
    await injectCrashPrevention(page);
  }
  if (pageName === "Gods-Eye") {
    await blockWebTorrent(page);
    await blockChannelLogoImages(page);
    await injectCrashPrevention(page);
  }
}

const WAIT_STRATEGIES: Record<string, WaitFn> = {
  Home: async (page) => {
    await page.locator("main#main-content").waitFor({ state: "attached", timeout: 15_000 }).catch(() => {});
    await page.locator("h2", { hasText: "Trending Today" })
      .or(page.locator("h2", { hasText: "Popular Movies" }))
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
    await page.locator("h2", { hasText: "Popular Movies" })
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {});
    await page.locator("h2", { hasText: "New Releases" })
      .waitFor({ state: "visible", timeout: 10_000 })
      .catch(() => {});
    await page.evaluate(() => {
      const section = document.querySelector("section");
      if (section) section.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      const dots = document.querySelectorAll("button");
      for (const btn of dots) {
        if (btn.closest("section") && btn.parentElement?.classList.contains("bottom-8")) {
          btn.click(); break;
        }
      }
      const imgs = section?.querySelectorAll("img");
      imgs?.forEach(img => { img.style.visibility = "hidden"; });
    }).catch(() => {});
    await stabilizeHeight(page);
  },

  Browse: async (page) => {
    await page.locator("h1", { hasText: "Browse" })
      .waitFor({ state: "visible", timeout: 20_000 })
      .catch(() => {});
    await page.locator("p", { hasText: "Showing" })
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  },

  Search: async (page) => {
    await page.locator("h1", { hasText: "Search" })
      .waitFor({ state: "visible", timeout: 20_000 })
      .catch(() => {});
    await page.locator("p.mb-6")
      .waitFor({ state: "attached", timeout: 15_000 })
      .catch(() => {});
  },

  Anime: async (page) => {
    await page.locator("h1", { hasText: "Anime" })
      .waitFor({ state: "visible", timeout: 20_000 })
      .catch(() => {});
    await page.locator("h2", { hasText: "Trending Anime" })
      .or(page.locator("section.home-section"))
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  },

  Watchlist: async (page) => {
    await page.locator("h1", { hasText: "Watchlist" })
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  },

  Dashboard: async (page) => {
    await page.locator("main.flex-1")
      .waitFor({ state: "attached", timeout: 20_000 })
      .catch(() => {});
    await page.locator("h2", { hasText: "RESUME WATCHING" })
      .or(page.locator("h2", { hasText: "Welcome back" }))
      .or(page.locator("h2", { hasText: "Theme" }))
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
    await stabilizeHeight(page);
  },

  Notifications: async (page) => {
    await page.locator("h1", { hasText: "Notifications" })
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  },

  "Live-TV": async (page) => {
    await page.locator("h2", { hasText: "Sri Lankan" })
      .or(page.locator("h2", { hasText: "International" }))
      .or(page.locator("h2", { hasText: "Featured" }))
      .first()
      .waitFor({ state: "visible", timeout: 25_000 })
      .catch(() => {});
    await page.locator("section.mb-14").first()
      .waitFor({ state: "attached", timeout: 15_000 })
      .catch(() => {});
    const cards = page.locator("section.mb-14 button[type=\"button\"]");
    const cardCount = await cards.count().catch(() => 0);
    if (cardCount > 0) {
      await cards.first().waitFor({ state: "visible", timeout: 10_000 }).catch(() => {});
    }
    await page.evaluate(() => {
      document.querySelectorAll("video").forEach((v) => { v.pause(); v.src = ""; });
    }).catch(() => {});
    await page.waitForTimeout(500);
  },

  "Gods-Eye": async (page) => {
    await page.locator("div.mx-auto.max-w-\\[980px\\]")
      .waitFor({ state: "attached", timeout: 20_000 })
      .catch(() => {});
    await page.locator("h1")
      .or(page.locator("button", { hasText: "Search" }))
      .first()
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
    await page.evaluate(() => {
      document.querySelectorAll("video").forEach((v) => { v.pause(); v.src = ""; });
    }).catch(() => {});
    await page.waitForTimeout(500);
  },

  Login: async (page) => {
    await page.locator("button", { hasText: "Sign In" })
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
  },

  Settings: async (page) => {
    await page.locator("h1", { hasText: "Settings" })
      .waitFor({ state: "visible", timeout: 15_000 })
      .catch(() => {});
    await ensureFontsReady(page);
  },
};

test.describe.configure({ mode: "parallel" });

for (const pageDef of ALL_PAGES) {
  const isDynamic = DYNAMIC_PAGES.includes(pageDef);
  const waitFn = WAIT_STRATEGIES[pageDef.name];

  test(`${pageDef.name} — ${pageDef.path}`, async ({ page }, testInfo) => {
    testInfo.setTimeout(90_000);

    await clearPersistentState(page);

    await setupPageRouteBlocking(page, pageDef.name);

    await page.goto(pageDef.path, {
      waitUntil: "domcontentloaded",
      timeout: 30_000,
    });

    if (waitFn) {
      await waitFn(page);
    }

    await ensureFontsReady(page);
    await injectStableStyles(page);

    await page.waitForTimeout(1000);

    const viewport = page.viewportSize();
    const isDesktop = viewport !== null && viewport.width >= 1024;
    const is820x1180 = viewport !== null && viewport.width === 820 && viewport.height === 1180;
    const fullPage = !isDesktop && !is820x1180;

    const pageTolerance =
      pageDef.name === "Live-TV" ? 0.15 :
      isDynamic ? 0.05 : 0.02;

    await expect(page).toHaveScreenshot({
      fullPage,
      animations: "disabled",
      timeout: 30_000,
      maxDiffPixelRatio: pageTolerance,
    });
  });
}

test.skip("Movie-Details — /movie/550 (skipped — external API dependency)", async () => {});
