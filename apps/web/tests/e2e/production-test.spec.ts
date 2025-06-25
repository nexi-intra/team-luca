import { test, expect } from "@playwright/test";

test.describe("Production Build Test", () => {
  test("should load and render basic page elements", async ({ page }) => {
    // Navigate to home page
    await page.goto("/");

    // Check if the page loads at all
    await expect(page).toHaveTitle(/Magic Button Assistant/);

    // Wait for body to be present
    await expect(page.locator("body")).toBeVisible();

    // Check for accessibility features that should always be present
    await expect(
      page.locator('a:has-text("Skip to main content")'),
    ).toBeVisible();

    // Check for any heading on the page
    const anyHeading = page.locator("h1, h2, h3, h4, h5, h6").first();
    await expect(anyHeading).toBeVisible({ timeout: 15000 });

    // Log page content for debugging
    const pageTitle = await page.title();
    console.log(`Page title: ${pageTitle}`);

    const bodyText = await page.locator("body").textContent();
    console.log(`Body contains text: ${bodyText?.substring(0, 200)}...`);
  });

  test("should have working accessibility features", async ({ page }) => {
    await page.goto("/");

    // Check accessibility button
    const accessibilityButton = page.locator(
      'button[aria-label*="accessibility"]',
    );
    await expect(accessibilityButton).toBeVisible();

    // Check skip links
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test("should navigate to different sections", async ({ page }) => {
    // Test basic navigation
    await page.goto("/docs");
    await expect(page).toHaveURL(/\/docs/);

    await page.goto("/magicbutton");
    await expect(page).toHaveURL(/\/magicbutton/);
  });
});
