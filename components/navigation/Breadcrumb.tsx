'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useBreadcrumb } from '@/lib/breadcrumb/context';
import { Home, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbProps {
  className?: string;
  showOnHomePage?: boolean;
}

export function Breadcrumb({ className, showOnHomePage = false }: BreadcrumbProps) {
  const pathname = usePathname();
  const { items } = useBreadcrumb();

  // Don't show on home page unless explicitly requested
  if (pathname === '/' && !showOnHomePage) {
    return null;
  }

  // Don't show if we only have the home item
  if (items.length <= 1 && !showOnHomePage) {
    return null;
  }

  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center text-sm', className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            {index > 0 && (
              <ChevronRight className="mx-1 h-4 w-4 text-gray-400" aria-hidden="true" />
            )}
            
            {item.isCurrentPage ? (
              <span
                className="text-gray-700 font-medium flex items-center"
                aria-current="page"
              >
                {index === 0 ? (
                  <Home className="h-4 w-4" aria-label="Home" />
                ) : (
                  <span className="max-w-[200px] truncate sm:max-w-none">{item.label}</span>
                )}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center"
              >
                {index === 0 ? (
                  <Home className="h-4 w-4" aria-label="Home" />
                ) : (
                  <span className="max-w-[150px] truncate sm:max-w-none">{item.label}</span>
                )}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}