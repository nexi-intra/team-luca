'use client';

import { BreadcrumbContainer } from '@/components/navigation/BreadcrumbContainer';
import { ThemeToggle } from '@/components/theme-toggle';
import { CommandTrigger } from '@/components/command/CommandTrigger';
import { LanguageSelector } from '@/components/language-selector';
import { AccessibilityQuickControls } from '@/components/accessibility/quick-controls';
import { AuthStatus } from '@/components/auth/AuthStatus';
import { 
  BookOpen, 
  FileText, 
  Code, 
  Rocket, 
  Settings, 
  GitBranch,
  Database,
  Shield,
  Sparkles,
  Home,
  ChevronRight,
  Users,
  Zap,
  Lock
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const docsNavigation = [
  {
    title: 'General Users',
    icon: Users,
    ring: 'users',
    items: [
      { title: 'Getting Started', href: '/docs/users/getting-started' },
      { title: 'Basic Features', href: '/docs/users/features' },
      { title: 'Common Tasks', href: '/docs/users/common-tasks' },
      { title: 'Best Practices', href: '/docs/users/best-practices' },
      { title: 'Troubleshooting', href: '/docs/users/troubleshooting' },
      { title: 'FAQ', href: '/docs/users/faq' },
    ],
  },
  {
    title: 'Power Users',
    icon: Zap,
    ring: 'power-users',
    items: [
      { title: 'Advanced Features', href: '/docs/power-users/advanced-features' },
      { title: 'Keyboard Shortcuts', href: '/docs/power-users/shortcuts' },
      { title: 'Automation', href: '/docs/power-users/automation' },
      { title: 'Custom Workflows', href: '/docs/power-users/workflows' },
      { title: 'Data Export/Import', href: '/docs/power-users/data-management' },
      { title: 'Integrations', href: '/docs/power-users/integrations' },
    ],
  },
  {
    title: 'Developers',
    icon: Code,
    ring: 'developers',
    items: [
      { title: 'API Overview', href: '/docs/developers/api-overview' },
      { title: 'REST API', href: '/docs/developers/rest-api' },
      { title: 'GraphQL API', href: '/docs/developers/graphql' },
      { title: 'Webhooks', href: '/docs/developers/webhooks' },
      { title: 'SDK & Libraries', href: '/docs/developers/sdk' },
      { title: 'Custom Extensions', href: '/docs/developers/extensions' },
      { title: 'API Examples', href: '/docs/developers/examples' },
    ],
  },
  {
    title: 'Administrators',
    icon: Shield,
    ring: 'admins',
    items: [
      { title: 'System Setup', href: '/docs/admins/setup' },
      { title: 'User Management', href: '/docs/admins/user-management' },
      { title: 'Security Settings', href: '/docs/admins/security' },
      { title: 'Access Control', href: '/docs/admins/access-control' },
      { title: 'Audit Logs', href: '/docs/admins/audit-logs' },
      { title: 'Backup & Recovery', href: '/docs/admins/backup' },
      { title: 'Performance Tuning', href: '/docs/admins/performance' },
    ],
  },
  {
    title: 'System Administrators',
    icon: Settings,
    ring: 'system-admins',
    items: [
      { title: 'Infrastructure', href: '/docs/system-admins/infrastructure' },
      { title: 'Deployment', href: '/docs/system-admins/deployment' },
      { title: 'Monitoring', href: '/docs/system-admins/monitoring' },
      { title: 'Scaling', href: '/docs/system-admins/scaling' },
      { title: 'Database Management', href: '/docs/system-admins/database' },
      { title: 'Network Configuration', href: '/docs/system-admins/network' },
      { title: 'Disaster Recovery', href: '/docs/system-admins/disaster-recovery' },
    ],
  },
  {
    title: 'Compliance & Security',
    icon: Shield,
    ring: 'compliance',
    items: [
      { title: 'Security Overview', href: '/docs/compliance/security-overview' },
      { title: 'Data Protection', href: '/docs/compliance/data-protection' },
      { title: 'GDPR Compliance', href: '/docs/compliance/gdpr' },
      { title: 'SOC 2 Compliance', href: '/docs/compliance/soc2' },
      { title: 'HIPAA Compliance', href: '/docs/compliance/hipaa' },
      { title: 'Security Policies', href: '/docs/compliance/security-policies' },
      { title: 'Incident Response', href: '/docs/compliance/incident-response' },
      { title: 'Audit Reports', href: '/docs/compliance/audit-reports' },
    ],
  },
];

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [openSections, setOpenSections] = useState<string[]>(['General Users']);

  const toggleSection = (title: string) => {
    setOpenSections(prev =>
      prev.includes(title)
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <Sidebar className="sticky top-0 h-screen">
          <SidebarHeader className="border-b">
            <div className="flex items-center gap-2 px-2">
              <FileText className="h-5 w-5" />
              <span className="font-semibold">Documentation</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            {/* Quick Links */}
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <Link href="/">
                        <Home className="h-4 w-4" />
                        <span>Back to Home</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarSeparator />
            
            {/* Documentation Navigation */}
            {docsNavigation.map((section) => (
              <SidebarGroup key={section.title}>
                <Collapsible
                  open={openSections.includes(section.title)}
                  onOpenChange={() => toggleSection(section.title)}
                >
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-sidebar-accent/50 relative">
                      <section.icon className="h-4 w-4 mr-2" />
                      {section.title}
                      {section.ring !== 'users' && (
                        <Lock className="h-3 w-3 ml-1 text-muted-foreground" />
                      )}
                      <ChevronRight 
                        className={`ml-auto h-4 w-4 transition-transform ${
                          openSections.includes(section.title) ? 'rotate-90' : ''
                        }`}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {section.items.map((item) => (
                          <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild isActive={pathname === item.href}>
                              <Link href={item.href}>
                                <span className="ml-6">{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </SidebarMenuItem>
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </Collapsible>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter className="border-t">
            <SidebarMenu>
              <SidebarMenuItem>
                <AuthStatus />
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          {/* Header */}
          <header className="flex h-14 items-center gap-4 border-b px-6">
            <SidebarTrigger />
            <div className="flex-1 flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/magic-button-logo.svg"
                  alt="Magic Button"
                  width={24}
                  height={24}
                  className="rounded-lg"
                />
                <span className="font-semibold text-sm">Magic Button</span>
              </Link>
              <span className="text-muted-foreground">/</span>
              <span className="text-sm">Documentation</span>
            </div>
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