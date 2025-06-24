import {
  formatBytes,
  formatNumber,
  formatCurrency,
  formatPercentage,
  formatRelativeTime,
  formatDuration,
  truncate,
  formatPhoneNumber,
  formatCreditCard,
  capitalize,
  toTitleCase,
  toKebabCase,
  toCamelCase,
  toSnakeCase,
  formatFileSize,
  formatMessage,
} from "../format";

describe("Format utilities", () => {
  describe("formatBytes", () => {
    it("should format bytes correctly", () => {
      expect(formatBytes(0)).toBe("0 Bytes");
      expect(formatBytes(1024)).toBe("1 KB");
      expect(formatBytes(1048576)).toBe("1 MB");
      expect(formatBytes(1073741824)).toBe("1 GB");
    });

    it("should handle decimals", () => {
      expect(formatBytes(1536, 2)).toBe("1.5 KB");
      expect(formatBytes(1536, 0)).toBe("2 KB");
    });
  });

  describe("formatNumber", () => {
    it("should format with thousands separator", () => {
      expect(formatNumber(1000)).toBe("1,000");
      expect(formatNumber(1000000)).toBe("1,000,000");
      expect(formatNumber(123)).toBe("123");
    });

    it("should use custom separator", () => {
      expect(formatNumber(1000, ".")).toBe("1.000");
      expect(formatNumber(1000000, " ")).toBe("1 000 000");
    });
  });

  describe("formatCurrency", () => {
    it("should format USD currency", () => {
      const result = formatCurrency(1234.56);
      expect(result).toMatch(/1,234.56/);
      expect(result).toContain("$");
    });

    it("should format other currencies", () => {
      const result = formatCurrency(1234.56, "EUR", "de-DE");
      expect(result).toMatch(/1\.234,56/);
      expect(result).toContain("€");
    });
  });

  describe("formatPercentage", () => {
    it("should format percentages", () => {
      expect(formatPercentage(0.1234)).toBe("12.34%");
      expect(formatPercentage(0.5)).toBe("50.00%");
      expect(formatPercentage(1)).toBe("100.00%");
    });

    it("should handle decimal places", () => {
      expect(formatPercentage(0.1234, 0)).toBe("12%");
      expect(formatPercentage(0.1234, 1)).toBe("12.3%");
    });
  });

  describe("formatRelativeTime", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-01T12:00:00Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should format relative time", () => {
      expect(formatRelativeTime(new Date("2024-01-01T11:59:30Z"))).toBe(
        "just now",
      );
      expect(formatRelativeTime(new Date("2024-01-01T11:58:00Z"))).toBe(
        "2 minutes ago",
      );
      expect(formatRelativeTime(new Date("2024-01-01T11:00:00Z"))).toBe(
        "1 hour ago",
      );
      expect(formatRelativeTime(new Date("2023-12-31T12:00:00Z"))).toBe(
        "1 day ago",
      );
      expect(formatRelativeTime(new Date("2023-12-25T12:00:00Z"))).toBe(
        "1 week ago",
      );
      expect(formatRelativeTime(new Date("2023-12-01T12:00:00Z"))).toBe(
        "1 month ago",
      );
      expect(formatRelativeTime(new Date("2023-01-01T12:00:00Z"))).toBe(
        "1 year ago",
      );
    });
  });

  describe("formatDuration", () => {
    it("should format durations correctly", () => {
      expect(formatDuration(500)).toBe("500ms");
      expect(formatDuration(5000)).toBe("5s");
      expect(formatDuration(65000)).toBe("1m 5s");
      expect(formatDuration(3665000)).toBe("1h 1m");
      expect(formatDuration(90061000)).toBe("1d 1h");
    });
  });

  describe("truncate", () => {
    it("should truncate long strings", () => {
      expect(truncate("Hello World", 5)).toBe("He...");
      expect(truncate("Hello World", 20)).toBe("Hello World");
    });

    it("should use custom suffix", () => {
      expect(truncate("Hello World", 5, "…")).toBe("Hell…");
    });
  });

  describe("formatPhoneNumber", () => {
    it("should format US phone numbers", () => {
      expect(formatPhoneNumber("1234567890")).toBe("(123) 456-7890");
      expect(formatPhoneNumber("123-456-7890")).toBe("(123) 456-7890");
    });

    it("should format international numbers", () => {
      expect(formatPhoneNumber("11234567890", "INTL")).toBe(
        "+1 (123) 456-7890",
      );
      expect(formatPhoneNumber("441234567890", "INTL")).toBe("+441234567890");
    });
  });

  describe("formatCreditCard", () => {
    it("should format credit card numbers", () => {
      expect(formatCreditCard("1234567812345678")).toBe("1234 5678 1234 5678");
      expect(formatCreditCard("1234 5678 1234 5678")).toBe(
        "1234 5678 1234 5678",
      );
    });
  });

  describe("capitalize", () => {
    it("should capitalize first letter", () => {
      expect(capitalize("hello")).toBe("Hello");
      expect(capitalize("HELLO")).toBe("HELLO");
      expect(capitalize("")).toBe("");
    });
  });

  describe("toTitleCase", () => {
    it("should convert to title case", () => {
      expect(toTitleCase("hello world")).toBe("Hello World");
      expect(toTitleCase("HELLO WORLD")).toBe("Hello World");
      expect(toTitleCase("hello-world")).toBe("Hello-world");
    });
  });

  describe("toKebabCase", () => {
    it("should convert to kebab case", () => {
      expect(toKebabCase("helloWorld")).toBe("hello-world");
      expect(toKebabCase("HelloWorld")).toBe("hello-world");
      expect(toKebabCase("hello world")).toBe("hello-world");
      expect(toKebabCase("hello_world")).toBe("hello-world");
    });
  });

  describe("toCamelCase", () => {
    it("should convert to camel case", () => {
      expect(toCamelCase("hello-world")).toBe("helloWorld");
      expect(toCamelCase("Hello-world")).toBe("helloWorld");
      expect(toCamelCase("HELLO-WORLD")).toBe("hELLOWORLD");
    });
  });

  describe("toSnakeCase", () => {
    it("should convert to snake case", () => {
      expect(toSnakeCase("helloWorld")).toBe("hello_world");
      expect(toSnakeCase("HelloWorld")).toBe("hello_world");
      expect(toSnakeCase("hello-world")).toBe("hello_world");
      expect(toSnakeCase("hello world")).toBe("hello_world");
    });
  });

  describe("formatFileSize", () => {
    it("should format file sizes", () => {
      expect(formatFileSize(1024)).toBe("1 KB");
      expect(formatFileSize(1048576)).toBe("1 MB");
    });
  });

  describe("formatMessage", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2024-01-01T12:00:00.000Z"));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it("should format log messages", () => {
      const msg = formatMessage("INFO", "Test message");
      expect(msg).toBe("[2024-01-01T12:00:00.000Z] [INFO] Test message");
    });

    it("should format with arguments", () => {
      const msg = formatMessage(
        "ERROR",
        "Error:",
        { code: 500 },
        "Internal Error",
      );
      expect(msg).toContain(
        '[ERROR] Error: {\n  "code": 500\n} Internal Error',
      );
    });
  });
});
