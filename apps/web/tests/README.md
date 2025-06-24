# Testing Guide

This project uses a comprehensive testing setup with dependency injection and factory patterns for both unit and E2E tests.

## Architecture

### Dependency Injection (DI)

- **Container**: `lib/di/container.ts` - Main DI container using tsyringe
- **Decorators**: `lib/di/decorators.ts` - Custom decorators for service registration
- **Mock Services**: `tests/utils/mock-services.ts` - Pre-configured mocks for testing

### Factory Pattern

- **Base Factory**: `tests/factories/base.factory.ts` - Abstract factory with common methods
- **User Factory**: `tests/factories/user.factory.ts` - Creates test users with various states
- **Feature Factory**: `tests/factories/feature.factory.ts` - Creates test features

## Running Tests

### Unit Tests

```bash
npm run test:unit           # Run all unit tests
npm run test:unit:watch     # Run in watch mode
npm run test:unit:coverage  # Generate coverage report
```

### E2E Tests

```bash
npm run test:e2e           # Run all E2E tests
npm run test:e2e:ui        # Open Playwright UI
npm run test:e2e:headed    # Run tests in headed browser
```

### All Tests

```bash
npm test  # Run both unit and E2E tests
```

## Writing Tests

### Unit Tests

#### Basic Component Test

```typescript
import { render, screen } from '@/tests/utils/test-utils';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

#### Using Factories

```typescript
import { factories } from "@/tests/factories";

it("creates user with profile", async () => {
  const user = await factories.user.withProfile().create();
  expect(user.profile).toBeDefined();
});
```

#### Using DI Container

```typescript
import {
  createMockContainer,
  getMockService,
} from "@/tests/utils/mock-services";
import { ServiceTokens } from "@/lib/di/container";

it("uses mocked services", () => {
  const container = createMockContainer();
  const authService = getMockService(container, ServiceTokens.AuthService);

  authService.setAuthenticated(true);
  expect(authService.isAuthenticated()).toBe(true);
});
```

### E2E Tests

#### Basic E2E Test

```typescript
import { test, expect } from "../fixtures/test";

test("user can navigate", async ({ page }) => {
  await page.goto("/");
  await page.click("text=About");
  await expect(page).toHaveURL("/about");
});
```

#### Using Test Fixtures

```typescript
test("authenticated user sees dashboard", async ({
  authenticatedPage,
  testUser,
}) => {
  await authenticatedPage.goto("/dashboard");
  await expect(authenticatedPage.getByText(testUser.name)).toBeVisible();
});
```

#### Using Helpers

```typescript
import { FeatureHelper } from "../helpers/feature.helper";

test("feature gates work", async ({ page }) => {
  const featureHelper = new FeatureHelper(page);

  await featureHelper.setFeatureRing(1);
  await featureHelper.expectFeatureEnabled("experimental-feature");
});
```

## Test Patterns

### Factory States

```typescript
// Create users with different states
const adminUser = await factories.user.admin().create();
const inactiveUser = await factories.user.inactive().create();
const experimentalUser = await factories.user.experimental().create();
```

### Mock API Responses

```typescript
const apiClient = getMockService(container, ServiceTokens.ApiClient);
apiClient.mockResponse("GET", "/api/users", [{ id: 1, name: "Test" }]);
```

### Feature Testing

```typescript
// Test with specific feature ring
render(<App />, { initialFeatureRing: 2 });

// Check feature access
const { hasAccess } = useFeatureAccess('beta-feature');
expect(hasAccess).toBe(true);
```

## Best Practices

1. **Use Factories**: Always use factories for test data instead of hardcoding
2. **Mock External Dependencies**: Use the DI container to inject mocks
3. **Test Isolation**: Each test should be independent and not rely on others
4. **Descriptive Names**: Use clear, descriptive test names that explain the scenario
5. **AAA Pattern**: Arrange, Act, Assert - structure your tests clearly
6. **Use Helpers**: Create reusable helpers for common E2E operations
7. **Mock at the Right Level**: Mock at the service level, not the component level

## Debugging

### Unit Tests

- Use `console.log` or debugger statements
- Run specific tests: `npm run test:unit -- MyComponent.test.tsx`
- Use VSCode Jest extension for inline debugging

### E2E Tests

- Use Playwright Inspector: `npm run test:e2e:ui`
- Take screenshots: `await page.screenshot({ path: 'debug.png' })`
- Use trace viewer for failed tests
- Slow down execution: `--slow-mo=1000`

## CI/CD Integration

Tests are configured to run in CI with:

- Parallel execution disabled for consistency
- Retries enabled for flaky tests
- HTML reports generated
- Screenshots on failure
