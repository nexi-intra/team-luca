import { ConfigHelpers } from "../helpers";
import { IConfigProvider, ConfigValue, FeatureRing } from "../types";

describe("ConfigHelpers", () => {
  // Mock provider
  const createMockProvider = (data: Record<string, any>): IConfigProvider => ({
    get: jest.fn((path: string) => {
      const parts = path.split(".");
      let current = data;
      for (const part of parts) {
        if (current && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current?.value;
    }),
    getWithMetadata: jest.fn((path: string) => {
      const parts = path.split(".");
      let current = data;
      for (const part of parts) {
        if (current && part in current) {
          current = current[part];
        } else {
          return undefined;
        }
      }
      return current;
    }),
    getAll: jest.fn(() => data),
    has: jest.fn((path: string) => {
      const parts = path.split(".");
      let current = data;
      for (const part of parts) {
        if (current && part in current) {
          current = current[part];
        } else {
          return false;
        }
      }
      return current?.value !== undefined;
    }),
    validate: jest.fn(() => ({ valid: true, errors: [] })),
    getByFeatureRing: jest.fn(() => ({})),
    getByCategory: jest.fn(() => ({})),
  });

  const testData = {
    app: {
      name: {
        value: "Test App",
        name: "Application Name",
        description: "The app name",
        featureRing: FeatureRing.Public,
        required: true,
      },
      port: {
        value: 3000,
        name: "Port",
        description: "The port",
        featureRing: FeatureRing.Public,
        required: false,
      },
    },
    api: {
      key: {
        value: "secret-key",
        name: "API Key",
        description: "The API key",
        featureRing: FeatureRing.Internal,
        required: true,
      },
      token: {
        value: undefined,
        name: "API Token",
        description: "The API token",
        featureRing: FeatureRing.Internal,
        required: false,
      },
    },
  };

  describe("getRequired", () => {
    it("should return value when it exists", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.getRequired("app.name")).toBe("Test App");
      expect(helpers.getRequired("app.port")).toBe(3000);
    });

    it("should throw when value does not exist", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(() => helpers.getRequired("api.token")).toThrow(
        "Required configuration not found: api.token",
      );
      expect(() => helpers.getRequired("nonexistent")).toThrow(
        "Required configuration not found: nonexistent",
      );
    });
  });

  describe("getOrDefault", () => {
    it("should return value when it exists", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.getOrDefault("app.name", "Default")).toBe("Test App");
    });

    it("should return default when value does not exist", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.getOrDefault("api.token", "default-token")).toBe(
        "default-token",
      );
      expect(helpers.getOrDefault("nonexistent", 42)).toBe(42);
    });
  });

  describe("getMany", () => {
    it("should return multiple values", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const values = helpers.getMany(["app.name", "app.port", "api.key"]);

      expect(values).toEqual({
        "app.name": "Test App",
        "app.port": 3000,
        "api.key": "secret-key",
      });
    });

    it("should skip undefined values", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const values = helpers.getMany(["app.name", "api.token", "nonexistent"]);

      expect(values).toEqual({
        "app.name": "Test App",
      });
    });
  });

  describe("hasAll", () => {
    it("should return true when all paths exist", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.hasAll(["app.name", "app.port"])).toBe(true);
    });

    it("should return false when any path is missing", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.hasAll(["app.name", "api.token"])).toBe(false);
      expect(helpers.hasAll(["app.name", "nonexistent"])).toBe(false);
    });
  });

  describe("hasAny", () => {
    it("should return true when any path exists", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.hasAny(["api.token", "app.name"])).toBe(true);
      expect(helpers.hasAny(["nonexistent", "app.port"])).toBe(true);
    });

    it("should return false when no paths exist", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      expect(helpers.hasAny(["api.token", "nonexistent"])).toBe(false);
    });
  });

  describe("getValidated", () => {
    it("should return value when validation passes", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const validator = (value: number) => value > 1000;
      expect(helpers.getValidated("app.port", validator)).toBe(3000);
    });

    it("should throw when validation fails with boolean", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const validator = (value: number) => value > 5000;
      expect(() => helpers.getValidated("app.port", validator)).toThrow(
        "Validation failed for configuration: app.port",
      );
    });

    it("should throw with custom message when validation fails", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const validator = (value: number) =>
        value > 5000 ? true : "Port must be greater than 5000";
      expect(() => helpers.getValidated("app.port", validator)).toThrow(
        "Port must be greater than 5000",
      );
    });

    it("should return undefined when value does not exist", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const validator = (value: string) => true;
      expect(helpers.getValidated("api.token", validator)).toBeUndefined();
    });
  });

  describe("getAllPaths", () => {
    it("should return all configuration paths", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const paths = helpers.getAllPaths();

      expect(paths).toContain("app.name");
      expect(paths).toContain("app.port");
      expect(paths).toContain("api.key");
      expect(paths).toContain("api.token");
      expect(paths).toHaveLength(4);
    });
  });

  describe("getSummary", () => {
    it("should return configuration summary", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const summary = helpers.getSummary();

      expect(summary["app.name"]).toEqual({
        name: "Application Name",
        value: "Test App",
        required: true,
        featureRing: FeatureRing.Public,
      });

      expect(summary["app.port"]).toEqual({
        name: "Port",
        value: 3000,
        required: false,
        featureRing: FeatureRing.Public,
      });
    });

    it("should mask sensitive values", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const summary = helpers.getSummary();

      expect(summary["api.key"]).toEqual({
        name: "API Key",
        value: "***REDACTED***",
        required: true,
        featureRing: FeatureRing.Internal,
      });
    });

    it("should handle undefined values", () => {
      const provider = createMockProvider(testData);
      const helpers = new ConfigHelpers(provider);

      const summary = helpers.getSummary();

      expect(summary["api.token"]).toEqual({
        name: "API Token",
        value: undefined,
        required: false,
        featureRing: FeatureRing.Internal,
      });
    });
  });
});
