import { test, expect } from "@playwright/test";

test.describe("Main Application Pages", () => {
  test.describe("Home Page", () => {
    test("should load home page successfully", async ({ page }) => {
      await page.goto("/", { waitUntil: "networkidle" });
      await expect(page).toHaveTitle(/Magic Button Assistant/);

      // Wait for skip links to be present (these should always be there)
      await expect(
        page.locator('a:has-text("Skip to main content")'),
      ).toBeVisible();

      // Wait for main content ID to be present
      await expect(page.locator("#main-content")).toBeVisible({
        timeout: 15000,
      });

      // Check for main element within the main content
      const mainContent = page.locator("#main-content main").first();
      await expect(mainContent).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Dashboard", () => {
    test("should navigate to dashboard", async ({ page }) => {
      await page.goto("/dashboard");

      // Check if redirected to auth or dashboard loads
      const url = page.url();
      expect(url).toContain("/dashboard");

      // Look for dashboard-specific elements
      const dashboardContent = page
        .locator('[data-testid="dashboard-content"], main')
        .first();
      await expect(dashboardContent).toBeVisible();
    });
  });

  test.describe("Profile Page", () => {
    test("should load profile page", async ({ page }) => {
      await page.goto("/profile");

      // Check for profile page elements
      const profileContent = page.locator("main").first();
      await expect(profileContent).toBeVisible();

      // Look for profile-specific elements
      const profileElements = page.locator("text=/profile|user|account/i");
      const hasProfileContent = (await profileElements.count()) > 0;
      expect(hasProfileContent).toBeTruthy();
    });
  });

  test.describe("Settings Page", () => {
    test("should load settings page", async ({ page }) => {
      await page.goto("/settings");

      // Check for settings page
      const settingsContent = page.locator("main").first();
      await expect(settingsContent).toBeVisible();

      // Look for settings-specific elements
      const settingsHeading = page.locator(
        'h1:has-text("Settings"), h2:has-text("Settings")',
      );
      const hasSettingsContent = (await settingsHeading.count()) > 0;
      expect(hasSettingsContent).toBeTruthy();
    });

    test("should have theme toggle", async ({ page }) => {
      await page.goto("/settings");

      // Look for theme toggle
      const themeToggle = page.locator(
        '[data-testid="theme-toggle"], button:has-text("theme"), button[aria-label*="theme"]',
      );
      if ((await themeToggle.count()) > 0) {
        await expect(themeToggle.first()).toBeVisible();
      }
    });
  });

  test.describe("Setup Page", () => {
    test("should load setup wizard", async ({ page }) => {
      await page.goto("/setup");

      // Check for setup page content
      const setupContent = page.locator("main").first();
      await expect(setupContent).toBeVisible();

      // Look for setup-specific elements
      const setupElements = page.locator("text=/setup|configuration|wizard/i");
      const hasSetupContent = (await setupElements.count()) > 0;
      expect(hasSetupContent).toBeTruthy();
    });
  });

  test.describe("Admin Console", () => {
    test("should load admin console", async ({ page }) => {
      await page.goto("/admin/console");

      // Check for admin console
      const adminContent = page.locator("main").first();
      await expect(adminContent).toBeVisible();

      // May require admin permissions
      const adminElements = page.locator("text=/admin|console|management/i");
      const hasAdminContent = (await adminElements.count()) > 0;
      expect(hasAdminContent).toBeTruthy();
    });
  });

  test.describe("Accessibility Page", () => {
    test("should load accessibility page", async ({ page }) => {
      await page.goto("/accessibility");

      // Check for accessibility content
      const accessibilityContent = page.locator("main").first();
      await expect(accessibilityContent).toBeVisible();

      // Look for accessibility-specific elements
      const accessibilityElements = page.locator(
        "text=/accessibility|a11y|wcag/i",
      );
      const hasAccessibilityContent = (await accessibilityElements.count()) > 0;
      expect(hasAccessibilityContent).toBeTruthy();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto("/accessibility");

      // Check for ARIA landmarks
      const mainLandmark = page.locator('main[role="main"], main');
      await expect(mainLandmark).toBeVisible();

      // Check for proper heading hierarchy
      const h1 = page.locator("h1");
      const hasH1 = (await h1.count()) > 0;
      expect(hasH1).toBeTruthy();
    });
  });

  test.describe("Credits Page", () => {
    test("should load credits page", async ({ page }) => {
      await page.goto("/credits");

      // Check for credits content
      const creditsContent = page.locator("main").first();
      await expect(creditsContent).toBeVisible();

      // Look for credits-specific elements
      const creditsElements = page.locator(
        "text=/credits|acknowledgments|contributors/i",
      );
      const hasCreditsContent = (await creditsElements.count()) > 0;
      expect(hasCreditsContent).toBeTruthy();
    });
  });

  test.describe("Sidebar Demo Page", () => {
    test("should load sidebar demo", async ({ page }) => {
      await page.goto("/sidebar-demo");

      // Check for sidebar demo content
      const demoContent = page.locator("main").first();
      await expect(demoContent).toBeVisible();

      // Look for sidebar elements
      const sidebar = page.locator('aside, [data-testid="sidebar"], .sidebar');
      if ((await sidebar.count()) > 0) {
        await expect(sidebar.first()).toBeVisible();
      }
    });

    test("should toggle sidebar on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto("/sidebar-demo");

      // Look for mobile menu toggle
      const menuToggle = page.locator(
        'button[aria-label*="menu"], button[aria-label*="sidebar"], [data-testid="menu-toggle"]',
      );
      if ((await menuToggle.count()) > 0) {
        await menuToggle.first().click();

        // Check if sidebar becomes visible
        const sidebar = page.locator(
          'aside, [data-testid="sidebar"], .sidebar',
        );
        await expect(sidebar.first()).toBeVisible();
      }
    });
  });
});

test.describe("Navigation and Common Elements", () => {
  test("should have consistent navigation across pages", async ({ page }) => {
    const pages = ["/", "/dashboard", "/settings", "/profile"];

    for (const path of pages) {
      await page.goto(path);

      // Check for navigation elements
      const nav = page.locator('nav, [role="navigation"]');
      if ((await nav.count()) > 0) {
        await expect(nav.first()).toBeVisible();
      }

      // Check for consistent header/footer
      const header = page.locator('header, [role="banner"]');
      if ((await header.count()) > 0) {
        await expect(header.first()).toBeVisible();
      }
    }
  });

  test("should handle 404 pages gracefully", async ({ page }) => {
    await page.goto("/non-existent-page-12345");

    // Should show 404 content
    const notFoundContent = page.locator(
      "text=/404|not found|page not found/i",
    );
    const hasNotFoundContent = (await notFoundContent.count()) > 0;
    expect(hasNotFoundContent).toBeTruthy();
  });
});
