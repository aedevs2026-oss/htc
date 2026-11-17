import { expect, test } from "@playwright/test";

test.describe("Dealer location popup", () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.sessionStorage.removeItem("htc-dealer-location-prompt-dismissed");
    });
    await page.goto("/", { waitUntil: "domcontentloaded" });
  });

  test("modal fits within the viewport", async ({ page }) => {
    const modal = page.locator(".dealer-location-modal");
    await expect(modal).toBeVisible({ timeout: 15_000 });

    const viewport = page.viewportSize();
    expect(viewport).not.toBeNull();

    const box = await modal.boundingBox();
    expect(box).not.toBeNull();
    if (!box || !viewport) return;

    expect(box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.x).toBeGreaterThanOrEqual(-1);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
    expect(box.y).toBeGreaterThanOrEqual(-1);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 2);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
  });

  test("primary action and search field stay visible", async ({ page }) => {
    const modal = page.locator(".dealer-location-modal");
    await expect(modal).toBeVisible({ timeout: 15_000 });

    await expect(modal.getByRole("link", { name: /dealers on map|nearby dealers/i })).toBeVisible();
    await expect(modal.getByPlaceholder("Enter city or PIN code")).toBeVisible();
    await expect(modal.getByRole("button", { name: "Maybe later" })).toBeVisible();
  });
});
