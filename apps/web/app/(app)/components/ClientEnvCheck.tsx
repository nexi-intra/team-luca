"use client";

import { useEffect } from "react";

export function ClientEnvCheck() {
  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Run a quick client-side check
    const checkClientEnv = () => {
      const requiredClientVars = [
        "NEXT_PUBLIC_AUTH_CLIENT_ID",
        "NEXT_PUBLIC_AUTH_AUTHORITY",
        "NEXT_PUBLIC_APP_URL",
      ];

      const missing = requiredClientVars.filter(
        (key) => !process.env[key] || process.env[key] === "",
      );

      if (missing.length > 0) {
        console.warn(
          `⚠️  Missing ${missing.length} required client-side environment variable${missing.length === 1 ? "" : "s"}:`,
          missing,
        );
        console.warn(
          '   Run "pnpm dev" with proper .env.local file or visit /setup to configure.',
        );
      }
    };

    // Run check after a short delay to not interfere with initial load
    const timer = setTimeout(checkClientEnv, 1000);
    return () => clearTimeout(timer);
  }, []);

  return null;
}
