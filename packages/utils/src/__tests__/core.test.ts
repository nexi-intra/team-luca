import {
  cn,
  isDev,
  base64UrlEncode,
  base64UrlDecode,
  generateRandomString,
  deepClone,
  isEmpty,
  debounce,
  throttle,
} from "../core";

describe("Core utilities", () => {
  describe("cn", () => {
    it("should merge class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("should merge conditional classes", () => {
      expect(cn("foo", { bar: true, baz: false })).toBe("foo bar");
    });

    it("should handle tailwind conflicts", () => {
      expect(cn("px-2", "px-4")).toBe("px-4");
      expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
    });

    it("should handle arrays", () => {
      expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
    });

    it("should filter out falsy values", () => {
      expect(cn("foo", null, undefined, false, "", "bar")).toBe("foo bar");
    });
  });

  describe("isDev", () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    it("should return true in development", () => {
      process.env.NODE_ENV = "development";
      expect(isDev()).toBe(true);
    });

    it("should return false in production", () => {
      process.env.NODE_ENV = "production";
      expect(isDev()).toBe(false);
    });
  });

  describe("base64UrlEncode/decode", () => {
    it("should encode and decode correctly", () => {
      const testString = "Hello, World!";
      const encoded = base64UrlEncode(testString);
      const decoded = base64UrlDecode(encoded);

      expect(encoded).not.toContain("+");
      expect(encoded).not.toContain("/");
      expect(encoded).not.toContain("=");
      expect(decoded).toBe(testString);
    });

    it("should handle special characters", () => {
      const testString = '{"test": "value with spaces and special chars!@#$%"}';
      const encoded = base64UrlEncode(testString);
      const decoded = base64UrlDecode(encoded);

      expect(decoded).toBe(testString);
    });
  });

  describe("generateRandomString", () => {
    it("should generate string of correct length", () => {
      expect(generateRandomString(16).length).toBe(32); // hex encoding doubles length
      expect(generateRandomString(32).length).toBe(64);
    });

    it("should generate different strings", () => {
      const str1 = generateRandomString();
      const str2 = generateRandomString();
      expect(str1).not.toBe(str2);
    });

    it("should only contain hex characters", () => {
      const str = generateRandomString();
      expect(str).toMatch(/^[0-9a-f]+$/);
    });
  });

  describe("deepClone", () => {
    it("should clone primitive values", () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone("hello")).toBe("hello");
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
    });

    it("should clone arrays", () => {
      const arr = [1, 2, [3, 4]];
      const cloned = deepClone(arr);

      expect(cloned).toEqual(arr);
      expect(cloned).not.toBe(arr);
      expect(cloned[2]).not.toBe(arr[2]);
    });

    it("should clone objects", () => {
      const obj = { a: 1, b: { c: 2 } };
      const cloned = deepClone(obj);

      expect(cloned).toEqual(obj);
      expect(cloned).not.toBe(obj);
      expect(cloned.b).not.toBe(obj.b);
    });

    it("should clone dates", () => {
      const date = new Date("2024-01-01");
      const cloned = deepClone(date);

      expect(cloned).toEqual(date);
      expect(cloned).not.toBe(date);
      expect(cloned).toBeInstanceOf(Date);
    });
  });

  describe("isEmpty", () => {
    it("should return true for empty values", () => {
      expect(isEmpty(null)).toBe(true);
      expect(isEmpty(undefined)).toBe(true);
      expect(isEmpty("")).toBe(true);
      expect(isEmpty([])).toBe(true);
      expect(isEmpty({})).toBe(true);
    });

    it("should return false for non-empty values", () => {
      expect(isEmpty("hello")).toBe(false);
      expect(isEmpty([1])).toBe(false);
      expect(isEmpty({ a: 1 })).toBe(false);
      expect(isEmpty(0)).toBe(false);
      expect(isEmpty(false)).toBe(false);
    });
  });

  describe("debounce", () => {
    jest.useFakeTimers();

    it("should debounce function calls", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced();
      debounced();
      debounced();

      expect(fn).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it("should pass arguments to debounced function", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("arg1", "arg2");
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should cancel previous calls", () => {
      const fn = jest.fn();
      const debounced = debounce(fn, 100);

      debounced("first");
      jest.advanceTimersByTime(50);
      debounced("second");
      jest.advanceTimersByTime(100);

      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith("second");
    });
  });

  describe("throttle", () => {
    jest.useFakeTimers();

    it("should throttle function calls", () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled();
      throttled();
      throttled();

      expect(fn).toHaveBeenCalledTimes(1);

      jest.advanceTimersByTime(100);
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it("should pass arguments to throttled function", () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled("arg1", "arg2");
      expect(fn).toHaveBeenCalledWith("arg1", "arg2");
    });

    it("should ignore calls during throttle period", () => {
      const fn = jest.fn();
      const throttled = throttle(fn, 100);

      throttled("first");
      jest.advanceTimersByTime(50);
      throttled("second");
      jest.advanceTimersByTime(50);
      throttled("third");

      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenNthCalledWith(1, "first");
      expect(fn).toHaveBeenNthCalledWith(2, "third");
    });
  });
});
