"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  Settings,
  Lock,
} from "lucide-react";
import {
  useWhitelabel,
  useBranding,
  useRoutes,
  useFeatures,
} from "@/components/providers/WhitelabelProvider";

export const dynamic = "force-dynamic";

export default function HomePage() {
  const [isDevMode, setIsDevMode] = useState<boolean | null>(null);

  useEffect(() => {
    // Check dev mode on client side
    setIsDevMode(process.env.NODE_ENV === "development");
  }, []);
  const { getContent } = useWhitelabel();
  const branding = useBranding();
  const routes = useRoutes();
  const features = useFeatures();
  const landingContent = getContent("landing");

  // If showIntro is false, show the custom landing page
  if (!features.template.showIntro) {
    return (
      <div className="flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="flex justify-center mb-8">
                <Image
                  src={branding.logo.light}
                  alt={branding.appName}
                  width={120}
                  height={120}
                  className="rounded-2xl shadow-lg"
                />
              </div>
              <h1 className="text-5xl font-bold mb-6 text-[#233862] dark:text-white">
                {landingContent.hero.title}
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                {landingContent.hero.subtitle}
              </p>
              <div className="flex gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]"
                >
                  {landingContent.hero.ctaPrimary}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white"
                >
                  {landingContent.hero.ctaSecondary}
                </Button>
              </div>
            </div>

            {/* Features Grid from config */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {landingContent.features.map((feature, index) => {
                const iconMap = {
                  Zap,
                  Shield,
                  Rocket,
                };
                const IconComponent =
                  iconMap[feature.icon as keyof typeof iconMap] || Sparkles;

                return (
                  <Card
                    key={index}
                    className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors"
                  >
                    <CardHeader>
                      <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
                        <IconComponent className="w-6 h-6 text-[#233862] dark:text-white" />
                      </div>
                      <CardTitle className="text-[#233862] dark:text-white">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show the template introduction
  return (
    <div className="flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              Template Documentation
            </Badge>
            <h1 className="text-5xl font-bold mb-6 text-[#233862] dark:text-white">
              Magic Button Assistant Template
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              A production-ready Next.js template for building AI-powered
              assistants with Anthropic Claude. Features enterprise
              authentication, observability, white-labeling, and more.
            </p>
            <div className="space-y-4">
              <div className="flex gap-4 justify-center">
                {isDevMode === null ? (
                  // Loading state
                  <Button
                    size="lg"
                    disabled
                    className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]"
                  >
                    <Settings className="mr-2 h-5 w-5" />
                    Setup
                  </Button>
                ) : isDevMode ? (
                  // Dev mode - enabled
                  <Link href="/setup">
                    <Button
                      size="lg"
                      className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]"
                    >
                      <Settings className="mr-2 h-5 w-5" />
                      Setup
                    </Button>
                  </Link>
                ) : (
                  // Production mode - disabled
                  <Button
                    size="lg"
                    disabled
                    className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                  >
                    <Lock className="mr-2 h-5 w-5" />
                    Setup
                  </Button>
                )}
                {routes.magicbutton && (
                  <Link href="/magicbutton">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white"
                    >
                      <Sparkles className="mr-2 h-5 w-5" />
                      View Demo
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                )}
              </div>
              {!isDevMode && isDevMode !== null && (
                <p className="text-sm text-muted-foreground text-center">
                  Setup wizard is only available in development mode
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
