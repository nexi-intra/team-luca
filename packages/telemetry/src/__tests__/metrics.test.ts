import { OperationMetrics } from "../instrumentation/metrics";
import { OPERATION_KEYS } from "../constants";
import { TelemetryLogger } from "../interfaces/logger";

describe("OperationMetrics", () => {
  let mockLogger: jest.Mocked<TelemetryLogger>;

  beforeEach(() => {
    mockLogger = {
      verbose: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    };
    OperationMetrics.reset();
    OperationMetrics.setLogger(mockLogger);
  });

  afterEach(() => {
    OperationMetrics.reset();
  });

  describe("increment", () => {
    it("should increment counter for operation key", () => {
      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(0);

      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);
      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(1);

      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);
      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(2);
    });

    it("should track operations with different attributes separately", () => {
      const attributes1 = { method: "GET" };
      const attributes2 = { method: "POST" };

      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST, attributes1);
      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST, attributes1);
      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST, attributes2);

      expect(
        OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST, attributes1),
      ).toBe(2);
      expect(
        OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST, attributes2),
      ).toBe(1);
    });

    it("should log verbose message when incrementing", () => {
      OperationMetrics.increment(OPERATION_KEYS.AUTH_LOGIN, { userId: "123" });

      expect(mockLogger.verbose).toHaveBeenCalledWith(
        "Operation metric incremented",
        expect.objectContaining({
          operation: OPERATION_KEYS.AUTH_LOGIN,
          count: 1,
          attributes: { userId: "123" },
        }),
      );
    });

    it("should handle increment without logger", () => {
      OperationMetrics.setLogger(undefined as any);

      expect(() => {
        OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);
      }).not.toThrow();

      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(1);
    });
  });

  describe("getCount", () => {
    it("should return 0 for non-existent operations", () => {
      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(0);
      expect(
        OperationMetrics.getCount(OPERATION_KEYS.AUTH_LOGIN, {
          method: "oauth",
        }),
      ).toBe(0);
    });

    it("should return correct count for existing operations", () => {
      OperationMetrics.increment(OPERATION_KEYS.FEATURE_ACCESS);
      OperationMetrics.increment(OPERATION_KEYS.FEATURE_ACCESS);
      OperationMetrics.increment(OPERATION_KEYS.FEATURE_ACCESS);

      expect(OperationMetrics.getCount(OPERATION_KEYS.FEATURE_ACCESS)).toBe(3);
    });
  });

  describe("reset", () => {
    it("should clear all counters", () => {
      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);
      OperationMetrics.increment(OPERATION_KEYS.AUTH_LOGIN);
      OperationMetrics.increment(OPERATION_KEYS.UI_INTERACTION, {
        component: "button",
      });

      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(1);
      expect(OperationMetrics.getCount(OPERATION_KEYS.AUTH_LOGIN)).toBe(1);
      expect(
        OperationMetrics.getCount(OPERATION_KEYS.UI_INTERACTION, {
          component: "button",
        }),
      ).toBe(1);

      OperationMetrics.reset();

      expect(OperationMetrics.getCount(OPERATION_KEYS.API_REQUEST)).toBe(0);
      expect(OperationMetrics.getCount(OPERATION_KEYS.AUTH_LOGIN)).toBe(0);
      expect(
        OperationMetrics.getCount(OPERATION_KEYS.UI_INTERACTION, {
          component: "button",
        }),
      ).toBe(0);
    });
  });

  describe("getAll", () => {
    it("should return all counters", () => {
      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);
      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);
      OperationMetrics.increment(OPERATION_KEYS.AUTH_LOGIN, {
        method: "password",
      });

      const all = OperationMetrics.getAll();

      expect(all.size).toBe(2);
      expect(all.get(`${OPERATION_KEYS.API_REQUEST}:{}`)).toBe(2);
      expect(
        all.get(`${OPERATION_KEYS.AUTH_LOGIN}:{"method":"password"}`),
      ).toBe(1);
    });

    it("should return empty map when no metrics exist", () => {
      const all = OperationMetrics.getAll();
      expect(all.size).toBe(0);
    });

    it("should return a copy of counters", () => {
      OperationMetrics.increment(OPERATION_KEYS.API_REQUEST);

      const all1 = OperationMetrics.getAll();
      all1.set("test", 999);

      const all2 = OperationMetrics.getAll();
      expect(all2.has("test")).toBe(false);
    });
  });
});
