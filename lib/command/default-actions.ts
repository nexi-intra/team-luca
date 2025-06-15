import { CommandAction } from './types';
import type { FeatureRing } from '@/lib/features/constants';
import { 
  Home, 
  Settings, 
  User, 
  Search, 
  FileText, 
  Shield, 
  Sparkles,
  BarChart,
  Users,
  Cog,
  Code,
  Database,
  Key,
  Terminal,
  Activity
} from 'lucide-react';

export const defaultCommandActions: CommandAction[] = [
  // Ring 4 (Stable/Public) actions
  {
    id: 'home',
    title: 'Go to Home',
    description: 'Navigate to the home page',
    icon: Home,
    shortcut: 'cmd+h',
    requiredRing: 4 as FeatureRing,
    category: 'Navigation',
    action: () => { window.location.href = '/'; },
    keywords: ['home', 'start', 'main']
  },
  {
    id: 'magic-button',
    title: 'Magic Button Demo',
    description: 'Explore the Magic Button features',
    icon: Sparkles,
    shortcut: 'cmd+m',
    requiredRing: 4 as FeatureRing,
    category: 'Navigation',
    action: () => { window.location.href = '/magicbutton'; },
    keywords: ['demo', 'magic', 'features']
  },
  {
    id: 'search',
    title: 'Search',
    description: 'Search across the application',
    icon: Search,
    shortcut: 'cmd+k',
    requiredRing: 4 as FeatureRing,
    category: 'General',
    action: () => {
      // Toggle command palette itself
      console.log('Search action - command palette should already be open');
    },
    keywords: ['search', 'find', 'look']
  },

  // Ring 4 (Stable) actions
  {
    id: 'profile',
    title: 'View Profile',
    description: 'View and edit your profile',
    icon: User,
    shortcut: 'cmd+p',
    requiredRing: 4 as FeatureRing,
    category: 'Account',
    action: () => { window.location.href = '/profile'; },
    keywords: ['profile', 'account', 'user']
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Manage application settings',
    icon: Settings,
    shortcut: 'cmd+,',
    requiredRing: 4 as FeatureRing,
    category: 'Account',
    action: () => { window.location.href = '/settings'; },
    keywords: ['settings', 'preferences', 'config']
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    description: 'View your dashboard',
    icon: BarChart,
    requiredRing: 4 as FeatureRing,
    category: 'Navigation',
    action: () => { window.location.href = '/dashboard'; },
    keywords: ['dashboard', 'overview', 'stats']
  },

  // Ring 3 (Power User) actions
  {
    id: 'analytics',
    title: 'Analytics',
    description: 'View detailed analytics',
    icon: Activity,
    requiredRing: 3 as FeatureRing,
    category: 'Advanced',
    action: () => { window.location.href = '/analytics'; },
    keywords: ['analytics', 'metrics', 'data']
  },
  {
    id: 'api-docs',
    title: 'API Documentation',
    description: 'View API documentation',
    icon: FileText,
    shortcut: 'cmd+d',
    requiredRing: 3 as FeatureRing,
    category: 'Developer',
    action: () => { window.location.href = '/docs/api'; },
    keywords: ['api', 'docs', 'documentation']
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    description: 'Access developer tools',
    icon: Code,
    requiredRing: 3 as FeatureRing,
    category: 'Developer',
    action: () => { window.location.href = '/dev-tools'; },
    keywords: ['dev', 'developer', 'tools', 'debug']
  },

  // Ring 2 (Admin) actions
  {
    id: 'user-management',
    title: 'User Management',
    description: 'Manage users and permissions',
    icon: Users,
    requiredRing: 2 as FeatureRing,
    category: 'Admin',
    action: () => { window.location.href = '/admin/users'; },
    keywords: ['users', 'admin', 'manage']
  },
  {
    id: 'system-config',
    title: 'System Configuration',
    description: 'Configure system settings',
    icon: Cog,
    requiredRing: 2 as FeatureRing,
    category: 'Admin',
    action: () => { window.location.href = '/admin/config'; },
    keywords: ['system', 'config', 'admin']
  },
  {
    id: 'security-settings',
    title: 'Security Settings',
    description: 'Manage security configurations',
    icon: Shield,
    requiredRing: 2 as FeatureRing,
    category: 'Admin',
    action: () => { window.location.href = '/admin/security'; },
    keywords: ['security', 'admin', 'protection']
  },

  // Ring 1 (Super Admin) actions
  {
    id: 'database-admin',
    title: 'Database Administration',
    description: 'Direct database access and management',
    icon: Database,
    requiredRing: 1 as FeatureRing,
    category: 'Super Admin',
    action: () => { window.location.href = '/admin/database'; },
    keywords: ['database', 'db', 'admin', 'super']
  },
  {
    id: 'api-keys',
    title: 'API Key Management',
    description: 'Manage API keys and tokens',
    icon: Key,
    requiredRing: 1 as FeatureRing,
    category: 'Super Admin',
    action: () => { window.location.href = '/admin/api-keys'; },
    keywords: ['api', 'keys', 'tokens', 'admin']
  },
  {
    id: 'system-console',
    title: 'System Console',
    description: 'Access system console',
    icon: Terminal,
    shortcut: 'cmd+shift+c',
    requiredRing: 1 as FeatureRing,
    category: 'Super Admin',
    action: () => { window.location.href = '/admin/console'; },
    keywords: ['console', 'terminal', 'system', 'admin']
  },
];