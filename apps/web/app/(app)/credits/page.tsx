"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useBreadcrumbTitle } from "@/hooks/useBreadcrumbTitle";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default function CreditsPage() {
  useBreadcrumbTitle("Credits & Attributions");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-foreground">
          Credits & Attributions
        </h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>About Open Source</CardTitle>
            <CardDescription>
              This application is built on the foundation of amazing open source
              projects. We&apos;re grateful to all the maintainers and
              contributors who make these tools available.
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue="core" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="core">Core Libraries</TabsTrigger>
            <TabsTrigger value="ui">UI Components</TabsTrigger>
            <TabsTrigger value="tools">Development Tools</TabsTrigger>
          </TabsList>

          <TabsContent value="core" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Libraries</CardTitle>
                <CardDescription>
                  Essential frameworks and libraries that power this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Next.js</h3>
                      <p className="text-sm text-muted-foreground">
                        The React Framework for Production
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/vercel/next.js"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/vercel/next.js
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">React</h3>
                      <p className="text-sm text-muted-foreground">
                        A JavaScript library for building user interfaces
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/facebook/react"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/facebook/react
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">TypeScript</h3>
                      <p className="text-sm text-muted-foreground">
                        TypeScript is a strongly typed programming language that
                        builds on JavaScript
                      </p>
                      <p className="text-xs mt-1">License: Apache-2.0</p>
                      <Link
                        href="https://github.com/microsoft/TypeScript"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/microsoft/TypeScript
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">@azure/msal-react</h3>
                      <p className="text-sm text-muted-foreground">
                        Microsoft Authentication Library for React
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/AzureAD/microsoft-authentication-library-for-js"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/AzureAD/microsoft-authentication-library-for-js
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">@anthropic-ai/sdk</h3>
                      <p className="text-sm text-muted-foreground">
                        Official TypeScript SDK for the Anthropic API
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/anthropics/anthropic-sdk-typescript"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/anthropics/anthropic-sdk-typescript
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">OpenTelemetry</h3>
                      <p className="text-sm text-muted-foreground">
                        Observability framework for cloud-native software
                      </p>
                      <p className="text-xs mt-1">License: Apache-2.0</p>
                      <Link
                        href="https://github.com/open-telemetry/opentelemetry-js"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/open-telemetry/opentelemetry-js
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Zustand</h3>
                      <p className="text-sm text-muted-foreground">
                        A small, fast and scalable state-management solution
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/pmndrs/zustand"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/pmndrs/zustand
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Zod</h3>
                      <p className="text-sm text-muted-foreground">
                        TypeScript-first schema validation
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/colinhacks/zod"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/colinhacks/zod
                      </Link>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ui" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>UI Components & Styling</CardTitle>
                <CardDescription>
                  Libraries that enhance the user interface and experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Radix UI</h3>
                      <p className="text-sm text-muted-foreground">
                        Low-level UI primitives for building high-quality design
                        systems
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/radix-ui/primitives"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/radix-ui/primitives
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">shadcn/ui</h3>
                      <p className="text-sm text-muted-foreground">
                        Beautifully designed components built with Radix UI and
                        Tailwind CSS
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/shadcn-ui/ui"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/shadcn-ui/ui
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Tailwind CSS</h3>
                      <p className="text-sm text-muted-foreground">
                        A utility-first CSS framework
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/tailwindlabs/tailwindcss"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/tailwindlabs/tailwindcss
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Lucide React</h3>
                      <p className="text-sm text-muted-foreground">
                        Beautiful & consistent icon toolkit
                      </p>
                      <p className="text-xs mt-1">License: ISC</p>
                      <Link
                        href="https://github.com/lucide-icons/lucide"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/lucide-icons/lucide
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Framer Motion</h3>
                      <p className="text-sm text-muted-foreground">
                        A production-ready motion library for React
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/framer/motion"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/framer/motion
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Recharts</h3>
                      <p className="text-sm text-muted-foreground">
                        A composable charting library built on React components
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/recharts/recharts"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/recharts/recharts
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">
                        react-syntax-highlighter
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Syntax highlighting component for React
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/react-syntax-highlighter/react-syntax-highlighter"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/react-syntax-highlighter/react-syntax-highlighter
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">cmdk</h3>
                      <p className="text-sm text-muted-foreground">
                        Fast, composable, unstyled command menu for React
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/pacocoursey/cmdk"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/pacocoursey/cmdk
                      </Link>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Development Tools</CardTitle>
                <CardDescription>
                  Tools that enhance the development experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] w-full pr-4">
                  <div className="space-y-4">
                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Jest</h3>
                      <p className="text-sm text-muted-foreground">
                        Delightful JavaScript Testing Framework
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/facebook/jest"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/facebook/jest
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Testing Library</h3>
                      <p className="text-sm text-muted-foreground">
                        Simple and complete testing utilities
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/testing-library/react-testing-library"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/testing-library/react-testing-library
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Playwright</h3>
                      <p className="text-sm text-muted-foreground">
                        Reliable end-to-end testing for modern web apps
                      </p>
                      <p className="text-xs mt-1">License: Apache-2.0</p>
                      <Link
                        href="https://github.com/microsoft/playwright"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/microsoft/playwright
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">ESLint</h3>
                      <p className="text-sm text-muted-foreground">
                        Find and fix problems in your JavaScript code
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/eslint/eslint"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/eslint/eslint
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">PostCSS</h3>
                      <p className="text-sm text-muted-foreground">
                        A tool for transforming CSS with JavaScript
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/postcss/postcss"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/postcss/postcss
                      </Link>
                    </div>

                    <div className="border-b pb-3">
                      <h3 className="font-semibold">Autoprefixer</h3>
                      <p className="text-sm text-muted-foreground">
                        Parse CSS and add vendor prefixes to rules
                      </p>
                      <p className="text-xs mt-1">License: MIT</p>
                      <Link
                        href="https://github.com/postcss/autoprefixer"
                        className="text-xs text-blue-500 hover:underline"
                      >
                        https://github.com/postcss/autoprefixer
                      </Link>
                    </div>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>License Information</CardTitle>
            <CardDescription>
              This application is licensed under the MIT License. Copyright ©
              2025 MagicButton OÜ.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The MIT License requires that the copyright notice and permission
              notice be included in all copies or substantial portions of the
              software. This credits page fulfills that requirement for all
              MIT-licensed dependencies used in this project.
            </p>
            <p className="text-sm text-muted-foreground mt-3">
              For Apache-2.0 licensed software (TypeScript, OpenTelemetry,
              Playwright), we acknowledge their use and provide links to their
              respective repositories where the full license text can be found.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
