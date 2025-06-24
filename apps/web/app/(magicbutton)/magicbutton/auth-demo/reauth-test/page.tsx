"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";
import { defaultReauthConfig } from "@/lib/auth/reauth-config";
import { Clock, RefreshCw, ShieldCheck, Timer } from "lucide-react";

export const dynamic = "force-dynamic";

export default function ReauthTestPage() {
  const {
    isAuthenticated,
    authSource,
    lastAuthTime,
    nextReauthTime,
    isReauthRequired,
    refreshSession,
    skipReauth,
  } = useAuth();

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return date.toLocaleString();
  };

  const getTimeRemaining = () => {
    if (!nextReauthTime) return "N/A";
    const now = new Date();
    const diff = nextReauthTime.getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const getTimeSinceAuth = () => {
    if (!lastAuthTime) return "N/A";
    const now = new Date();
    const diff = now.getTime() - lastAuthTime.getTime();

    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes}m ${seconds}s ago`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#233862] mb-2">
          Re-Authentication Testing
        </h1>
        <p className="text-gray-600">
          Monitor and test the automatic re-authentication system
        </p>
      </div>

      {/* Re-auth Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5" />
            Re-Authentication Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Re-auth Interval:</span>
              <span className="font-medium">
                {defaultReauthConfig.intervalMinutes} minutes
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Warning Time:</span>
              <span className="font-medium">
                {defaultReauthConfig.warningMinutes} minute before
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Applies to:</span>
              <span className="font-medium">
                {defaultReauthConfig.providers.join(", ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">
                Current Auth Source:
              </span>
              <Badge variant={authSource === "magic" ? "secondary" : "default"}>
                {authSource?.toUpperCase() || "None"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Session Status */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Session Status
            </CardTitle>
            <CardDescription>
              Current authentication session timing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Last Authentication
                  </p>
                  <p className="font-mono text-sm">
                    {formatDate(lastAuthTime)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {getTimeSinceAuth()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">
                    Next Re-auth Required
                  </p>
                  <p className="font-mono text-sm">
                    {authSource === "magic"
                      ? "Not Required"
                      : formatDate(nextReauthTime)}
                  </p>
                  {authSource !== "magic" && (
                    <p className="text-xs text-gray-500 mt-1">
                      In {getTimeRemaining()}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600">Re-auth Status:</span>
                  <Badge variant={isReauthRequired ? "destructive" : "outline"}>
                    {isReauthRequired ? "Required" : "Not Required"}
                  </Badge>
                </div>

                {authSource === "magic" ? (
                  <p className="text-sm text-gray-500 italic">
                    Magic auth sessions do not require re-authentication
                  </p>
                ) : (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => refreshSession()}
                      variant="outline"
                      className="flex-1"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Session
                    </Button>
                    <Button
                      onClick={skipReauth}
                      variant="outline"
                      className="flex-1"
                    >
                      Reset Timer
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testing Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Testing Instructions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-gray-600">
            To test the re-authentication system:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              Authenticate using MSAL, SSO, or another supported provider (not
              Magic Auth)
            </li>
            <li>
              Wait for {defaultReauthConfig.intervalMinutes} minutes or use
              browser dev tools to advance time
            </li>
            <li>
              A notification will appear 1 minute before re-auth is required
            </li>
            <li>
              When time expires, you&apos;ll be prompted to re-authenticate
            </li>
            <li>
              Use &quot;Refresh Session&quot; to manually trigger
              re-authentication
            </li>
            <li>
              Use &quot;Reset Timer&quot; to restart the{" "}
              {defaultReauthConfig.intervalMinutes}-minute countdown
            </li>
          </ol>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The re-authentication check runs every
              minute. The UI will update automatically when re-authentication is
              needed.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
