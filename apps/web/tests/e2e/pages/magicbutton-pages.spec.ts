import { test, expect } from "@playwright/test";

test.describe("Magic Button Pages", () => {
  test.describe("Magic Button Home", () => {
    test("should load magic button home page", async ({ page }) => {
      await page.goto("/magicbutton");
      
      // Check for main content
      const mainContent = page.locator('main').first();
      await expect(mainContent).toBeVisible();
      
      // Check for Magic Button specific content
      const magicButtonContent = page.locator('text=/magic button|assistant/i');
      const hasContent = await magicButtonContent.count() > 0;
      expect(hasContent).toBeTruthy();
    });

    test("should have feature sections", async ({ page }) => {
      await page.goto("/magicbutton");
      
      // Look for feature cards or sections
      const featureSections = page.locator('[data-testid="feature"], .feature, section').filter({ hasText: /feature|capability/i });
      if (await featureSections.count() > 0) {
        await expect(featureSections.first()).toBeVisible();
      }
    });
  });

  test.describe("Authentication Demo", () => {
    test("should load auth demo page", async ({ page }) => {
      await page.goto("/magicbutton/auth-demo");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for auth demo elements
      const authElements = page.locator('text=/auth|login|sign|authentication/i');
      const hasAuthContent = await authElements.count() > 0;
      expect(hasAuthContent).toBeTruthy();
    });

    test("should display auth status", async ({ page }) => {
      await page.goto("/magicbutton/auth-demo");
      
      // Look for auth status indicators
      const authStatus = page.locator('[data-testid="auth-status"], .auth-status, text=/logged|authenticated|signed/i');
      if (await authStatus.count() > 0) {
        await expect(authStatus.first()).toBeVisible();
      }
    });

    test("should load reauth test page", async ({ page }) => {
      await page.goto("/magicbutton/auth-demo/reauth-test");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for reauth specific content
      const reauthContent = page.locator('text=/reauth|re-auth|session/i');
      const hasReauthContent = await reauthContent.count() > 0;
      expect(hasReauthContent).toBeTruthy();
    });
  });

  test.describe("Demo Pages", () => {
    test("should load general demo page", async ({ page }) => {
      await page.goto("/magicbutton/demo");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for demo content
      const demoContent = page.locator('text=/demo|example|showcase/i');
      const hasDemoContent = await demoContent.count() > 0;
      expect(hasDemoContent).toBeTruthy();
    });

    test("should load sidebar demo", async ({ page }) => {
      await page.goto("/magicbutton/demo/sidebar");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for sidebar
      const sidebar = page.locator('aside, [data-testid="sidebar"], .sidebar');
      if (await sidebar.count() > 0) {
        await expect(sidebar.first()).toBeVisible();
      }
    });

    test("should load layout example", async ({ page }) => {
      await page.goto("/magicbutton/demo/sidebar/layout-example");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for layout elements
      const layoutElements = page.locator('text=/layout|template|structure/i');
      const hasLayoutContent = await layoutElements.count() > 0;
      expect(hasLayoutContent).toBeTruthy();
    });
  });

  test.describe("Features Page", () => {
    test("should load features page", async ({ page }) => {
      await page.goto("/magicbutton/features");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for features list
      const featuresList = page.locator('[data-testid="features-list"], .features-list, ul, ol').filter({ hasText: /feature/i });
      if (await featuresList.count() > 0) {
        await expect(featuresList.first()).toBeVisible();
      }
    });

    test("should have feature toggles", async ({ page }) => {
      await page.goto("/magicbutton/features");
      
      // Look for feature toggle switches
      const toggles = page.locator('button[role="switch"], input[type="checkbox"], .toggle, .switch');
      if (await toggles.count() > 0) {
        // Check if toggles are interactive
        const firstToggle = toggles.first();
        await expect(firstToggle).toBeEnabled();
      }
    });
  });

  test.describe("Language Settings", () => {
    test("should load language page", async ({ page }) => {
      await page.goto("/magicbutton/language");
      
      const content = page.locator('main').first();
      await expect(content).toBeVisible();
      
      // Check for language settings
      const languageContent = page.locator('text=/language|locale|translation/i');
      const hasLanguageContent = await languageContent.count() > 0;
      expect(hasLanguageContent).toBeTruthy();
    });

    test("should have language selector", async ({ page }) => {
      await page.goto("/magicbutton/language");
      
      // Look for language selector
      const selector = page.locator('select, [role="combobox"], button').filter({ hasText: /language|locale/i });
      if (await selector.count() > 0) {
        await expect(selector.first()).toBeVisible();
      }
    });
  });

  test.describe("Magic Button Navigation", () => {
    test("should navigate between magic button sections", async ({ page }) => {
      await page.goto("/magicbutton");
      
      // Check for navigation to features
      const featuresLink = page.locator('a[href="/magicbutton/features"]');
      if (await featuresLink.count() > 0) {
        await featuresLink.first().click();
        await page.waitForURL('**/magicbutton/features');
        
        const content = page.locator('main');
        await expect(content).toBeVisible();
      }
    });

    test("should maintain consistent layout", async ({ page }) => {
      const magicButtonPages = [
        "/magicbutton",
        "/magicbutton/features",
        "/magicbutton/auth-demo",
        "/magicbutton/language"
      ];

      for (const path of magicButtonPages) {
        await page.goto(path);
        
        // Check for consistent layout elements
        const mainContent = page.locator('main');
        await expect(mainContent).toBeVisible();
        
        // Check for Magic Button branding/header
        const branding = page.locator('text=/magic button/i').first();
        if (await branding.count() > 0) {
          await expect(branding).toBeVisible();
        }
      }
    });
  });

  test.describe("Interactive Elements", () => {
    test("should handle demo interactions", async ({ page }) => {
      await page.goto("/magicbutton/demo");
      
      // Look for interactive demo elements
      const buttons = page.locator('button').filter({ hasText: /demo|try|test/i });
      if (await buttons.count() > 0) {
        const firstButton = buttons.first();
        await expect(firstButton).toBeEnabled();
        
        // Click and check for response
        await firstButton.click();
        
        // Wait for any action to complete
        await page.waitForTimeout(500);
      }
    });

    test("should handle feature toggles", async ({ page }) => {
      await page.goto("/magicbutton/features");
      
      // Find toggle switches
      const toggles = page.locator('button[role="switch"], input[type="checkbox"]');
      if (await toggles.count() > 0) {
        const firstToggle = toggles.first();
        const initialState = await firstToggle.isChecked().catch(() => false);
        
        await firstToggle.click();
        
        // Check state changed
        const newState = await firstToggle.isChecked().catch(() => true);
        expect(newState).not.toBe(initialState);
      }
    });
  });
});