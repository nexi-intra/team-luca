import {
  DIContainer,
  ServiceTokens,
  IAuthService,
  IApiClient,
  IFeatureService,
  IUserService,
  ILogger,
  IStorage,
} from "@/lib/di/container";

export class MockAuthService implements IAuthService {
  private _isAuthenticated = false;
  private _currentUser: any = null;

  async login(
    email: string,
    password: string,
  ): Promise<{ token: string; user: any }> {
    this._isAuthenticated = true;
    this._currentUser = { id: "1", email, name: "Test User" };
    return {
      token: "mock-token",
      user: this._currentUser,
    };
  }

  async logout(): Promise<void> {
    this._isAuthenticated = false;
    this._currentUser = null;
  }

  async getCurrentUser(): Promise<any> {
    return this._currentUser;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated;
  }

  setAuthenticated(value: boolean, user?: any): void {
    this._isAuthenticated = value;
    this._currentUser = user;
  }
}

export class MockApiClient implements IApiClient {
  private responses = new Map<string, any>();

  async get<T>(url: string): Promise<T> {
    const response = this.responses.get(`GET:${url}`);
    if (response instanceof Error) throw response;
    return response || ({} as T);
  }

  async post<T>(url: string, data: any): Promise<T> {
    const response = this.responses.get(`POST:${url}`);
    if (response instanceof Error) throw response;
    return response || (data as T);
  }

  async put<T>(url: string, data: any): Promise<T> {
    const response = this.responses.get(`PUT:${url}`);
    if (response instanceof Error) throw response;
    return response || (data as T);
  }

  async delete<T>(url: string): Promise<T> {
    const response = this.responses.get(`DELETE:${url}`);
    if (response instanceof Error) throw response;
    return response || ({} as T);
  }

  mockResponse(method: string, url: string, response: any): void {
    this.responses.set(`${method}:${url}`, response);
  }

  clear(): void {
    this.responses.clear();
  }
}

export class MockFeatureService implements IFeatureService {
  private userRing: number = 4;
  private featureOverrides = new Map<string, boolean>();

  hasAccess(featureId: string): boolean {
    if (this.featureOverrides.has(featureId)) {
      return this.featureOverrides.get(featureId)!;
    }
    return true;
  }

  getUserRing(): number {
    return this.userRing;
  }

  setUserRing(ring: number): void {
    this.userRing = ring;
  }

  overrideFeature(featureId: string, hasAccess: boolean): void {
    this.featureOverrides.set(featureId, hasAccess);
  }

  clearOverrides(): void {
    this.featureOverrides.clear();
  }
}

export class MockLogger implements ILogger {
  logs: Array<{ level: string; message: string; args: any[] }> = [];

  log(message: string, ...args: any[]): void {
    this.logs.push({ level: "log", message, args });
  }

  error(message: string, error?: Error, ...args: any[]): void {
    this.logs.push({ level: "error", message, args: [error, ...args] });
  }

  warn(message: string, ...args: any[]): void {
    this.logs.push({ level: "warn", message, args });
  }

  debug(message: string, ...args: any[]): void {
    this.logs.push({ level: "debug", message, args });
  }

  clear(): void {
    this.logs = [];
  }
}

export class MockStorage implements IStorage {
  private storage = new Map<string, any>();

  get<T>(key: string): T | null {
    return this.storage.get(key) || null;
  }

  set<T>(key: string, value: T): void {
    this.storage.set(key, value);
  }

  remove(key: string): void {
    this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }
}

export function createMockContainer(): DIContainer {
  const container = DIContainer.createTestContainer();

  container.register(ServiceTokens.AuthService, new MockAuthService());
  container.register(ServiceTokens.ApiClient, new MockApiClient());
  container.register(ServiceTokens.FeatureService, new MockFeatureService());
  container.register(ServiceTokens.Logger, new MockLogger());
  container.register(ServiceTokens.Storage, new MockStorage());

  return container;
}

export function getMockService<T>(container: DIContainer, token: symbol): T {
  return container.resolve<T>(token);
}
