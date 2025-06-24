import "reflect-metadata";
import { container, DependencyContainer, InjectionToken } from "tsyringe";

export interface ServiceIdentifier<T> {
  token: InjectionToken<T>;
  name: string;
}

export class DIContainer {
  private static instance: DIContainer;
  private container: DependencyContainer;

  private constructor() {
    this.container = container.createChildContainer();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  static createTestContainer(): DIContainer {
    return new DIContainer();
  }

  register<T>(token: InjectionToken<T>, value: T): void {
    this.container.registerInstance(token, value);
  }

  registerSingleton<T>(
    token: InjectionToken<T>,
    constructor: new (...args: any[]) => T,
  ): void {
    this.container.registerSingleton(token, constructor);
  }

  registerTransient<T>(
    token: InjectionToken<T>,
    constructor: new (...args: any[]) => T,
  ): void {
    this.container.register(token, { useClass: constructor });
  }

  registerFactory<T>(token: InjectionToken<T>, factory: () => T): void {
    this.container.register(token, { useFactory: () => factory() });
  }

  resolve<T>(token: InjectionToken<T>): T {
    return this.container.resolve(token);
  }

  resolveAll<T>(token: InjectionToken<T>): T[] {
    return this.container.resolveAll(token);
  }

  has<T>(token: InjectionToken<T>): boolean {
    return this.container.isRegistered(token);
  }

  reset(): void {
    this.container.reset();
  }

  createScope(): DependencyContainer {
    return this.container.createChildContainer();
  }
}

export const ServiceTokens = {
  AuthService: Symbol("AuthService"),
  ApiClient: Symbol("ApiClient"),
  FeatureService: Symbol("FeatureService"),
  UserService: Symbol("UserService"),
  Logger: Symbol("Logger"),
  Storage: Symbol("Storage"),
  ConfigService: Symbol("ConfigService"),
} as const;

export interface IAuthService {
  login(email: string, password: string): Promise<{ token: string; user: any }>;
  logout(): Promise<void>;
  getCurrentUser(): Promise<any>;
  isAuthenticated(): boolean;
}

export interface IApiClient {
  get<T>(url: string, options?: RequestInit): Promise<T>;
  post<T>(url: string, data: any, options?: RequestInit): Promise<T>;
  put<T>(url: string, data: any, options?: RequestInit): Promise<T>;
  delete<T>(url: string, options?: RequestInit): Promise<T>;
}

export interface IFeatureService {
  hasAccess(featureId: string): boolean;
  getUserRing(): number;
  setUserRing(ring: number): void;
}

export interface IUserService {
  getProfile(userId: string): Promise<any>;
  updateProfile(userId: string, data: any): Promise<any>;
}

export interface ILogger {
  log(message: string, ...args: any[]): void;
  error(message: string, error?: Error, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  debug(message: string, ...args: any[]): void;
}

export interface IStorage {
  get<T>(key: string): T | null;
  set<T>(key: string, value: T): void;
  remove(key: string): void;
  clear(): void;
}
