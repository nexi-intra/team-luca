import { test, expect } from '../fixtures/test';
import { FeatureHelper } from '../helpers/feature.helper';
import { AuthHelper } from '../helpers/auth.helper';

test.describe('Feature Ring System', () => {
  let featureHelper: FeatureHelper;
  let authHelper: AuthHelper;

  test.beforeEach(async ({ authenticatedPage }) => {
    featureHelper = new FeatureHelper(authenticatedPage);
    authHelper = new AuthHelper(authenticatedPage);
    await authenticatedPage.goto('/');
  });

  test('should display features based on user ring level', async ({ authenticatedPage, testUser }) => {
    await authHelper.mockLogin({
      email: testUser.email,
      name: testUser.name,
      id: testUser.id,
    });

    await featureHelper.setFeatureRing(4);
    await featureHelper.expectFeatureEnabled('stable-feature');
    
    await featureHelper.setFeatureRing(3);
    await featureHelper.expectFeatureEnabled('beta-feature');
    await featureHelper.expectFeatureDisabled('experimental-feature');
    
    await featureHelper.setFeatureRing(1);
    await featureHelper.expectFeatureEnabled('experimental-feature');
  });

  test('should persist feature ring selection', async ({ authenticatedPage }) => {
    await featureHelper.setFeatureRing(2);
    
    await authenticatedPage.reload();
    
    const ring = await featureHelper.getFeatureRing();
    expect(ring).toBe(2);
  });

  test('should update UI when ring selection changes', async ({ authenticatedPage }) => {
    await featureHelper.setFeatureRing(4);
    await featureHelper.expectFeatureEnabled('stable-feature');
    await featureHelper.expectFeatureDisabled('experimental-feature');
    
    await featureHelper.selectFeatureRing(1);
    
    await featureHelper.expectFeatureEnabled('experimental-feature');
  });

  test('should handle feature gates correctly', async ({ authenticatedPage }) => {
    await featureHelper.setFeatureRing(3);
    
    const betaFeature = await authenticatedPage.$('[data-feature-id="beta-feature"]');
    expect(betaFeature).toBeTruthy();
    
    const experimentalFeature = await authenticatedPage.$('[data-feature-id="experimental-feature"]');
    expect(experimentalFeature).toBeFalsy();
  });

  test('should show disabled features with reduced opacity when configured', async ({ authenticatedPage }) => {
    await featureHelper.setFeatureRing(4);
    
    const experimentalElement = await authenticatedPage.$('[data-feature-id="experimental-feature"][data-show-when-disabled="true"]');
    
    if (experimentalElement) {
      const styles = await experimentalElement.evaluate((el: Element) => {
        const computed = window.getComputedStyle(el);
        return {
          opacity: computed.opacity,
          pointerEvents: computed.pointerEvents,
        };
      });
      
      expect(styles.opacity).toBe('0.5');
      expect(styles.pointerEvents).toBe('none');
    }
  });
});

test.describe('Feature Ring Integration', () => {
  test('should integrate with authentication flow', async ({ page }) => {
    const authHelper = new AuthHelper(page);
    const featureHelper = new FeatureHelper(page);
    
    await page.goto('/');
    
    await authHelper.mockLogin({
      email: 'admin@example.com',
      name: 'Admin User',
      id: 'admin-123',
    });
    
    await featureHelper.setFeatureRing(1);
    await authHelper.verifyAuthenticated();
    
    await featureHelper.expectFeatureEnabled('experimental-feature');
    await featureHelper.expectFeatureEnabled('stable-feature');
  });

  test('should handle multi-feature gates', async ({ authenticatedPage }) => {
    const featureHelper = new FeatureHelper(authenticatedPage);
    
    await featureHelper.setFeatureRing(2);
    
    const multiFeatureElement = await authenticatedPage.$('[data-multi-feature-gate="true"]');
    
    if (multiFeatureElement) {
      const requiredFeatures = await multiFeatureElement.getAttribute('data-required-features');
      const requireAll = await multiFeatureElement.getAttribute('data-require-all');
      
      expect(requiredFeatures).toBeTruthy();
      expect(requireAll).toBeTruthy();
    }
  });
});