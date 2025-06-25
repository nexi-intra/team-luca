import { test, expect } from "@playwright/test";

test.describe("Documentation Pages", () => {
  test.describe("Documentation Home", () => {
    test("should load docs home page", async ({ page }) => {
      await page.goto("/docs");

      // Check for docs layout
      const docsContent = page.locator("main").first();
      await expect(docsContent).toBeVisible();

      // Check for documentation navigation
      const docsNav = page
        .locator("nav, aside")
        .filter({ hasText: /documentation|docs/i });
      if ((await docsNav.count()) > 0) {
        await expect(docsNav.first()).toBeVisible();
      }
    });
  });

  test.describe("Admin Documentation", () => {
    const adminPages = [
      { path: "/docs/admins/access-control", title: "Access Control" },
      { path: "/docs/admins/audit-logs", title: "Audit Logs" },
      { path: "/docs/admins/backup", title: "Backup" },
      { path: "/docs/admins/performance", title: "Performance" },
      { path: "/docs/admins/security", title: "Security" },
      { path: "/docs/admins/setup", title: "Setup" },
      { path: "/docs/admins/user-management", title: "User Management" },
    ];

    for (const { path, title } of adminPages) {
      test(`should load ${title} page`, async ({ page }) => {
        await page.goto(path);

        const content = page.locator("main").first();
        await expect(content).toBeVisible();

        // Check for relevant content
        const pageContent = page.locator(`text=/${title}/i`);
        const hasContent = (await pageContent.count()) > 0;
        expect(hasContent).toBeTruthy();
      });
    }
  });

  test.describe("Compliance Documentation", () => {
    const compliancePages = [
      { path: "/docs/compliance/audit-reports", title: "Audit Reports" },
      { path: "/docs/compliance/data-protection", title: "Data Protection" },
      { path: "/docs/compliance/gdpr", title: "GDPR" },
      { path: "/docs/compliance/hipaa", title: "HIPAA" },
      {
        path: "/docs/compliance/incident-response",
        title: "Incident Response",
      },
      {
        path: "/docs/compliance/security-overview",
        title: "Security Overview",
      },
      {
        path: "/docs/compliance/security-policies",
        title: "Security Policies",
      },
      { path: "/docs/compliance/soc2", title: "SOC2" },
    ];

    for (const { path, title } of compliancePages) {
      test(`should load ${title} page`, async ({ page }) => {
        await page.goto(path);

        const content = page.locator("main").first();
        await expect(content).toBeVisible();

        // Check for compliance-related content
        const pageContent = page.locator(`text=/${title}|compliance/i`);
        const hasContent = (await pageContent.count()) > 0;
        expect(hasContent).toBeTruthy();
      });
    }
  });

  test.describe("Developer Documentation", () => {
    const developerPages = [
      { path: "/docs/developers/api-overview", title: "API Overview" },
      { path: "/docs/developers/examples", title: "Examples" },
      { path: "/docs/developers/extensions", title: "Extensions" },
      { path: "/docs/developers/graphql", title: "GraphQL" },
      { path: "/docs/developers/rest-api", title: "REST API" },
      { path: "/docs/developers/sdk", title: "SDK" },
      { path: "/docs/developers/webhooks", title: "Webhooks" },
    ];

    for (const { path, title } of developerPages) {
      test(`should load ${title} page`, async ({ page }) => {
        await page.goto(path);

        const content = page.locator("main").first();
        await expect(content).toBeVisible();

        // Check for developer-related content
        const pageContent = page.locator(`text=/${title}|api|developer/i`);
        const hasContent = (await pageContent.count()) > 0;
        expect(hasContent).toBeTruthy();
      });
    }
  });

  test.describe("Power Users Documentation", () => {
    const powerUserPages = [
      {
        path: "/docs/power-users/advanced-features",
        title: "Advanced Features",
      },
      { path: "/docs/power-users/automation", title: "Automation" },
      { path: "/docs/power-users/data-management", title: "Data Management" },
      { path: "/docs/power-users/integrations", title: "Integrations" },
      { path: "/docs/power-users/shortcuts", title: "Shortcuts" },
      { path: "/docs/power-users/workflows", title: "Workflows" },
    ];

    for (const { path, title } of powerUserPages) {
      test(`should load ${title} page`, async ({ page }) => {
        await page.goto(path);

        const content = page.locator("main").first();
        await expect(content).toBeVisible();

        const pageContent = page.locator(`text=/${title}/i`);
        const hasContent = (await pageContent.count()) > 0;
        expect(hasContent).toBeTruthy();
      });
    }
  });

  test.describe("System Admin Documentation", () => {
    const sysAdminPages = [
      { path: "/docs/system-admins/database", title: "Database" },
      { path: "/docs/system-admins/deployment", title: "Deployment" },
      {
        path: "/docs/system-admins/disaster-recovery",
        title: "Disaster Recovery",
      },
      { path: "/docs/system-admins/infrastructure", title: "Infrastructure" },
      { path: "/docs/system-admins/monitoring", title: "Monitoring" },
      { path: "/docs/system-admins/network", title: "Network" },
      { path: "/docs/system-admins/scaling", title: "Scaling" },
    ];

    for (const { path, title } of sysAdminPages) {
      test(`should load ${title} page`, async ({ page }) => {
        await page.goto(path);

        const content = page.locator("main").first();
        await expect(content).toBeVisible();

        const pageContent = page.locator(`text=/${title}/i`);
        const hasContent = (await pageContent.count()) > 0;
        expect(hasContent).toBeTruthy();
      });
    }
  });

  test.describe("User Documentation", () => {
    const userPages = [
      { path: "/docs/users/best-practices", title: "Best Practices" },
      { path: "/docs/users/common-tasks", title: "Common Tasks" },
      { path: "/docs/users/faq", title: "FAQ" },
      { path: "/docs/users/features", title: "Features" },
      { path: "/docs/users/getting-started", title: "Getting Started" },
      { path: "/docs/users/troubleshooting", title: "Troubleshooting" },
    ];

    for (const { path, title } of userPages) {
      test(`should load ${title} page`, async ({ page }) => {
        await page.goto(path);

        const content = page.locator("main").first();
        await expect(content).toBeVisible();

        const pageContent = page.locator(`text=/${title}/i`);
        const hasContent = (await pageContent.count()) > 0;
        expect(hasContent).toBeTruthy();
      });
    }
  });

  test.describe("Documentation Navigation", () => {
    test("should have working sidebar navigation", async ({ page }) => {
      await page.goto("/docs");

      // Look for documentation sidebar
      const sidebar = page
        .locator('aside, [role="navigation"]')
        .filter({ hasText: /docs|documentation/i });
      if ((await sidebar.count()) > 0) {
        await expect(sidebar.first()).toBeVisible();

        // Check for navigation links
        const navLinks = sidebar.first().locator("a");
        const linkCount = await navLinks.count();
        expect(linkCount).toBeGreaterThan(0);
      }
    });

    test("should navigate between doc sections", async ({ page }) => {
      await page.goto("/docs");

      // Try to navigate to a subsection
      const firstLink = page.locator('a[href^="/docs/"]').first();
      if ((await firstLink.count()) > 0) {
        const href = await firstLink.getAttribute("href");
        await firstLink.click();

        // Check navigation occurred
        await page.waitForURL(`**${href}`);
        const content = page.locator("main").first();
        await expect(content).toBeVisible();
      }
    });
  });
});
