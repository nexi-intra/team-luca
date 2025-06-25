"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AzurePage() {
  const [copied, setCopied] = useState(false);

  const aiPrompt = `Please help me set up my Magic Button application with Microsoft Entra ID authentication.

First, verify my Azure login status by running:
\`\`\`
az account show
\`\`\`

If I'm not logged in, help me log in with:
\`\`\`
az login
\`\`\`

Once logged in, help me create an app registration and set up my .env.local file with these variables:

1. Create an Entra ID app registration:
   - Name: "Magic Button Dev"
   - Redirect URI: http://localhost:2803/
   - Enable ID tokens and access tokens
   - Add Microsoft Graph User.Read permission

2. Create a .env.local file in apps/web/ with:
\`\`\`
# Authentication Provider
AUTH_PROVIDER=entraid

# Authentication Configuration (Microsoft Entra ID)
NEXT_PUBLIC_AUTH_CLIENT_ID=<Application (client) ID from Azure Portal>
NEXT_PUBLIC_AUTH_AUTHORITY=https://login.microsoftonline.com/<Directory (tenant) ID>

# Server-side auth variables (duplicate for API routes)
AUTH_CLIENT_ID=<Same as NEXT_PUBLIC_AUTH_CLIENT_ID>
AUTH_AUTHORITY=<Same as NEXT_PUBLIC_AUTH_AUTHORITY>

# Session Secret (generate a random string)
SESSION_SECRET=<Generate a random 32+ character string>

# Node Environment
NODE_ENV=development
\`\`\`

Please guide me through each step and help me find the correct values in the Azure Portal.`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(aiPrompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Azure AD / Entra ID Setup</h1>
        <p className="text-gray-600">
          Configure your Microsoft Entra ID app registration for authentication.
        </p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          You&apos;ll need access to the Azure Portal with permissions to create
          app registrations in your tenant.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="ai-assisted" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="ai-assisted">AI Assisted</TabsTrigger>
          <TabsTrigger value="manual">Manual Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="ai-assisted" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistant Setup</CardTitle>
              <CardDescription>
                Use this prompt with your AI assistant (like Claude or ChatGPT)
                to help you set up Azure authentication
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  This prompt will guide you through verifying your Azure CLI
                  login, creating an app registration, and setting up your
                  environment variables.
                </AlertDescription>
              </Alert>

              <div>
                <h3 className="font-medium mb-3">Setup Prompt</h3>
                <div className="relative">
                  <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                    {aiPrompt}
                  </pre>
                  <Button
                    onClick={copyToClipboard}
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>What the AI Assistant Will Do</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Verify Azure CLI Login</div>
                    <div className="text-sm text-gray-600">
                      Check if you&apos;re logged into Azure and help you log in
                      if needed
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Create App Registration</div>
                    <div className="text-sm text-gray-600">
                      Guide you through creating an Entra ID app registration
                      with the correct settings
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Generate Environment File</div>
                    <div className="text-sm text-gray-600">
                      Create a complete .env.local file with all required
                      variables
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">
                      Provide Step-by-Step Guidance
                    </div>
                    <div className="text-sm text-gray-600">
                      Help you find the correct values in the Azure Portal
                    </div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-2 text-sm">
                <li>1. Copy the prompt above</li>
                <li>
                  2. Paste it into your AI assistant (Claude, ChatGPT, etc.)
                </li>
                <li>3. Follow the guided setup process</li>
                <li>
                  4. Save the generated .env.local file in your apps/web
                  directory
                </li>
                <li>5. Restart your development server</li>
                <li>
                  6. Test authentication at{" "}
                  <a
                    href="/magicbutton/auth-demo"
                    className="text-blue-600 hover:underline"
                  >
                    /magicbutton/auth-demo
                  </a>
                </li>
              </ol>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Create App Registration</CardTitle>
              <CardDescription>
                Register your application in Azure AD
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  <div>
                    <p>
                      Go to{" "}
                      <a
                        href="https://portal.azure.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline inline-flex items-center gap-1"
                      >
                        Azure Portal <ExternalLink className="h-3 w-3" />
                      </a>
                    </p>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  <p>
                    Navigate to <strong>Azure Active Directory</strong> →{" "}
                    <strong>App registrations</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  <p>
                    Click <strong>New registration</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  <div>
                    <p>Fill in the registration form:</p>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>
                        • <strong>Name:</strong> Magic Button Dev (or your
                        preferred name)
                      </li>
                      <li>
                        • <strong>Supported account types:</strong> Single
                        tenant (this directory only)
                      </li>
                      <li>
                        • <strong>Redirect URI:</strong> Select
                        &quot;Single-page application (SPA)&quot; and enter{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          http://localhost:2803/
                        </code>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">5.</span>
                  <p>
                    Click <strong>Register</strong>
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 2: Configure Authentication</CardTitle>
              <CardDescription>
                Set up the authentication settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  <p>
                    In your app registration, go to{" "}
                    <strong>Authentication</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  <div>
                    <p>
                      Under <strong>Single-page application</strong>, ensure
                      these are set:
                    </p>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>
                        • Redirect URI:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          http://localhost:2803/
                        </code>
                      </li>
                      <li>• For production, add your production URL</li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  <div>
                    <p>
                      Under <strong>Implicit grant and hybrid flows</strong>:
                    </p>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>
                        • Check: <strong>Access tokens</strong>
                      </li>
                      <li>
                        • Check: <strong>ID tokens</strong>
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  <p>
                    Click <strong>Save</strong>
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 3: Configure API Permissions</CardTitle>
              <CardDescription>
                Add necessary permissions for your application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ol className="space-y-3 text-sm">
                <li className="flex gap-2">
                  <span className="font-medium">1.</span>
                  <p>
                    Go to <strong>API permissions</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">2.</span>
                  <p>
                    Click <strong>Add a permission</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">3.</span>
                  <p>
                    Select <strong>Microsoft Graph</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">4.</span>
                  <p>
                    Select <strong>Delegated permissions</strong>
                  </p>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">5.</span>
                  <div>
                    <p>Add these permissions:</p>
                    <ul className="mt-2 ml-4 space-y-1">
                      <li>
                        • <strong>User.Read</strong> (Sign in and read user
                        profile)
                      </li>
                      <li>
                        • <strong>openid</strong> (Sign users in)
                      </li>
                      <li>
                        • <strong>profile</strong> (View users&apos; basic
                        profile)
                      </li>
                      <li>
                        • <strong>email</strong> (View users&apos; email
                        address)
                      </li>
                    </ul>
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-medium">6.</span>
                  <p>
                    Click <strong>Add permissions</strong>
                  </p>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Step 4: Get Your Configuration Values</CardTitle>
              <CardDescription>
                Copy these values to your .env.local file
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Application (client) ID</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Found on the <strong>Overview</strong> page of your app
                  registration
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm">
                  NEXT_PUBLIC_AUTH_CLIENT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                </div>
              </div>
              <div>
                <h3 className="font-medium mb-2">Directory (tenant) ID</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Found on the <strong>Overview</strong> page of your app
                  registration
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg font-mono text-sm">
                  NEXT_PUBLIC_AUTH_AUTHORITY=https://login.microsoftonline.com/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Production Deployment</CardTitle>
              <CardDescription>
                Additional steps for production environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">
                      Add production redirect URIs
                    </div>
                    <div className="text-gray-600">
                      Add your production domain (e.g., https://yourdomain.com/)
                      to redirect URIs
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Enable HTTPS only</div>
                    <div className="text-gray-600">
                      In production, ensure all redirect URIs use HTTPS
                    </div>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Consider multi-tenant</div>
                    <div className="text-gray-600">
                      If you need users from other tenants, change account type
                      to multi-tenant
                    </div>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
