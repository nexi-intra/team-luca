'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DemoElement } from '@/app/(magicbutton)/components/demo';
import { Sparkles, Zap, Shield, Rocket } from 'lucide-react';
import { useWhitelabel } from '@/components/providers/WhitelabelProvider';

export const dynamic = 'force-dynamic';

export default function MagicButtonPage() {
  const { getContent } = useWhitelabel();
  const landingContent = getContent('landing');
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="inline-flex items-center justify-center p-2 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-full mb-6">
          <Sparkles className="w-8 h-8 text-[#233862] dark:text-white" />
        </div>
        <h1 className="text-5xl font-bold text-[#233862] dark:text-white mb-4">
          {landingContent.hero.title}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          {landingContent.hero.subtitle}
        </p>
        <div className="flex gap-4 justify-center">
          <DemoElement id="get-started-button">
            <Button size="lg" className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
              {landingContent.hero.ctaPrimary}
            </Button>
          </DemoElement>
          <DemoElement id="learn-more-button">
            <Button size="lg" variant="outline" className="border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white">
              {landingContent.hero.ctaSecondary}
            </Button>
          </DemoElement>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <h2 className="text-3xl font-bold text-[#233862] dark:text-white text-center mb-8">
          Key Features
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <DemoElement id="feature-ai-powered">
            <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-[#233862] dark:text-white" />
                </div>
                <CardTitle className="text-[#233862] dark:text-white">AI-Powered</CardTitle>
                <CardDescription>
                  Leverages Anthropic Claude for intelligent assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Get smart suggestions, automated workflows, and natural language interactions.
                </p>
              </CardContent>
            </Card>
          </DemoElement>

          <DemoElement id="feature-secure">
            <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-[#233862] dark:text-white" />
                </div>
                <CardTitle className="text-[#233862] dark:text-white">Secure by Design</CardTitle>
                <CardDescription>
                  Enterprise-grade security with Azure AD integration
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Your data is protected with industry-standard authentication and encryption.
                </p>
              </CardContent>
            </Card>
          </DemoElement>

          <DemoElement id="feature-scalable">
            <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-[#233862] dark:text-white" />
                </div>
                <CardTitle className="text-[#233862] dark:text-white">Highly Scalable</CardTitle>
                <CardDescription>
                  Built on Next.js for optimal performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300">
                  Scales effortlessly from prototype to production with modern infrastructure.
                </p>
              </CardContent>
            </Card>
          </DemoElement>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#233862]/5 dark:bg-gray-800/50 rounded-2xl p-12 text-center">
        <h2 className="text-3xl font-bold text-[#233862] dark:text-white mb-4">
          Ready to Get Started?
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          Experience the power of AI-assisted development. Create your own Magic Button assistant today.
        </p>
        <DemoElement id="start-building-button">
          <Button size="lg" className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
            Start Building
          </Button>
        </DemoElement>
      </section>
    </div>
  );
}