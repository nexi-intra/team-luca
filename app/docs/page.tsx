'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, FileText, Book, Code, Lightbulb, Home, Sparkles, Settings, User } from 'lucide-react';
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

const docSections = [
  {
    title: 'Getting Started',
    description: 'Learn how to set up and configure your Magic Button Assistant',
    icon: Book,
    href: '/docs/getting-started',
  },
  {
    title: 'API Reference',
    description: 'Detailed documentation of all available APIs and endpoints',
    icon: Code,
    href: '/docs/api-reference',
  },
  {
    title: 'Examples',
    description: 'Sample code and implementation patterns',
    icon: Lightbulb,
    href: '/docs/examples',
  },
  {
    title: 'Best Practices',
    description: 'Guidelines and recommendations for building assistants',
    icon: FileText,
    href: '/docs/best-practices',
  },
];

export default function DocsPage() {
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
                      <SidebarMenuButton asChild isActive={item.href === '/docs'}>
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
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#233862] dark:text-white" />
              <h1 className="text-lg font-semibold">Documentation</h1>
            </div>
          </header>
          <div className="flex-1 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
            <div className="container mx-auto px-4 py-8">
              <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-4">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Home
                    </Button>
                  </Link>
                  <h1 className="text-4xl font-bold text-[#233862] dark:text-white mb-4">
                    Documentation
                  </h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300">
                    Everything you need to know about building with Magic Button Assistant
                  </p>
                </div>

                {/* Documentation Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  {docSections.map((section) => (
                    <Card 
                      key={section.href}
                      className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/20 dark:hover:border-gray-600 transition-colors cursor-pointer"
                    >
                      <CardHeader>
                        <div className="flex items-start gap-3">
                          <section.icon className="h-8 w-8 text-[#233862] dark:text-white mt-1" />
                          <div className="flex-1">
                            <CardTitle className="text-[#233862] dark:text-white">
                              {section.title}
                            </CardTitle>
                            <CardDescription className="mt-2">
                              {section.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <Link href={section.href}>
                          <Button 
                            variant="outline" 
                            className="w-full border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white"
                          >
                            View Documentation
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Links Section */}
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-[#233862] dark:text-white">
                      Quick Links
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Link 
                        href="/docs/getting-started" 
                        className="text-[#233862] dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Installation Guide
                      </Link>
                      <Link 
                        href="/docs/api-reference" 
                        className="text-[#233862] dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Code className="h-4 w-4" />
                        API Documentation
                      </Link>
                      <Link 
                        href="/docs/examples" 
                        className="text-[#233862] dark:text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Lightbulb className="h-4 w-4" />
                        Code Examples
                      </Link>
                    </div>
                  </CardContent>
                </Card>

                {/* Coming Soon Notice */}
                <div className="mt-8 p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    <strong>Note:</strong> This documentation is currently under construction. 
                    Please check back soon for complete guides and API references.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}