'use client';

import { BreadcrumbContainer } from '@/components/navigation/BreadcrumbContainer';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandTrigger } from '@/components/command/CommandTrigger';
import { LanguageSelector } from '@/components/language-selector';
import { AccessibilityQuickControls } from '@/components/accessibility/quick-controls';
import { useBranding, useRoutes } from '@/components/providers/WhitelabelProvider';
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
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { AuthStatus } from '@/components/auth/AuthStatus';
import Image from 'next/image';
import Link from 'next/link';
import { Home, FileText, Settings, User, BarChart, Shield, Sparkles, Users, ChevronUp } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/lib/auth/auth-context';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePathname } from 'next/navigation';

const getSidebarItems = (routes: any) => [
  routes.home && {
    title: 'Home',
    icon: Home,
    href: '/',
  },
  routes.dashboard && {
    title: 'Dashboard',
    icon: BarChart,
    href: '/dashboard',
  },
].filter(Boolean) as Array<{ title: string; icon: any; href: string }>;

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuth();
  const branding = useBranding();
  const routes = useRoutes();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="sticky top-0 h-screen">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2">
              <Image
                src={branding.logo.light}
                alt={branding.appName}
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold">{branding.appNameShort}</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {getSidebarItems(routes).map((item) => (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild isActive={pathname === item.href}>
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
            <SidebarMenu>
              {routes.docs && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/docs'}>
                    <Link href="/docs">
                      <FileText className="h-4 w-4" />
                      <span>Documentation</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {routes.accessibility && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/accessibility'}>
                    <Link href="/accessibility">
                      <Shield className="h-4 w-4" />
                      <span>Accessibility</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
              {routes.settings && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === '/settings'}>
                    <Link href="/settings">
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
            <SidebarSeparator />
            <SidebarMenu>
              <SidebarMenuItem>
                <AuthStatus />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          {/* Header with sidebar trigger */}
          <header className="flex h-14 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <h1 className="flex-1 text-lg font-semibold">{branding.appName}</h1>
            <div className="flex items-center gap-2">
              <CommandTrigger variant="ghost" size="sm" />
              <LanguageSelector variant="ghost" size="sm" showName={false} />
              <AccessibilityQuickControls />
              <ThemeToggle />
            </div>
          </header>
          
          {/* Breadcrumb navigation */}
          <BreadcrumbContainer />
          
          {/* Main content */}
          <main className="flex-1 p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}