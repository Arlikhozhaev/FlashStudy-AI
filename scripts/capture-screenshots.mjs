import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? "https://flash-study-ai.vercel.app";
const OUTPUT_DIR = path.join(process.cwd(), "docs", "screenshots");

const PAGES = [
  { name: "landing", path: "/", waitMs: 1500 },
  { name: "generate", path: "/generate", waitMs: 1500 },
  { name: "sign-in", path: "/sign-in", waitMs: 2000 },
];

async function captureScreenshots() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  for (const entry of PAGES) {
    await page.goto(`${BASE_URL}${entry.path}`, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });
    await page.waitForTimeout(entry.waitMs);

    await page.screenshot({
      path: path.join(OUTPUT_DIR, `${entry.name}.png`),
      fullPage: false,
    });

    console.log(`Saved ${entry.name}.png`);
  }

  await browser.close();
}

captureScreenshots().catch((error) => {
  console.error(error);
  process.exit(1);
});
