"use client";

import React, { useEffect, useState } from "react";
import { Info, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUserJurisdiction, isCcpaApplicable } from "@/lib/compliance";

export function PrivacyBanner() {
  const [showCcpaBanner, setShowCcpaBanner] = useState(false);
  const [jurisdiction, setJurisdiction] = useState<string>("");

  useEffect(() => {
    // Determine user jurisdiction
    const userJurisdiction = getUserJurisdiction(
      new Request(window.location.href, {
        headers: {
          "accept-language": navigator.language,
        },
      }),
    );
    setJurisdiction(userJurisdiction);

    // Check if CCPA banner should be shown
    if (isCcpaApplicable(userJurisdiction)) {
      const ccpaAcknowledged = localStorage.getItem("ccpa-acknowledged");
      if (!ccpaAcknowledged) {
        setShowCcpaBanner(true);
      }
    }
  }, []);

  const handleAcknowledge = () => {
    localStorage.setItem("ccpa-acknowledged", "true");
    setShowCcpaBanner(false);
  };

  if (!showCcpaBanner) return null;

  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-md">
      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Your Privacy Rights (CCPA)
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                As a California resident, you have the right to opt-out of the
                sale of your personal information.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 text-blue-700 hover:text-blue-800 dark:text-blue-300"
                  onClick={() => window.open("/privacy#do-not-sell", "_blank")}
                >
                  Do Not Sell My Info
                </Button>
                <Button
                  size="sm"
                  variant="link"
                  className="h-auto p-0 text-blue-700 hover:text-blue-800 dark:text-blue-300"
                  onClick={() => window.open("/privacy", "_blank")}
                >
                  Privacy Policy
                </Button>
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={handleAcknowledge}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
