import { test, expect } from "@playwright/test";

test.describe("App Navigation", () => {
  test("should navigate to the home page", async ({ page }) => {
    await page.goto("/");

    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/Magic Button Assistant/);

    // Check if main content is visible
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });

  test("should have working navigation links", async ({ page }) => {
    await page.goto("/");

    // Look for navigation elements if they exist
    const nav = page.locator("nav");
    if (await nav.isVisible()) {
      const links = nav.locator("a");
      const count = await links.count();

      for (let i = 0; i < count; i++) {
        const link = links.nth(i);
        await expect(link).toBeVisible();
      }
    }
  });

  test("should display authentication components", async ({ page }) => {
    await page.goto("/");

    // Check for auth-related elements (login button, user menu, etc.)
    const authElements = page.locator('[data-testid="auth-component"]');
    if ((await authElements.count()) > 0) {
      await expect(authElements.first()).toBeVisible();
    }
  });
});

test.describe("Responsive Design", () => {
  test("should be mobile responsive", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Check if the page adapts to mobile view
    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();

    // Mobile menu should be available if implemented
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    if ((await mobileMenu.count()) > 0) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test("should handle tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    const mainContent = page.locator("main");
    await expect(mainContent).toBeVisible();
  });
});

test.describe("Performance", () => {
  test("should load within acceptable time", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;

    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have no console errors", async ({ page }) => {
    const errors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");

    // Wait for any async operations
    await page.waitForTimeout(1000);

    // Should have no console errors
    expect(errors).toHaveLength(0);
  });
});
