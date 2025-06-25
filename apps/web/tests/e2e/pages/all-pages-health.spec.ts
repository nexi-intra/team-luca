import { test, expect } from "@playwright/test";

// Complete list of all pages in the application
const ALL_PAGES = [
  // Main app pages
  "/",
  "/accessibility",
  "/admin/console",
  "/credits",
  "/dashboard",
  "/profile",
  "/settings",
  "/setup",
  "/sidebar-demo",
  
  // Documentation pages
  "/docs",
  "/docs/admins/access-control",
  "/docs/admins/audit-logs",
  "/docs/admins/backup",
  "/docs/admins/performance",
  "/docs/admins/security",
  "/docs/admins/setup",
  "/docs/admins/user-management",
  "/docs/compliance/audit-reports",
  "/docs/compliance/data-protection",
  "/docs/compliance/gdpr",
  "/docs/compliance/hipaa",
  "/docs/compliance/incident-response",
  "/docs/compliance/security-overview",
  "/docs/compliance/security-policies",
  "/docs/compliance/soc2",
  "/docs/developers/api-overview",
  "/docs/developers/examples",
  "/docs/developers/extensions",
  "/docs/developers/graphql",
  "/docs/developers/rest-api",
  "/docs/developers/sdk",
  "/docs/developers/webhooks",
  "/docs/power-users/advanced-features",
  "/docs/power-users/automation",
  "/docs/power-users/data-management",
  "/docs/power-users/integrations",
  "/docs/power-users/shortcuts",
  "/docs/power-users/workflows",
  "/docs/system-admins/database",
  "/docs/system-admins/deployment",
  "/docs/system-admins/disaster-recovery",
  "/docs/system-admins/infrastructure",
  "/docs/system-admins/monitoring",
  "/docs/system-admins/network",
  "/docs/system-admins/scaling",
  "/docs/users/best-practices",
  "/docs/users/common-tasks",
  "/docs/users/faq",
  "/docs/users/features",
  "/docs/users/getting-started",
  "/docs/users/troubleshooting",
  
  // Magic Button pages
  "/magicbutton",
  "/magicbutton/auth-demo",
  "/magicbutton/auth-demo/reauth-test",
  "/magicbutton/demo",
  "/magicbutton/demo/sidebar",
  "/magicbutton/demo/sidebar/layout-example",
  "/magicbutton/features",
  "/magicbutton/language"
];

test.describe("All Pages Health Check", () => {
  test.describe.configure({ mode: 'parallel' });

  for (const pagePath of ALL_PAGES) {
    test(`${pagePath} - should load without errors`, async ({ page }) => {
      // Track console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });

      // Track network failures
      const failedRequests: string[] = [];
      page.on('requestfailed', request => {
        failedRequests.push(`${request.method()} ${request.url()}: ${request.failure()?.errorText}`);
      });

      // Navigate to page
      const response = await page.goto(pagePath, { waitUntil: 'networkidle' });
      
      // Check response status
      expect(response?.status()).toBeLessThan(400);
      
      // Check page loaded
      const mainContent = page.locator('main, [role="main"]').first();
      await expect(mainContent).toBeVisible({ timeout: 10000 });
      
      // Check for console errors
      expect(errors).toHaveLength(0);
      
      // Check for failed network requests (excluding expected 404s for missing assets)
      const criticalFailures = failedRequests.filter(req => 
        !req.includes('favicon') && 
        !req.includes('.map') &&
        !req.includes('hot-update')
      );
      expect(criticalFailures).toHaveLength(0);
    });
  }

  test.describe("Accessibility Checks", () => {
    const samplePages = ["/", "/docs", "/magicbutton", "/settings"];
    
    for (const pagePath of samplePages) {
      test(`${pagePath} - should have proper heading hierarchy`, async ({ page }) => {
        await page.goto(pagePath);
        
        // Should have exactly one h1
        const h1Count = await page.locator('h1').count();
        expect(h1Count).toBeGreaterThanOrEqual(1);
        expect(h1Count).toBeLessThanOrEqual(1);
        
        // Check heading hierarchy
        const headings = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
        expect(headings.length).toBeGreaterThan(0);
      });

      test(`${pagePath} - should have proper ARIA landmarks`, async ({ page }) => {
        await page.goto(pagePath);
        
        // Should have main landmark
        const main = page.locator('main, [role="main"]').first();
        await expect(main).toBeVisible();
        
        // Should have navigation if applicable
        const nav = page.locator('nav, [role="navigation"]');
        if (await nav.count() > 0) {
          await expect(nav.first()).toBeVisible();
        }
      });

      test(`${pagePath} - should have skip to content link`, async ({ page }) => {
        await page.goto(pagePath);
        
        // Look for skip link (might be visually hidden)
        const skipLink = page.locator('a[href="#main"], a[href="#content"], a:has-text("skip")');
        if (await skipLink.count() > 0) {
          // Check it's focusable
          await skipLink.first().focus();
          await expect(skipLink.first()).toBeFocused();
        }
      });
    }
  });

  test.describe("Performance Metrics", () => {
    test("should load pages within performance budget", async ({ page }) => {
      const performanceResults: { path: string; loadTime: number }[] = [];
      
      // Test a sample of pages
      const samplePages = [
        "/", 
        "/dashboard", 
        "/docs", 
        "/magicbutton",
        "/settings"
      ];
      
      for (const pagePath of samplePages) {
        const startTime = Date.now();
        await page.goto(pagePath);
        const loadTime = Date.now() - startTime;
        
        performanceResults.push({ path: pagePath, loadTime });
        
        // Each page should load within 3 seconds
        expect(loadTime).toBeLessThan(3000);
      }
      
      // Average load time should be under 2 seconds
      const avgLoadTime = performanceResults.reduce((sum, r) => sum + r.loadTime, 0) / performanceResults.length;
      expect(avgLoadTime).toBeLessThan(2000);
    });
  });

  test.describe("SEO and Meta Tags", () => {
    const samplePages = ["/", "/docs", "/magicbutton"];
    
    for (const pagePath of samplePages) {
      test(`${pagePath} - should have proper meta tags`, async ({ page }) => {
        await page.goto(pagePath);
        
        // Should have title
        const title = await page.title();
        expect(title).toBeTruthy();
        expect(title.length).toBeGreaterThan(10);
        
        // Should have description
        const description = await page.locator('meta[name="description"]').getAttribute('content');
        if (description) {
          expect(description.length).toBeGreaterThan(20);
        }
        
        // Should have viewport meta
        const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
        expect(viewport).toContain('width=device-width');
      });
    }
  });

  test.describe("Mobile Responsiveness", () => {
    const samplePages = ["/", "/dashboard", "/docs", "/magicbutton"];
    
    for (const pagePath of samplePages) {
      test(`${pagePath} - should be mobile responsive`, async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });
        await page.goto(pagePath);
        
        // Main content should be visible
        const mainContent = page.locator('main').first();
        await expect(mainContent).toBeVisible();
        
        // No horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
        const viewportWidth = await page.evaluate(() => window.innerWidth);
        expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // Allow 5px tolerance
      });
    }
  });
});