import { CommandAction } from "./types";
import type { FeatureRing } from "@monorepo/features";
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
  Activity,
} from "lucide-react";

export const defaultCommandActions: CommandAction[] = [
  // Ring 4 (Stable/Public) actions
  {
    id: "home",
    title: "Go to Home",
    description: "Navigate to the home page",
    icon: Home,
    shortcut: "cmd+h",
    requiredRing: 4 as FeatureRing,
    category: "Navigation",
    action: () => {
      window.location.href = "/";
    },
    keywords: ["home", "start", "main"],
  },
  {
    id: "magic-button",
    title: "Magic Button Demo",
    description: "Explore the Magic Button features",
    icon: Sparkles,
    shortcut: "cmd+m",
    requiredRing: 4 as FeatureRing,
    category: "Navigation",
    action: () => {
      window.location.href = "/magicbutton";
    },
    keywords: ["demo", "magic", "features"],
  },
  {
    id: "search",
    title: "Search",
    description: "Search across the application",
    icon: Search,
    shortcut: "cmd+k",
    requiredRing: 4 as FeatureRing,
    category: "General",
    action: () => {
      // Toggle command palette itself
      console.log("Search action - command palette should already be open");
    },
    keywords: ["search", "find", "look"],
  },

  // Ring 4 (Stable) actions
  {
    id: "settings",
    title: "Settings",
    description: "Manage application settings",
    icon: Settings,
    shortcut: "cmd+,",
    requiredRing: 4 as FeatureRing,
    category: "Account",
    action: () => {
      window.location.href = "/settings";
    },
    keywords: ["settings", "preferences", "config"],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    description: "View your dashboard",
    icon: BarChart,
    requiredRing: 4 as FeatureRing,
    category: "Navigation",
    action: () => {
      window.location.href = "/dashboard";
    },
    keywords: ["dashboard", "overview", "stats"],
  },
  {
    id: "accessibility",
    title: "Accessibility",
    description: "View accessibility settings",
    icon: Settings,
    requiredRing: 4 as FeatureRing,
    category: "Navigation",
    action: () => {
      window.location.href = "/accessibility";
    },
    keywords: ["accessibility", "a11y", "settings"],
  },

  // Ring 3 (Power User) actions
  {
    id: "features-demo",
    title: "Features Demo",
    description: "View all feature ring demonstrations",
    icon: Activity,
    requiredRing: 3 as FeatureRing,
    category: "Advanced",
    action: () => {
      window.location.href = "/magicbutton/features";
    },
    keywords: ["features", "demo", "rings"],
  },
  {
    id: "auth-demo",
    title: "Authentication Demo",
    description: "Test authentication flows",
    icon: Shield,
    requiredRing: 3 as FeatureRing,
    category: "Developer",
    action: () => {
      window.location.href = "/magicbutton/auth-demo";
    },
    keywords: ["auth", "authentication", "demo"],
  },
  {
    id: "language-demo",
    title: "Language Context Demo",
    description: "Test language detection and switching",
    icon: FileText,
    requiredRing: 3 as FeatureRing,
    category: "Developer",
    action: () => {
      window.location.href = "/magicbutton/language";
    },
    keywords: ["language", "i18n", "locale", "demo"],
  },

  // Ring 2 (Admin) actions
  {
    id: "sidebar-demo",
    title: "Sidebar Demo",
    description: "Interactive sidebar component demo",
    icon: Code,
    requiredRing: 2 as FeatureRing,
    category: "Advanced",
    action: () => {
      window.location.href = "/magicbutton/demo/sidebar";
    },
    keywords: ["sidebar", "demo", "ui", "component"],
  },

  // Ring 1 (Super Admin) actions
  {
    id: "system-console",
    title: "System Console",
    description: "Access system console",
    icon: Terminal,
    shortcut: "cmd+shift+c",
    requiredRing: 1 as FeatureRing,
    category: "Super Admin",
    action: () => {
      window.location.href = "/admin/console";
    },
    keywords: ["console", "terminal", "system", "admin"],
  },
  {
    id: "sidebar-test",
    title: "Sidebar Component Test",
    description: "Test the new sidebar implementation",
    icon: Code,
    requiredRing: 1 as FeatureRing,
    category: "Super Admin",
    action: () => {
      window.location.href = "/sidebar-demo";
    },
    keywords: ["sidebar", "test", "demo", "component"],
  },
];
