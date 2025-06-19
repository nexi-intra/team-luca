import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { 
  FileText, 
  Book, 
  Code, 
  Lightbulb,
  Users,
  UserCog,
  ShieldCheck,
  Settings,
  Key,
  Database,
  BarChart,
  Lock,
  Globe,
  Zap
} from 'lucide-react';

const userDocs = [
  {
    title: 'Getting Started',
    description: 'Learn the basics of using the Magic Button Assistant',
    icon: Book,
    href: '/docs/users/getting-started',
  },
  {
    title: 'Features Guide',
    description: 'Explore all the features available to you',
    icon: Zap,
    href: '/docs/users/features',
  },
  {
    title: 'Best Practices',
    description: 'Tips and tricks for getting the most out of the assistant',
    icon: Lightbulb,
    href: '/docs/users/best-practices',
  },
  {
    title: 'FAQ',
    description: 'Frequently asked questions and troubleshooting',
    icon: FileText,
    href: '/docs/users/faq',
  },
];

const superuserDocs = [
  {
    title: 'Advanced Configuration',
    description: 'Configure advanced settings and customizations',
    icon: Settings,
    href: '/docs/superusers/configuration',
  },
  {
    title: 'API Integration',
    description: 'Integrate with external services and APIs',
    icon: Code,
    href: '/docs/superusers/api-integration',
  },
  {
    title: 'Analytics & Reporting',
    description: 'Access detailed analytics and generate reports',
    icon: BarChart,
    href: '/docs/superusers/analytics',
  },
  {
    title: 'Team Management',
    description: 'Manage team members and permissions',
    icon: Users,
    href: '/docs/superusers/team-management',
  },
];

const adminDocs = [
  {
    title: 'System Administration',
    description: 'Complete system administration guide',
    icon: ShieldCheck,
    href: '/docs/admins/system-admin',
  },
  {
    title: 'Security & Compliance',
    description: 'Security settings and compliance requirements',
    icon: Lock,
    href: '/docs/admins/security',
  },
  {
    title: 'Database Management',
    description: 'Database configuration and maintenance',
    icon: Database,
    href: '/docs/admins/database',
  },
  {
    title: 'API Keys & Access',
    description: 'Manage API keys and access controls',
    icon: Key,
    href: '/docs/admins/api-keys',
  },
  {
    title: 'Deployment Guide',
    description: 'Deploy and scale your Magic Button instance',
    icon: Globe,
    href: '/docs/admins/deployment',
  },
  {
    title: 'Monitoring & Logs',
    description: 'System monitoring and log management',
    icon: BarChart,
    href: '/docs/admins/monitoring',
  },
];

export default function DocsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div>
        <h1 className="text-4xl font-bold text-[#233862] dark:text-white mb-4">
          Documentation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Everything you need to know about Magic Button Assistant
        </p>
      </div>

      {/* Role-based Documentation Tabs */}
      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="superusers" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" />
            Superusers
          </TabsTrigger>
          <TabsTrigger value="admins" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Admins
          </TabsTrigger>
        </TabsList>

        {/* Users Documentation */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#233862] dark:text-white">User Documentation</h2>
              <p className="text-muted-foreground mt-1">Essential guides for everyday users</p>
            </div>
            <Badge variant="default">Standard Access</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userDocs.map((section) => (
              <Card 
                key={section.href}
                className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/20 dark:hover:border-gray-600 transition-colors"
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
                      Read Documentation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Superusers Documentation */}
        <TabsContent value="superusers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#233862] dark:text-white">Superuser Documentation</h2>
              <p className="text-muted-foreground mt-1">Advanced features and configuration guides</p>
            </div>
            <Badge variant="secondary">Elevated Access</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {superuserDocs.map((section) => (
              <Card 
                key={section.href}
                className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/20 dark:hover:border-gray-600 transition-colors"
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
                      Read Documentation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Admins Documentation */}
        <TabsContent value="admins" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-[#233862] dark:text-white">Administrator Documentation</h2>
              <p className="text-muted-foreground mt-1">System administration and deployment guides</p>
            </div>
            <Badge variant="destructive">Admin Access</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adminDocs.map((section) => (
              <Card 
                key={section.href}
                className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/20 dark:hover:border-gray-600 transition-colors"
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
                      Read Documentation
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

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
              href="/docs/users/getting-started" 
              className="text-[#233862] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Book className="h-4 w-4" />
              Getting Started Guide
            </Link>
            <Link 
              href="/docs/superusers/api-integration" 
              className="text-[#233862] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Code className="h-4 w-4" />
              API Documentation
            </Link>
            <Link 
              href="/docs/admins/deployment" 
              className="text-[#233862] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <Globe className="h-4 w-4" />
              Deployment Guide
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Coming Soon Notice */}
      <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
          <strong>Note:</strong> This documentation is currently under construction. 
          Please check back soon for complete guides and API references.
        </p>
      </div>
    </div>
  );
}