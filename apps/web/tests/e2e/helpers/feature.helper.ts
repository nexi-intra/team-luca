import { Page } from "@playwright/test";
import { FeatureRing } from "@monorepo/features";

export class FeatureHelper {
  constructor(private page: Page) {}

  async setFeatureRing(ring: FeatureRing) {
    await this.page.evaluate((ringValue) => {
      localStorage.setItem("feature-ring", ringValue.toString());
    }, ring);
    await this.page.reload();
  }

  async getFeatureRing(): Promise<FeatureRing> {
    const ring = await this.page.evaluate(() => {
      return localStorage.getItem("feature-ring");
    });
    return (ring ? parseInt(ring, 10) : 4) as FeatureRing;
  }

  async selectFeatureRing(ring: FeatureRing) {
    await this.page.click('[data-testid="feature-ring-selector"]');
    await this.page.click(`[data-value="${ring}"]`);
  }

  async isFeatureVisible(featureId: string): Promise<boolean> {
    const element = await this.page.$(`[data-feature-id="${featureId}"]`);
    if (!element) return false;

    const isVisible = await element.isVisible();
    const opacity = await element.evaluate((el) => {
      return window.getComputedStyle(el).opacity;
    });

    return isVisible && opacity !== "0.5";
  }

  async waitForFeature(featureId: string, options?: { timeout?: number }) {
    await this.page.waitForSelector(
      `[data-feature-id="${featureId}"]`,
      options,
    );
  }

  async expectFeatureEnabled(featureId: string) {
    const element = await this.page.waitForSelector(
      `[data-feature-id="${featureId}"]`,
    );
    const opacity = await element.evaluate(
      (el) => window.getComputedStyle(el).opacity,
    );
    const pointerEvents = await element.evaluate(
      (el) => window.getComputedStyle(el).pointerEvents,
    );

    expect(opacity).toBe("1");
    expect(pointerEvents).not.toBe("none");
  }

  async expectFeatureDisabled(featureId: string) {
    const element = await this.page.$(`[data-feature-id="${featureId}"]`);

    if (element) {
      const opacity = await element.evaluate(
        (el) => window.getComputedStyle(el).opacity,
      );
      const pointerEvents = await element.evaluate(
        (el) => window.getComputedStyle(el).pointerEvents,
      );

      expect(opacity).toBe("0.5");
      expect(pointerEvents).toBe("none");
    } else {
      expect(element).toBeNull();
    }
  }
}
