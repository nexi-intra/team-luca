"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@monorepo/utils";

const setupSteps = [
  {
    title: "Getting Started",
    href: "/setup",
    description: "Overview and requirements",
  },
  {
    title: "Azure Setup",
    href: "/setup/azure",
    description: "Configure Azure AD / Entra ID",
  },
  {
    title: "Environment Variables",
    href: "/setup/environment",
    description: "Configure your .env.local file",
  },
  {
    title: "Test Authentication",
    href: "/setup/test-auth",
    description: "Verify your setup works",
  },
];

export default function SetupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Side Panel */}
      <div className="w-64 border-r bg-gray-50 dark:bg-gray-900 p-6">
        <h2 className="text-lg font-semibold mb-6">Setup Guide</h2>
        <nav className="space-y-2">
          {setupSteps.map((step) => {
            const isActive = pathname === step.href;
            return (
              <Link
                key={step.href}
                href={step.href}
                className={cn(
                  "block p-3 rounded-lg transition-colors",
                  "border",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                    : "border-transparent hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-gray-200 dark:hover:border-gray-700",
                )}
              >
                <div
                  className={cn(
                    "font-medium text-sm",
                    isActive && "text-blue-600 dark:text-blue-400",
                  )}
                >
                  {step.title}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  {step.description}
                </div>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">{children}</div>
      </div>
    </div>
  );
}
