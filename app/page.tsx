'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Home, FileText, Settings, User } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export const dynamic = 'force-dynamic';

const sidebarItems = [
  {
    title: 'Home',
    icon: Home,
    href: '/',
  },
  {
    title: 'Magic Button',
    icon: Sparkles,
    href: '/magicbutton',
  },
  {
    title: 'Documentation',
    icon: FileText,
    href: '/docs',
  },
  {
    title: 'Settings',
    icon: Settings,
    href: '/settings',
  },
];

export default function HomePage() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2">
              <Image
                src="/magic-button-logo.svg"
                alt="Magic Button"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold">Magic Button</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={item.href === '/'}>
                        <Link href={item.href}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="border-t">
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/avatar-placeholder.png" alt="User" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">User Name</p>
                <p className="text-xs text-muted-foreground truncate">user@example.com</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-16 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <h1 className="text-lg font-semibold">Magic Button Assistant Template</h1>
          </header>
          <div className="flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
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
                  <h1 className="text-5xl font-bold mb-6 text-[#233862] dark:text-white">
                    Magic Button Assistant Template
                  </h1>
                  <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                    Build powerful AI assistants with Anthropic Claude. This template provides everything you need to get started quickly.
                        </p>
                  <Link href="/magicbutton">
                    <Button size="lg" className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
                      <Sparkles className="mr-2 h-5 w-5" />
                      Explore Magic Button
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/20 dark:hover:border-gray-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-[#233862] dark:text-white">Getting Started</CardTitle>
                <CardDescription>
                  Everything you need to build your AI assistant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  This template includes a complete setup for building specialized AI assistants:
                      </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Next.js 14 with App Router</li>
                  <li>OpenTelemetry instrumentation</li>
                  <li>shadcn/ui components</li>
                  <li>Azure AD authentication</li>
                  <li>Claude AI integration ready</li>
                  <li>Demo automation system</li>
                </ul>
                <Link href="/magicbutton">
                  <Button className="mt-6 bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
                    Start Building
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/20 dark:hover:border-gray-600 transition-colors">
              <CardHeader>
                <CardTitle className="text-[#233862] dark:text-white">Customize Your Assistant</CardTitle>
                <CardDescription>
                  Tailor this template for your specific needs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-gray-600 dark:text-gray-300">
                  Replace the template placeholders with your specific use case:
                      </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-300">
                  <li>Update app title and metadata</li>
                  <li>Add your specific AI prompts</li>
                  <li>Configure domain features</li>
                  <li>Customize the UI workflow</li>
                  <li>Set up environment variables</li>
                  <li>Deploy to Vercel</li>
                </ul>
                <Button variant="outline" className="mt-6 border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white">
                  View Documentation
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Links */}
          <div className="mt-12 p-8 bg-[#233862]/5 dark:bg-gray-800/50 rounded-xl text-center">
            <h2 className="text-2xl font-semibold text-[#233862] dark:text-white mb-4">
              Ready to explore?
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Visit the Magic Button demo to see the assistant capabilities in action.
                  </p>
            <Link href="/magicbutton">
              <Button variant="outline" className="border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white">
                Go to Magic Button
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}