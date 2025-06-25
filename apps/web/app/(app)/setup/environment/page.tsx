"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Lock, FileText, GitBranch } from "lucide-react";
import { OnboardingInfo } from "./components/OnboardingInfo";
import { EnvConfigWizard } from "./components/EnvConfigWizard";

export default function EnvironmentPage() {
  const [devMode, setDevMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Check dev mode on client side
    setDevMode(process.env.NODE_ENV === "development");
  }, []);

  if (devMode === null) {
    return (
      <div className="flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-16">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!devMode) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Environment Configuration</h1>
          <p className="text-gray-600">
            Configure your environment variables for the Magic Button
            application.
          </p>
        </div>

        <Alert variant="destructive">
          <Lock className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription className="mt-2">
            The environment configuration wizard is only available in
            development mode. This is a security feature to prevent accidental
            exposure of sensitive configuration in production environments.
          </AlertDescription>
        </Alert>

        <Card>
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-4">What to do instead:</h3>
            <ol className="space-y-3 text-sm">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <div>
                  <p className="font-medium">Use environment variables</p>
                  <p className="text-muted-foreground">
                    Configure your application using environment variables in
                    your hosting platform
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <div>
                  <p className="font-medium">Run setup locally</p>
                  <p className="text-muted-foreground">
                    Clone the repository and run the setup wizard in your local
                    development environment
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div>
                  <p className="font-medium">Check documentation</p>
                  <p className="text-muted-foreground">
                    Refer to the deployment documentation for your specific
                    hosting platform
                  </p>
                </div>
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Environment Configuration</h1>
        <Badge variant="secondary" className="mb-4">
          Development Mode
        </Badge>
        <p className="text-gray-600">
          Configure your environment variables and get started with the Magic
          Button Assistant Template
        </p>
      </div>

      {/* Environment Configuration Wizard */}
      <div>
        <EnvConfigWizard />
      </div>

      {/* Onboarding Information */}
      <div className="mt-12">
        <h2 className="text-2xl font-semibold mb-6">Template Information</h2>
        <OnboardingInfo />
      </div>

      {/* Call to Action */}
      <div className="mt-16 p-8 bg-[#233862]/5 dark:bg-gray-800/50 rounded-xl text-center">
        <h2 className="text-2xl font-semibold text-[#233862] dark:text-white mb-4">
          Ready to build your AI assistant?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
          This template provides everything you need. Fork it, customize it, and
          deploy your own AI-powered assistant.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="https://github.com/magicbutton/nextjs-template"
            target="_blank"
          >
            <Button
              size="lg"
              className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]"
            >
              <GitBranch className="mr-2 h-5 w-5" />
              Fork on GitHub
            </Button>
          </Link>
          <Link href="/docs">
            <Button
              size="lg"
              variant="outline"
              className="border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white"
            >
              <FileText className="mr-2 h-5 w-5" />
              Read Documentation
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
