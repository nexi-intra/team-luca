"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Shield,
  Code,
  FileText,
  Palette,
  Globe,
  Activity,
  Users,
  GitBranch,
  CheckCircle,
  Sparkles,
  Rocket,
} from "lucide-react";

export function OnboardingInfo() {
  return (
    <Tabs defaultValue="features" className="mb-16">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="features">Features</TabsTrigger>
        <TabsTrigger value="tech-stack">Tech Stack</TabsTrigger>
        <TabsTrigger value="white-label">White-labeling</TabsTrigger>
        <TabsTrigger value="quick-start">Quick Start</TabsTrigger>
      </TabsList>

      {/* Features Tab */}
      <TabsContent value="features" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Shield className="h-6 w-6 text-[#233862] dark:text-white" />
                <CardTitle>Enterprise Authentication</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Azure AD/Microsoft integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Session management</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Role-based access control</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Activity className="h-6 w-6 text-[#233862] dark:text-white" />
                <CardTitle>Full Observability</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>OpenTelemetry instrumentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Client & server-side tracing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Sensitive data masking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Sparkles className="h-6 w-6 text-[#233862] dark:text-white" />
                <CardTitle>AI Integration Ready</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Anthropic Claude setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Streaming responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Token usage tracking</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-[#233862] dark:text-white" />
                <CardTitle>Internationalization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Multi-language support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>RTL layout support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Locale detection</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users className="h-6 w-6 text-[#233862] dark:text-white" />
                <CardTitle>Accessibility First</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>WCAG 2.1 compliance</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Screen reader support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Keyboard navigation</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-[#233862] dark:text-white" />
                <CardTitle>Role-based Docs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>User documentation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Admin guides</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Developer API docs</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Tech Stack Tab */}
      <TabsContent value="tech-stack" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#233862] dark:text-white">
              Frontend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Code className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">Next.js 15</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    App Router, Server Components
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Code className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">React 19</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Latest React features
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Code className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">TypeScript</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Type-safe development
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Palette className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">Tailwind CSS + shadcn/ui</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Modern UI components
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-4 text-[#233862] dark:text-white">
              Backend & Infrastructure
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Shield className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">Custom OAuth 2.0</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Microsoft Entra ID integration
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Activity className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">OpenTelemetry</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Full observability stack
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Sparkles className="h-5 w-5 text-[#233862] dark:text-white" />
                <div>
                  <div className="font-medium">Anthropic Claude</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    AI assistant integration
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-[#233862] dark:text-white">
            Additional Tools
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>pnpm</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>ESLint</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Prettier</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Koksmat Companion</span>
            </div>
          </div>
        </div>
      </TabsContent>

      {/* White-label Tab */}
      <TabsContent value="white-label" className="mt-8">
        <div className="space-y-8">
          <Card className="border-[#233862]/20 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                White-labeling System
              </CardTitle>
              <CardDescription>
                Fork-friendly configuration for easy customization and updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How it works:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <li>
                    All customization is centralized in{" "}
                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                      /config/whitelabel.ts
                    </code>
                  </li>
                  <li>Fork the repository and edit this single file</li>
                  <li>
                    Your branding automatically applies throughout the app
                  </li>
                  <li>Pull upstream updates with minimal merge conflicts</li>
                </ol>
              </div>

              <div>
                <h4 className="font-medium mb-2">What you can customize:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Branding</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          App name, logos, colors
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Features</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Enable/disable functionality
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Content</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Landing page, footer links
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div>
                        <div className="font-medium">Routes</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Show/hide sections
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm">
                  <strong>Tip:</strong> Set{" "}
                  <code className="bg-blue-100 dark:bg-blue-900/50 px-1 py-0.5 rounded">
                    features.template.showIntro: false
                  </code>
                  to hide this intro and show your custom content.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      {/* Quick Start Tab */}
      <TabsContent value="quick-start" className="mt-8">
        <div className="space-y-8">
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Quick Start Guide
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="space-y-6">
                <li>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#233862] text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">Fork and Clone</h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">
                        <code>{`git clone https://github.com/your-username/your-fork.git
cd your-fork
pnpm install`}</code>
                      </pre>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#233862] text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        Configure Environment
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Use the configuration wizard above to set up your
                        environment variables
                      </p>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#233862] text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        Customize White-label
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Edit{" "}
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                          /config/whitelabel.ts
                        </code>{" "}
                        with your branding:
                      </p>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">
                        <code>{`branding: {
  appName: 'Your App Name',
  logo: {
    light: '/your-logo.svg',
  },
  // ...
}`}</code>
                      </pre>
                    </div>
                  </div>
                </li>

                <li>
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#233862] text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-2">
                        Run Development Server
                      </h4>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm overflow-x-auto">
                        <code>pnpm dev</code>
                      </pre>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Visit{" "}
                        <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">
                          http://localhost:2803
                        </code>
                      </p>
                    </div>
                  </div>
                </li>
              </ol>
            </CardContent>
          </Card>

          <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <GitBranch className="h-5 w-5" />
                Pulling Updates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
                Keep your fork updated with upstream changes:
              </p>
              <pre className="bg-amber-100 dark:bg-amber-900/50 p-3 rounded-lg text-sm overflow-x-auto">
                <code>{`# Add upstream remote (once)
git remote add upstream https://github.com/magicbutton/nextjs-template.git

# Pull updates
git fetch upstream
git merge upstream/main`}</code>
              </pre>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}
