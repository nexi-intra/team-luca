'use client';

import React from 'react';
import { 
  Home,
  Users,
  Settings,
  FileText,
  BarChart3,
  Calendar,
  Mail,
  MessageSquare,
  HelpCircle,
  ChevronUp,
  User2,
  LogOut,
  CreditCard,
  Keyboard,
  Bell,
} from 'lucide-react';
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
  SidebarRail,
  SidebarTrigger,
  SidebarMenuBadge,
  SidebarWithFeatureGate,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeatureGate } from '@/lib/features';

export const dynamic = 'force-dynamic';

const navigation = [
  {
    title: 'Dashboard',
    items: [
      { title: 'Overview', icon: Home, url: '#', badge: null },
      { title: 'Analytics', icon: BarChart3, url: '#', badge: 'New' },
      { title: 'Reports', icon: FileText, url: '#', badge: '3' },
    ],
  },
  {
    title: 'Management',
    items: [
      { title: 'Users', icon: Users, url: '#', badge: null },
      { title: 'Calendar', icon: Calendar, url: '#', badge: null },
      { title: 'Settings', icon: Settings, url: '#', badge: null },
    ],
  },
  {
    title: 'Communication',
    items: [
      { title: 'Messages', icon: MessageSquare, url: '#', badge: '12' },
      { title: 'Email', icon: Mail, url: '#', badge: '5' },
    ],
  },
];

export default function SidebarLayoutExample() {
  const [activeItem, setActiveItem] = React.useState('Overview');

  return (
    <FeatureGate featureId="sidebar-panel" fallback={
      <div className="flex items-center justify-center min-h-[600px]">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Feature Not Available</CardTitle>
            <CardDescription>
              This layout example requires Ring 1 access to view the sidebar component.
              Please adjust your feature ring in the demo page.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    }>
      <div className="h-screen overflow-hidden">
        <SidebarProvider>
          <SidebarWithFeatureGate>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size="lg" asChild>
                    <a href="#">
                      <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        <BarChart3 className="size-4" />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">Acme Dashboard</span>
                        <span className="truncate text-xs">Ring 1 Feature Demo</span>
                      </div>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            
            <SidebarContent>
              {navigation.map((group) => (
                <SidebarGroup key={group.title}>
                  <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {group.items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                          <SidebarMenuButton 
                            asChild 
                            isActive={activeItem === item.title}
                            tooltip={item.title}
                          >
                            <a 
                              href={item.url}
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveItem(item.title);
                              }}
                            >
                              <item.icon />
                              <span>{item.title}</span>
                            </a>
                          </SidebarMenuButton>
                          {item.badge && (
                            <SidebarMenuBadge>
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              ))}
              
              <SidebarGroup>
                <SidebarGroupLabel>Support</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton asChild>
                        <a href="#">
                          <HelpCircle />
                          <span>Help Center</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton
                        size="lg"
                        className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                      >
                        <User2 className="size-8 rounded-lg" />
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">Demo User</span>
                          <span className="truncate text-xs">demo@example.com</span>
                        </div>
                        <ChevronUp className="ml-auto size-4" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                      side="bottom"
                      align="end"
                      sideOffset={4}
                    >
                      <DropdownMenuLabel className="p-0 font-normal">
                        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                          <User2 className="size-8 rounded-lg" />
                          <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-semibold">Demo User</span>
                            <span className="truncate text-xs">demo@example.com</span>
                          </div>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <User2 className="mr-2 size-4" />
                        Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <CreditCard className="mr-2 size-4" />
                        Billing
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Bell className="mr-2 size-4" />
                        Notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Keyboard className="mr-2 size-4" />
                        Shortcuts
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <LogOut className="mr-2 size-4" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
          </SidebarWithFeatureGate>
          
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">{activeItem}</h1>
                <Badge variant="secondary">Ring 1 Feature</Badge>
              </div>
            </header>
            
            <main className="flex-1 overflow-y-auto p-4">
              <div className="grid gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome to {activeItem}</CardTitle>
                    <CardDescription>
                      This is a full layout example using the sidebar as a Ring 1 feature.
                      The sidebar provides navigation for your entire application.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Try clicking different menu items to see the active state change.
                      The sidebar can be collapsed to icon-only mode on desktop, and transforms
                      into a sheet overlay on mobile devices.
                    </p>
                  </CardContent>
                </Card>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Feature Gating</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        The sidebar is protected by feature gating and only available to Ring 1 users.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Mobile Friendly</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Resize your browser to see the mobile-optimized sheet overlay.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Persistent State</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        The sidebar remembers its collapsed/expanded state across sessions.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </div>
    </FeatureGate>
  );
}