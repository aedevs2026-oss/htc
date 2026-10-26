import { expect, test } from "@playwright/test";

async function assertNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const doc = document.documentElement;
    return doc.scrollWidth - doc.clientWidth;
  });
  expect(overflow, "page should not scroll horizontally").toBeLessThanOrEqual(1);
}

test.describe("Homepage responsive layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/", { waitUntil: "networkidle" });
  });

  test("hero and primary CTAs are visible", async ({ page }) => {
    const hero = page.locator(".home-page .hero-section");
    await expect(hero).toBeVisible();

    const heading = page.getByRole("heading", { name: /spaces that/i, level: 1 });
    await expect(heading).toBeVisible();

    await expect(page.getByRole("link", { name: /browse catalogue/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /find a dealer/i }).first()).toBeVisible();
  });

  test("key sections render without horizontal overflow", async ({ page }) => {
    await assertNoHorizontalOverflow(page);

    const container = page.locator(".home-page .site-container").first();
    const box = await container.boundingBox();
    const viewport = page.viewportSize();
    if (box && viewport) {
      const gutter = (viewport.width - box.width) / 2;
      expect(gutter).toBeGreaterThanOrEqual(14);
      expect(gutter).toBeLessThanOrEqual(28);
    }

    await expect(page.getByRole("heading", { name: /shop by category/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /explore by room/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /featured catalogue pieces/i })).toBeVisible();
    await expect(page.getByRole("heading", { name: /stay inspired/i })).toBeVisible();

    const categoryCards = page.locator(".home-page .category-grid .category-card");
    await expect(categoryCards.first()).toBeVisible();
    expect(await categoryCards.count()).toBeGreaterThanOrEqual(2);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await assertNoHorizontalOverflow(page);
  });

  test("images load in hero and editorial bands", async ({ page }) => {
    const heroImg = page.locator(".home-page .hero-section img").first();
    await expect(heroImg).toBeVisible();
    const heroWidth = await heroImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(heroWidth).toBeGreaterThan(0);

    const importedImg = page.locator(".home-page .imported-image img");
    await importedImg.scrollIntoViewIfNeeded();
    await expect(importedImg).toBeVisible();
    const importedWidth = await importedImg.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(importedWidth).toBeGreaterThan(0);
  });

  test("mobile navigation bar visibility", async ({ page }, testInfo) => {
    const tabBar = page.locator(".mobile-tab-bar");
    if (testInfo.project.name === "mobile") {
      await expect(tabBar).toBeVisible();
      await expect(tabBar.getByRole("link", { name: "Home" })).toBeVisible();
    } else {
      await expect(tabBar).toBeHidden();
    }
  });

  test("grids use expected column counts", async ({ page }, testInfo) => {
    const categoryCols = await page.locator(".home-page .category-grid").evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });
    const productCols = await page.locator(".home-page .product-grid").evaluate((el) => {
      return getComputedStyle(el).gridTemplateColumns.split(" ").length;
    });

    if (testInfo.project.name === "mobile") {
      expect(categoryCols).toBe(2);
      expect(productCols).toBe(2);
    } else {
      expect(categoryCols).toBeGreaterThanOrEqual(3);
      expect(productCols).toBeGreaterThanOrEqual(2);
    }
  });

  test("touch targets for hero buttons meet minimum size", async ({ page }, testInfo) => {
    if (testInfo.project.name !== "mobile") return;

    const buttons = page.locator(".home-page .hero-section .button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });
});
