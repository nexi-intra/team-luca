/**
 * Test utilities
 */

/**
 * Wait for async operations to complete
 */
export async function waitForAsync(ms: number = 0): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Expect a mock to have been called with partial object match
 */
export function expectToHaveBeenCalledWithPartial(
  mock: jest.Mock,
  expectedPartial: any,
  callIndex: number = 0
): void {
  expect(mock).toHaveBeenCalled();
  const actualCall = mock.mock.calls[callIndex];
  expect(actualCall).toBeDefined();
  
  if (typeof expectedPartial === 'object' && expectedPartial !== null) {
    expect(actualCall[0]).toMatchObject(expectedPartial);
  } else {
    expect(actualCall[0]).toBe(expectedPartial);
  }
}

/**
 * Create a mock localStorage for testing
 */
export function createMockLocalStorage(): Storage {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
    get length() {
      return Object.keys(store).length;
    },
    key: (index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    },
  };
}

/**
 * Test scheduler for managing timers in tests
 */
export class TestScheduler {
  private timers: Map<number, { callback: () => void; time: number }> = new Map();
  private currentTime: number = 0;
  private nextId: number = 1;

  setTimeout(callback: () => void, delay: number): number {
    const id = this.nextId++;
    this.timers.set(id, {
      callback,
      time: this.currentTime + delay,
    });
    return id;
  }

  clearTimeout(id: number): void {
    this.timers.delete(id);
  }

  advance(ms: number): void {
    const targetTime = this.currentTime + ms;
    
    while (this.currentTime < targetTime) {
      const nextTimer = this.getNextTimer();
      if (!nextTimer || nextTimer.time > targetTime) {
        this.currentTime = targetTime;
        break;
      }
      
      this.currentTime = nextTimer.time;
      nextTimer.callback();
      this.timers.delete(nextTimer.id);
    }
  }

  advanceToNext(): void {
    const nextTimer = this.getNextTimer();
    if (nextTimer) {
      this.currentTime = nextTimer.time;
      nextTimer.callback();
      this.timers.delete(nextTimer.id);
    }
  }

  clear(): void {
    this.timers.clear();
    this.currentTime = 0;
  }

  private getNextTimer(): { id: number; callback: () => void; time: number } | null {
    let nextTimer: { id: number; callback: () => void; time: number } | null = null;
    
    for (const [id, timer] of this.timers) {
      if (!nextTimer || timer.time < nextTimer.time) {
        nextTimer = { id, ...timer };
      }
    }
    
    return nextTimer;
  }
}

/**
 * Create a mock fetch function
 */
export interface MockFetchOptions {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
  body?: any;
  delay?: number;
}

export function createMockFetch(
  responses: Map<string | RegExp, MockFetchOptions | ((url: string, init?: RequestInit) => MockFetchOptions)>
): jest.Mock {
  return jest.fn(async (url: string, init?: RequestInit) => {
    let response: MockFetchOptions | undefined;
    
    for (const [pattern, options] of responses) {
      if (typeof pattern === 'string' && url === pattern) {
        response = typeof options === 'function' ? options(url, init) : options;
        break;
      } else if (pattern instanceof RegExp && pattern.test(url)) {
        response = typeof options === 'function' ? options(url, init) : options;
        break;
      }
    }
    
    if (!response) {
      throw new Error(`Fetch called with unexpected URL: ${url}`);
    }
    
    const {
      status = 200,
      statusText = 'OK',
      headers = {},
      body = {},
      delay = 0,
    } = response;
    
    if (delay > 0) {
      await waitForAsync(delay);
    }
    
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText,
      headers: new Headers(headers),
      json: async () => body,
      text: async () => JSON.stringify(body),
      blob: async () => new Blob([JSON.stringify(body)]),
      clone: () => ({ ...response }),
    };
  });
}

/**
 * Create a test wrapper for React components
 */
export function createTestWrapper(providers: React.ComponentType<{ children: React.ReactNode }>[]): React.ComponentType<{ children: React.ReactNode }> {
  return ({ children }: { children: React.ReactNode }) => {
    return providers.reduceRight(
      (acc, Provider) => <Provider>{acc}</Provider>,
      children as React.ReactElement
    );
  };
}

/**
 * Mock console methods for testing
 */
export class ConsoleMock {
  private originalConsole: typeof console;
  private mocks: Partial<Record<keyof Console, jest.Mock>> = {};

  constructor(methods: (keyof Console)[] = ['log', 'warn', 'error', 'info']) {
    this.originalConsole = { ...console };
    
    methods.forEach(method => {
      this.mocks[method] = jest.fn();
      (console as any)[method] = this.mocks[method];
    });
  }

  restore(): void {
    Object.keys(this.mocks).forEach(method => {
      (console as any)[method] = (this.originalConsole as any)[method];
    });
  }

  getMock(method: keyof Console): jest.Mock | undefined {
    return this.mocks[method];
  }

  clear(): void {
    Object.values(this.mocks).forEach(mock => {
      mock.mockClear();
    });
  }
}