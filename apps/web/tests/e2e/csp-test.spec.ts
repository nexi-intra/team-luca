import { test, expect } from "@playwright/test";

test.describe("CSP Removal Verification", () => {
  test("should not have CSP errors in console", async ({ page }) => {
    const errors: string[] = [];
    
    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Navigate to home page
    await page.goto("/");
    
    // Wait for page to load
    await page.waitForLoadState("networkidle");
    
    // Check that there are no CSP-related errors
    const cspErrors = errors.filter(error => 
      error.includes('Content Security Policy') || 
      error.includes('CSP') ||
      error.includes('script-src')
    );
    
    expect(cspErrors).toHaveLength(0);
    
    // Log any errors found for debugging
    if (errors.length > 0) {
      console.log("Console errors found (non-CSP):", errors);
    }
  });

  test("should not have CSP header in response", async ({ page }) => {
    const response = await page.goto("/");
    
    // Check response headers
    const headers = response?.headers() || {};
    
    // CSP header should not be present
    expect(headers['content-security-policy']).toBeUndefined();
    
    // Other security headers should still be present
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['x-content-type-options']).toBe('nosniff');
  });
});