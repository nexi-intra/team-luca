"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useBreadcrumb } from "@/lib/breadcrumb/context";
import { Home, ChevronRight, Slash } from "lucide-react";
import { cn } from "@monorepo/utils";

interface BreadcrumbProps {
  className?: string;
  showOnHomePage?: boolean;
  variant?: "default" | "slash" | "dots" | "pills";
  size?: "sm" | "md" | "lg";
}

export function BreadcrumbWithVariants({
  className,
  showOnHomePage = false,
  variant = "default",
  size = "md",
}: BreadcrumbProps) {
  const pathname = usePathname();
  const { items } = useBreadcrumb();

  if (pathname === "/" && !showOnHomePage) {
    return null;
  }

  if (items.length <= 1 && !showOnHomePage) {
    return null;
  }

  const sizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const getSeparator = () => {
    switch (variant) {
      case "slash":
        return <Slash className={cn(iconSizes[size], "text-gray-400 mx-1")} />;
      case "dots":
        return <span className="mx-2 text-gray-400">•</span>;
      default:
        return (
          <ChevronRight className={cn(iconSizes[size], "text-gray-400 mx-1")} />
        );
    }
  };

  const getItemClasses = (isCurrentPage: boolean) => {
    const baseClasses = "transition-all duration-200";

    switch (variant) {
      case "pills":
        return cn(
          baseClasses,
          "px-3 py-1 rounded-full",
          isCurrentPage
            ? "bg-primary text-primary-foreground font-medium"
            : "hover:bg-gray-100 text-gray-600 hover:text-gray-900",
        );
      default:
        return cn(
          baseClasses,
          isCurrentPage
            ? "text-gray-900 font-medium"
            : "text-gray-500 hover:text-gray-700",
        );
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center", sizeClasses[size], className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && variant !== "pills" && getSeparator()}

            {item.isCurrentPage ? (
              <span
                className={cn("flex items-center", getItemClasses(true))}
                aria-current="page"
              >
                {index === 0 ? (
                  <Home className={iconSizes[size]} aria-label="Home" />
                ) : (
                  <span className="max-w-[200px] truncate sm:max-w-none">
                    {item.label}
                  </span>
                )}
              </span>
            ) : (
              <Link
                href={item.href}
                className={cn("flex items-center", getItemClasses(false))}
              >
                {index === 0 ? (
                  <Home className={iconSizes[size]} aria-label="Home" />
                ) : (
                  <span className="max-w-[150px] truncate sm:max-w-none">
                    {item.label}
                  </span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
