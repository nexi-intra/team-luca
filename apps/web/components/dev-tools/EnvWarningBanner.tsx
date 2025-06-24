"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, X } from "lucide-react";
import Link from "next/link";

interface EnvStatus {
  hasErrors: boolean;
  missingRequired: string[];
  missingOptional: string[];
}

export function EnvWarningBanner() {
  const [envStatus, setEnvStatus] = useState<EnvStatus | null>(null);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Only show in development
    if (process.env.NODE_ENV !== "development") {
      setIsLoading(false);
      return;
    }

    // Check if already dismissed this session
    if (sessionStorage.getItem("env-warning-dismissed") === "true") {
      setIsDismissed(true);
      setIsLoading(false);
      return;
    }

    // Check environment status
    checkEnvStatus();
  }, []);

  const checkEnvStatus = async () => {
    try {
      const response = await fetch("/api/setup/check-env");
      if (response.ok) {
        const data = await response.json();

        const missingRequired = data.variables
          .filter((v: any) => v.required && !v.currentValue)
          .map((v: any) => v.key);

        const missingOptional = data.variables
          .filter((v: any) => !v.required && !v.currentValue)
          .map((v: any) => v.key);

        setEnvStatus({
          hasErrors: missingRequired.length > 0,
          missingRequired,
          missingOptional,
        });
      }
    } catch (error) {
      console.error("Failed to check environment status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    sessionStorage.setItem("env-warning-dismissed", "true");
  };

  // Don't render if not in development, loading, dismissed, or no errors
  if (
    process.env.NODE_ENV !== "development" ||
    isLoading ||
    isDismissed ||
    !envStatus?.hasErrors
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 max-w-md z-50">
      <Alert variant="destructive" className="pr-12">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Missing Environment Variables</AlertTitle>
        <AlertDescription className="space-y-2">
          <p>
            {envStatus.missingRequired.length} required environment variable
            {envStatus.missingRequired.length === 1 ? " is" : "s are"} not
            configured.
          </p>
          <div className="flex gap-2">
            <Link href="/setup">
              <Button size="sm" variant="outline">
                Configure Now
              </Button>
            </Link>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDismiss}
              className="text-destructive-foreground hover:text-destructive-foreground/80"
            >
              Dismiss
            </Button>
          </div>
        </AlertDescription>
        <button
          onClick={handleDismiss}
          className="absolute right-2 top-2 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </Alert>
    </div>
  );
}
