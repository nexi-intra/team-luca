import { faker } from "@faker-js/faker";

export interface FactoryOptions<T> {
  onCreate?: (instance: T) => void | Promise<void>;
}

export abstract class BaseFactory<T, P = Partial<T>> {
  protected abstract getDefaults(): T;
  protected options: FactoryOptions<T>;

  constructor(options: FactoryOptions<T> = {}) {
    this.options = options;
  }

  async create(overrides?: P): Promise<T> {
    const instance = this.build(overrides);
    if (this.options.onCreate) {
      await this.options.onCreate(instance);
    }
    return instance;
  }

  build(overrides?: P): T {
    const defaults = this.getDefaults();
    return { ...defaults, ...overrides } as T;
  }

  async createMany(count: number, overrides?: P): Promise<T[]> {
    const promises = Array.from({ length: count }, () =>
      this.create(overrides),
    );
    return Promise.all(promises);
  }

  buildMany(count: number, overrides?: P): T[] {
    return Array.from({ length: count }, () => this.build(overrides));
  }

  async createWithRelations(
    overrides?: P,
    relations?: Record<string, any>,
  ): Promise<T> {
    const instance = await this.create(overrides);
    if (relations && instance && typeof instance === "object") {
      Object.assign(instance as object, relations);
    }
    return instance;
  }

  sequence<K extends keyof T>(
    field: K,
    generator: (index: number) => T[K],
  ): (count: number, overrides?: P) => T[] {
    return (count: number, overrides?: P) => {
      return Array.from({ length: count }, (_, index) =>
        this.build({ ...overrides, [field]: generator(index) } as P),
      );
    };
  }

  state(name: string, overrides: P): this {
    const self = this;
    const StateFactory = class extends (this.constructor as any) {
      constructor() {
        super(self.options);
      }
      getDefaults() {
        return { ...super.getDefaults(), ...overrides };
      }
    };
    return new StateFactory() as unknown as this;
  }

  protected faker = faker;
}
