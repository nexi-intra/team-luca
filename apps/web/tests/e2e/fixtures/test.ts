import { test as base, expect, Page } from '@playwright/test';
import { DIContainer, ServiceTokens } from '@/lib/di/container';
import { factories } from '@/tests/factories';

interface TestFixtures {
  testUser: Awaited<ReturnType<typeof factories.user.create>>;
  authenticatedPage: Page;
  container: DIContainer;
}

export const test = base.extend<TestFixtures>({
  testUser: async ({}, use) => {
    const user = await factories.user.create({
      email: 'test@example.com',
      name: 'Test User',
      role: 'user',
      featureRing: 4,
    });
    await use(user);
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await page.addInitScript((user: any) => {
      localStorage.setItem('test-user', JSON.stringify(user));
      localStorage.setItem('feature-ring', user.featureRing.toString());
    }, testUser);
    
    await use(page);
  },

  container: async ({}, use) => {
    const container = DIContainer.createTestContainer();
    await use(container);
  },
});

export { expect };

export const selectors = {
  featureGate: (featureId: string) => `[data-feature-id="${featureId}"]`,
  ringSelector: '[data-testid="feature-ring-selector"]',
  loginButton: '[data-testid="login-button"]',
  logoutButton: '[data-testid="logout-button"]',
  userMenu: '[data-testid="user-menu"]',
};