import { waitFor } from "@testing-library/react";
import { PublicClientApplication } from "@azure/msal-browser";

export async function waitForAsync(
  callback: () => void | Promise<void>,
  options?: Parameters<typeof waitFor>[1],
) {
  await waitFor(async () => {
    await callback();
  }, options);
}

export function createMockMsalInstance(): PublicClientApplication {
  const mockInstance = new PublicClientApplication({
    auth: {
      clientId: "test-client-id",
      authority: "https://login.microsoftonline.com/test-tenant-id",
      redirectUri: "http://localhost:3000",
    },
  });

  jest.spyOn(mockInstance, "loginPopup").mockResolvedValue({
    account: {
      homeAccountId: "test-home-account-id",
      environment: "test-environment",
      tenantId: "test-tenant-id",
      username: "test@example.com",
      localAccountId: "test-local-account-id",
      name: "Test User",
    } as any,
    idToken: "test-id-token",
    accessToken: "test-access-token",
    scopes: ["openid", "profile"],
    expiresOn: new Date(Date.now() + 3600000),
    tokenType: "Bearer",
    correlationId: "test-correlation-id",
  } as any);

  jest.spyOn(mockInstance, "logoutPopup").mockResolvedValue();

  jest.spyOn(mockInstance, "getAllAccounts").mockReturnValue([
    {
      homeAccountId: "test-home-account-id",
      environment: "test-environment",
      tenantId: "test-tenant-id",
      username: "test@example.com",
      localAccountId: "test-local-account-id",
      name: "Test User",
    } as any,
  ]);

  return mockInstance;
}

export function expectToHaveBeenCalledWithPartial(
  mock: jest.Mock,
  partialArgs: Record<string, any>,
) {
  expect(mock).toHaveBeenCalledWith(expect.objectContaining(partialArgs));
}

export function createMockLocalStorage(): Storage {
  const storage: Record<string, string> = {};

  return {
    length: 0,
    clear: jest.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    getItem: jest.fn((key: string) => storage[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete storage[key];
    }),
    key: jest.fn((index: number) => {
      const keys = Object.keys(storage);
      return keys[index] || null;
    }),
  };
}

export class TestScheduler {
  private timers: Array<{ callback: () => void; delay: number; time: number }> =
    [];
  private currentTime = 0;

  setTimeout(callback: () => void, delay: number): number {
    const id = this.timers.length;
    this.timers.push({ callback, delay, time: this.currentTime + delay });
    return id;
  }

  clearTimeout(id: number): void {
    this.timers[id] = null as any;
  }

  advance(ms: number): void {
    this.currentTime += ms;
    this.timers
      .filter((timer) => timer && timer.time <= this.currentTime)
      .forEach((timer) => {
        timer.callback();
        this.timers[this.timers.indexOf(timer)] = null as any;
      });
  }

  flush(): void {
    const maxTime = Math.max(...this.timers.filter(Boolean).map((t) => t.time));
    this.advance(maxTime - this.currentTime);
  }

  reset(): void {
    this.timers = [];
    this.currentTime = 0;
  }
}
