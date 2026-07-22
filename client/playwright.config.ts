import { defineConfig } from "@playwright/test";

const MOBILE_TABLET_VIEWPORTS = [
  { name: "320x568", width: 320, height: 568 },
  { name: "375x667", width: 375, height: 667 },
  { name: "390x844", width: 390, height: 844 },
  { name: "414x896", width: 414, height: 896 },
  { name: "768x1024", width: 768, height: 1024 },
  { name: "820x1180", width: 820, height: 1180 },
];

const DESKTOP_VIEWPORTS = [
  { name: "1024x768", width: 1024, height: 768 },
  { name: "1366x768", width: 1366, height: 768 },
  { name: "1920x1080", width: 1920, height: 1080 },
];

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  timeout: 120_000,
  expect: {
    timeout: 20_000,
    toHaveScreenshot: {
      animations: "disabled",
      maxDiffPixelRatio: 0.02,
      threshold: 0.2,
    },
  },
  retries: 1,
  workers: 1,
  reporter: [["html", { outputFolder: "playwright-report" }], ["list"]],
  outputDir: "test-results",

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "off",
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
    locale: "en-US",
    timezoneId: "America/New_York",
    colorScheme: "dark",
    launchOptions: {
      args: [
        "--disable-gpu",
        "--disable-dev-shm-usage",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-background-networking",
        "--disable-component-update",
        "--disable-sync",
        "--disable-software-rasterizer",
        "--js-flags=--max-old-space-size=4096",
        "--disable-features=VizDisplayCompositor",
        "--use-gl=angle",
        "--use-angle=swiftshader",
      ],
    },
  },

  projects: [
    ...MOBILE_TABLET_VIEWPORTS.map((vp) => ({
      name: vp.name,
      use: {
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: vp.name === "820x1180" ? 1 : 2,
      },
    })),
    ...DESKTOP_VIEWPORTS.map((vp) => ({
      name: vp.name,
      use: {
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 1,
      },
    })),
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 120_000,
    cwd: ".",
  },
});
