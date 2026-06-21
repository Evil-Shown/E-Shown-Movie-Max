import { extractStreamUrlsFromContent } from "@/lib/live-tv/stream-scraper";
import type { ScrapeTarget } from "@/lib/live-tv/stream-scraper";
import {
  buildRotatedBrowserHeaders,
  pickUserAgentForAttempt,
} from "@/lib/live-tv/stream-headers";

const M3U8_RE = /\.m3u8/i;

function collectM3u8(url: string, bucket: Set<string>) {
  if (M3U8_RE.test(url) && url.startsWith("http")) bucket.add(url);
}

function collectFromManifestBody(text: string, bucket: Set<string>) {
  if (!text.trimStart().startsWith("#EXTM3U")) return;
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.startsWith("http")) {
      collectM3u8(trimmed, bucket);
    }
  }
  for (const url of extractStreamUrlsFromContent(text)) bucket.add(url);
}

/** Headless browser scrape — intercepts and inspects network traffic for manifests */
export async function scrapePageWithBrowser(target: ScrapeTarget): Promise<string[]> {
  const puppeteer = await import("puppeteer").catch(() => null);
  if (!puppeteer) return [];

  const found = new Set<string>();
  let browser;

  try {
    browser = await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    });

    const page = await browser.newPage();
    await page.setUserAgent(pickUserAgentForAttempt(0));
    await page.setExtraHTTPHeaders(
      buildRotatedBrowserHeaders({
        referer: target.referer,
        origin: target.origin,
        allowDecoyReferer: true,
      })
    );

    const cookies = process.env.STREAM_UPSTREAM_COOKIES;
    if (cookies) {
      try {
        const origin = target.origin ?? new URL(target.pageUrl).origin;
        const parsed = new URL(origin);
        const pairs = cookies.split(";").map((c) => c.trim()).filter(Boolean);
        await page.setCookie(
          ...pairs.map((pair) => {
            const eq = pair.indexOf("=");
            const name = eq > 0 ? pair.slice(0, eq) : pair;
            const value = eq > 0 ? pair.slice(eq + 1) : "";
            return { name, value, domain: parsed.hostname, path: "/" };
          })
        );
      } catch {
        // ignore cookie parse errors
      }
    }

    await page.setRequestInterception(true);

    page.on("request", (req) => {
      collectM3u8(req.url(), found);

      const headers = {
        ...req.headers(),
        ...buildRotatedBrowserHeaders({
          referer: target.referer ?? target.pageUrl,
          origin: target.origin,
          allowDecoyReferer: true,
        }),
      };

      req.continue({ headers }).catch(() => req.continue().catch(() => undefined));
    });

    page.on("response", async (res) => {
      const url = res.url();
      collectM3u8(url, found);

      const type = res.headers()["content-type"] ?? "";
      const isManifest =
        M3U8_RE.test(url) ||
        type.includes("mpegurl") ||
        type.includes("json") ||
        type.includes("text");

      if (!isManifest) return;

      try {
        const text = await res.text();
        if (M3U8_RE.test(url)) collectFromManifestBody(text, found);
        for (const extracted of extractStreamUrlsFromContent(text)) found.add(extracted);
      } catch {
        // response body may be unavailable
      }
    });

    await page.goto(target.pageUrl, {
      waitUntil: "networkidle2",
      timeout: 30_000,
    });

    const domUrls = await page.evaluate(() => {
      const urls: string[] = [];
      document.querySelectorAll("video, source, iframe").forEach((el) => {
        for (const attr of ["src", "data-src", "data-url"]) {
          const value = el.getAttribute(attr);
          if (value?.includes(".m3u8")) urls.push(value);
        }
        const video = el as HTMLVideoElement;
        if (video.src?.includes(".m3u8")) urls.push(video.src);
      });
      return urls;
    });

    for (const url of domUrls) collectM3u8(url, found);

    const html = await page.content();
    for (const url of extractStreamUrlsFromContent(html)) found.add(url);
  } catch {
    return [];
  } finally {
    await browser?.close().catch(() => undefined);
  }

  return [...found];
}

export async function scrapePagesWithBrowser(targets: ScrapeTarget[]): Promise<string[]> {
  const results = await Promise.all(targets.map((t) => scrapePageWithBrowser(t)));
  return [...new Set(results.flat())];
}

export function isBrowserScraperEnabled(): boolean {
  return process.env.STREAM_SCRAPER_BROWSER === "1";
}
