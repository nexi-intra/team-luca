'use client';

import React from 'react';
import { 
  Calendar, 
  Home, 
  Inbox, 
  Search, 
  Settings,
  ChevronUp,
  User2,
  MoreHorizontal,
  LogOut,
  CreditCard,
  Keyboard,
  UserPlus,
  Mail,
  MessageSquare,
  PlusCircle,
  UserCircle,
  Bell,
  Bookmark,
  Archive,
  Trash2,
  Send,
  FileText,
  Paperclip,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  SidebarMenuBadge,
  SidebarMenuAction,
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
import { Badge } from '@/components/ui/badge';
import { useFeatureRing } from '@/lib/features';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const mainNavItems = [
  {
    title: 'Home',
    icon: Home,
    url: '#',
  },
  {
    title: 'Inbox',
    icon: Inbox,
    url: '#',
    badge: '12',
  },
  {
    title: 'Calendar',
    icon: Calendar,
    url: '#',
  },
  {
    title: 'Search',
    icon: Search,
    url: '#',
  },
  {
    title: 'Settings',
    icon: Settings,
    url: '#',
  },
];

const mailItems = [
  {
    title: 'All Mail',
    icon: Mail,
    url: '#',
  },
  {
    title: 'Sent',
    icon: Send,
    url: '#',
  },
  {
    title: 'Drafts',
    icon: FileText,
    url: '#',
    badge: '3',
  },
  {
    title: 'Starred',
    icon: Bookmark,
    url: '#',
  },
  {
    title: 'Archive',
    icon: Archive,
    url: '#',
  },
  {
    title: 'Trash',
    icon: Trash2,
    url: '#',
  },
];

export default function SidebarDemoPage() {
  const { currentRing, setRing } = useFeatureRing();
  const [activeItem, setActiveItem] = React.useState('Home');
  const [isCollapsibleOpen, setIsCollapsibleOpen] = React.useState(true);

  return (
    <div className="flex flex-col gap-6">
      {/* Ring Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Feature Demo</CardTitle>
          <CardDescription>
            The sidebar is a Ring 1 (Experimental) feature. Adjust your feature ring to see it in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Current Ring:</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((ring) => (
                <Button
                  key={ring}
                  variant={currentRing === ring ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setRing(ring as any)}
                >
                  Ring {ring}
                  {ring === 1 && ' (Experimental)'}
                  {ring === 4 && ' (Stable)'}
                </Button>
              ))}
            </div>
          </div>
          {currentRing !== 1 && (
            <p className="mt-4 text-sm text-muted-foreground">
              ⚠️ Set your feature ring to 1 to see the sidebar component
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sidebar Demo */}
      {currentRing === 1 && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Interactive Sidebar Demo</CardTitle>
            <CardDescription>
              A fully-featured sidebar with collapsible groups, badges, sub-menus, and mobile support. 
              Try resizing your browser to see the mobile behavior.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[600px] overflow-hidden rounded-lg border">
              <SidebarProvider>
                <SidebarWithFeatureGate collapsible="icon">
                  <SidebarHeader>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                          <a href="#">
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                              <UserCircle className="size-4" />
                            </div>
                            <div className="grid flex-1 text-left text-sm leading-tight">
                              <span className="truncate font-semibold">Acme Inc</span>
                              <span className="truncate text-xs">Enterprise</span>
                            </div>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarHeader>
                  <SidebarContent>
                    <SidebarGroup>
                      <SidebarGroupLabel>Platform</SidebarGroupLabel>
                      <SidebarGroupContent>
                        <SidebarMenu>
                          {mainNavItems.map((item) => (
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
                                <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                              )}
                            </SidebarMenuItem>
                          ))}
                        </SidebarMenu>
                      </SidebarGroupContent>
                    </SidebarGroup>
                    
                    <SidebarGroup>
                      <Collapsible
                        open={isCollapsibleOpen}
                        onOpenChange={setIsCollapsibleOpen}
                      >
                        <SidebarGroupLabel asChild>
                          <CollapsibleTrigger className="w-full">
                            Mail
                            <ChevronUp className={cn(
                              'ml-auto transition-transform',
                              !isCollapsibleOpen && '-rotate-180'
                            )} />
                          </CollapsibleTrigger>
                        </SidebarGroupLabel>
                        <CollapsibleContent>
                          <SidebarGroupContent>
                            <SidebarMenu>
                              {mailItems.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                  <SidebarMenuButton asChild>
                                    <a href={item.url}>
                                      <item.icon />
                                      <span>{item.title}</span>
                                    </a>
                                  </SidebarMenuButton>
                                  {item.badge && (
                                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                                  )}
                                  <SidebarMenuAction showOnHover>
                                    <MoreHorizontal />
                                  </SidebarMenuAction>
                                </SidebarMenuItem>
                              ))}
                            </SidebarMenu>
                          </SidebarGroupContent>
                        </CollapsibleContent>
                      </Collapsible>
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
                                <span className="truncate font-semibold">John Doe</span>
                                <span className="truncate text-xs">john@example.com</span>
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
                                  <span className="truncate font-semibold">John Doe</span>
                                  <span className="truncate text-xs">john@example.com</span>
                                </div>
                              </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <UserCircle className="mr-2 size-4" />
                              Account
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
                              Keyboard shortcuts
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <LogOut className="mr-2 size-4" />
                              Log out
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarFooter>
                  <SidebarRail />
                </SidebarWithFeatureGate>
                <SidebarInset>
                  <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                      <SidebarTrigger className="-ml-1" />
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Press</span>
                        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                          <span className="text-xs">⌘</span>B
                        </kbd>
                        <span className="text-sm text-muted-foreground">to toggle</span>
                      </div>
                    </div>
                  </header>
                  <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader>
                          <CardTitle>Responsive Design</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            The sidebar automatically adapts to mobile screens with a sheet overlay.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>Keyboard Shortcut</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Press <kbd className="text-xs">⌘B</kbd> or <kbd className="text-xs">Ctrl+B</kbd> to toggle the sidebar.
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader>
                          <CardTitle>State Persistence</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            The sidebar state is saved in a cookie and persists across sessions.
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 p-4">
                      <p className="text-muted-foreground">Main content area</p>
                    </div>
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feature Details */}
      <Card>
        <CardHeader>
          <CardTitle>Sidebar Features</CardTitle>
          <CardDescription>
            A comprehensive list of features included in this sidebar implementation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">Core Features</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Collapsible with icon-only mode</li>
                <li>• Mobile-responsive with sheet overlay</li>
                <li>• Keyboard shortcut support (⌘B)</li>
                <li>• State persistence via cookies</li>
                <li>• Smooth animations and transitions</li>
                <li>• Rail for easy collapse/expand</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Components</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>• Menu items with icons and badges</li>
                <li>• Collapsible groups</li>
                <li>• Sub-menus support</li>
                <li>• Header and footer sections</li>
                <li>• Hover actions and tooltips</li>
                <li>• Dropdown menus integration</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

import { cn } from '@/lib/utils';