"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function TestAuthPage() {
  const [testResults, setTestResults] = useState<{
    envVars?: boolean;
    authConfig?: boolean;
    sessionApi?: boolean;
  }>({});
  const [testing, setTesting] = useState(false);

  const runTests = async () => {
    setTesting(true);
    setTestResults({});

    // Test 1: Check environment variables
    const hasEnvVars = !!(
      process.env.NEXT_PUBLIC_AUTH_CLIENT_ID &&
      process.env.NEXT_PUBLIC_AUTH_AUTHORITY
    );
    setTestResults((prev) => ({ ...prev, envVars: hasEnvVars }));

    // Test 2: Check auth configuration
    try {
      const response = await fetch("/api/auth/session");
      const isAuthConfigured = response.ok || response.status === 401; // 401 is ok, means auth is configured
      setTestResults((prev) => ({ ...prev, authConfig: isAuthConfigured }));
    } catch (error) {
      setTestResults((prev) => ({ ...prev, authConfig: false }));
    }

    // Test 3: Check session API
    try {
      const response = await fetch("/api/auth/session");
      const sessionApiWorks = response.status !== 500;
      setTestResults((prev) => ({ ...prev, sessionApi: sessionApiWorks }));
    } catch (error) {
      setTestResults((prev) => ({ ...prev, sessionApi: false }));
    }

    setTesting(false);
  };

  const allTestsPassed = Object.values(testResults).every(
    (result) => result === true,
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Test Authentication</h1>
        <p className="text-gray-600">
          Verify that your authentication setup is working correctly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configuration Tests</CardTitle>
          <CardDescription>Run these tests to check your setup</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={runTests} disabled={testing}>
            {testing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running Tests...
              </>
            ) : (
              "Run Tests"
            )}
          </Button>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-3 mt-6">
              <div className="flex items-center gap-3">
                {testResults.envVars ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Environment Variables</div>
                  <div className="text-sm text-gray-600">
                    {testResults.envVars
                      ? "Client ID and Authority are configured"
                      : "Missing required environment variables"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {testResults.authConfig ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Auth Configuration</div>
                  <div className="text-sm text-gray-600">
                    {testResults.authConfig
                      ? "Authentication provider is configured"
                      : "Authentication provider is not properly configured"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {testResults.sessionApi ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium">Session API</div>
                  <div className="text-sm text-gray-600">
                    {testResults.sessionApi
                      ? "Session API is working correctly"
                      : "Session API is returning errors"}
                  </div>
                </div>
              </div>
            </div>
          )}

          {allTestsPassed && Object.keys(testResults).length > 0 && (
            <Alert className="mt-6">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                All tests passed! Your authentication is configured correctly.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Testing</CardTitle>
          <CardDescription>Test the actual authentication flow</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            After running the automated tests, you should manually test the
            authentication flow:
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex gap-2">
              <span className="font-medium">1.</span>
              <div>
                <p>
                  Restart your development server to ensure environment
                  variables are loaded:
                </p>
                <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs mt-1 inline-block">
                  pnpm dev
                </code>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">2.</span>
              <div>
                <p>Go to the authentication demo page:</p>
                <Link href="/magicbutton/auth-demo">
                  <Button variant="outline" size="sm" className="mt-1">
                    Open Auth Demo <ExternalLink className="ml-2 h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">3.</span>
              <p>
                Click the &quot;Sign In&quot; button and complete the
                authentication flow
              </p>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">4.</span>
              <p>Verify that your user information appears after signing in</p>
            </li>
            <li className="flex gap-2">
              <span className="font-medium">5.</span>
              <p>Test the &quot;Sign Out&quot; functionality</p>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common Issues</CardTitle>
          <CardDescription>
            Troubleshooting guide for common problems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium mb-1">
              AADSTS700054: response_type &apos;id_token&apos; is not enabled
            </h3>
            <p className="text-sm text-gray-600">
              Enable ID tokens in your app registration under Authentication →
              Implicit grant
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">
              AADSTS50011: Reply URL mismatch
            </h3>
            <p className="text-sm text-gray-600">
              Ensure your redirect URI in Azure exactly matches your application
              URL (including trailing slash)
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">Session API returns 500 error</h3>
            <p className="text-sm text-gray-600">
              Check that SESSION_SECRET is set in your .env.local file
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-1">
              Authentication popup doesn&apos;t appear
            </h3>
            <p className="text-sm text-gray-600">
              Check your browser&apos;s popup blocker settings and allow popups
              from localhost
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Once authentication is working correctly:
          </p>
          <div className="flex gap-3">
            <Link href="/setup">
              <Button variant="outline">Back to Setup</Button>
            </Link>
            <Link href="/">
              <Button>Go to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
