import { SENSITIVE_PATTERNS, FORBIDDEN_FIELDS } from "./constants";

export function maskSensitiveValue(value: unknown): unknown {
  if (typeof value === "string") {
    // Mask emails
    if (value.includes("@")) {
      return value.replace(/([a-zA-Z0-9._+-]+)@([a-zA-Z0-9.-]+)/, "***@$2");
    }

    // Mask tokens and keys (keep first 4 chars)
    if (value.length > 20 && /^[a-zA-Z0-9_-]+$/.test(value)) {
      return value.substring(0, 4) + "***";
    }

    // Mask credit card numbers
    if (/\d{13,19}/.test(value)) {
      return value.replace(/\d(?=\d{4})/g, "*");
    }

    // Mask phone numbers
    if (/^\+?\d{10,15}$/.test(value)) {
      return value.replace(/\d(?=\d{4})/g, "*");
    }

    return value;
  }

  if (typeof value === "object" && value !== null) {
    return maskSensitiveData(value);
  }

  return value;
}

export function maskSensitiveData(data: any): any {
  if (!data || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => maskSensitiveData(item));
  }

  const masked: any = {};

  for (const [key, value] of Object.entries(data)) {
    // Skip forbidden fields entirely
    if (
      FORBIDDEN_FIELDS.some(
        (field) => key.toLowerCase() === field.toLowerCase(),
      )
    ) {
      continue;
    }

    // Check if key matches sensitive patterns
    const isSensitive = SENSITIVE_PATTERNS.some((pattern) => pattern.test(key));

    if (isSensitive) {
      masked[key] = "***REDACTED***";
    } else if (typeof value === "object" && value !== null) {
      masked[key] = maskSensitiveData(value);
    } else if (typeof value === "string") {
      masked[key] = maskSensitiveValue(value);
    } else {
      masked[key] = value;
    }
  }

  return masked;
}

export function sanitizeHeaders(
  headers: Record<string, string | string[]>,
): Record<string, string | string[]> {
  const sanitized: Record<string, string | string[]> = {};

  for (const [key, value] of Object.entries(headers)) {
    const lowerKey = key.toLowerCase();

    // Skip sensitive headers
    if (FORBIDDEN_FIELDS.includes(lowerKey as any)) {
      continue;
    }

    // Mask authorization headers partially
    if (lowerKey === "authorization" && typeof value === "string") {
      const parts = value.split(" ");
      if (parts.length === 2) {
        sanitized[key] = `${parts[0]} ***`;
      }
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function sanitizeUrl(url: string): string {
  try {
    const parsed = new URL(url);

    // Remove sensitive query parameters
    const params = new URLSearchParams(parsed.search);
    for (const [key] of params) {
      if (SENSITIVE_PATTERNS.some((pattern) => pattern.test(key))) {
        params.set(key, "***REDACTED***");
      }
    }

    parsed.search = params.toString();

    // Mask userinfo if present
    if (parsed.username || parsed.password) {
      parsed.username = "***";
      parsed.password = "";
    }

    return parsed.toString();
  } catch {
    return url;
  }
}
