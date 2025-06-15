import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <Image
                src="/magic-button-logo.svg"
                alt="Magic Button"
                width={120}
                height={120}
                className="rounded-2xl shadow-lg"
              />
            </div>
            <h1 className="text-5xl font-bold mb-6 text-[#233862]">
              Magic Button Assistant Template
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Build powerful AI assistants with Anthropic Claude. This template provides everything you need to get started quickly.
            </p>
            <Link href="/magicbutton">
              <Button size="lg" className="bg-[#233862] hover:bg-[#233862]/90">
                <Sparkles className="mr-2 h-5 w-5" />
                Explore Magic Button
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-200 hover:border-[#233862]/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-[#233862]">Getting Started</CardTitle>
                <CardDescription>
                  Everything you need to build your AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  This template includes a complete setup for building specialized AI assistants:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Next.js 14 with App Router</li>
                  <li>OpenTelemetry instrumentation</li>
                  <li>shadcn/ui components</li>
                  <li>Azure AD authentication</li>
                  <li>Claude AI integration ready</li>
                  <li>Demo automation system</li>
                </ul>
                <Link href="/magicbutton">
                  <Button className="mt-6 bg-[#233862] hover:bg-[#233862]/90">
                    Start Building
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-[#233862]/20 transition-colors">
              <CardHeader>
                <CardTitle className="text-[#233862]">Customize Your Assistant</CardTitle>
                <CardDescription>
                  Tailor this template for your specific needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600">
                  Replace the template placeholders with your specific use case:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Update app title and metadata</li>
                  <li>Add your specific AI prompts</li>
                  <li>Configure domain features</li>
                  <li>Customize the UI workflow</li>
                  <li>Set up environment variables</li>
                  <li>Deploy to Vercel</li>
                </ul>
                <Button variant="outline" className="mt-6 border-[#233862] text-[#233862]">
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="mt-12 p-8 bg-[#233862]/5 rounded-xl text-center">
            <h2 className="text-2xl font-semibold text-[#233862] mb-4">
              Ready to explore?
            </h2>
            <p className="text-gray-600 mb-6">
              Visit the Magic Button demo to see the assistant capabilities in action.
            </p>
            <Link href="/magicbutton">
              <Button variant="outline" className="border-[#233862] text-[#233862]">
                Go to Magic Button
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}