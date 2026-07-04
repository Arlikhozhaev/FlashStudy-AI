import { expect, test } from "@playwright/test";

test("landing page renders hero and pricing", async ({ page }, testInfo) => {
  testInfo.skip(!!process.env.CI, "Requires valid Clerk keys outside CI");

  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: /turn notes into beautiful flashcards/i,
    }),
  ).toBeVisible();

  await expect(page.getByRole("heading", { name: /simple, enforced pricing/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /choose plan/i }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: /start studying/i })).toBeVisible();
});

test("pricing section exposes all subscription tiers", async ({ page }, testInfo) => {
  testInfo.skip(!!process.env.CI, "Requires valid Clerk keys outside CI");

  await page.goto("/#pricing");

  await expect(page.getByText("Basic")).toBeVisible();
  await expect(page.getByText("Standard")).toBeVisible();
  await expect(page.getByText("Premium")).toBeVisible();
  await expect(page.getByText("$4.99 / month")).toBeVisible();
});
