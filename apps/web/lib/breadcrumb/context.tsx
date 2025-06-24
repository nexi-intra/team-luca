'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { BreadcrumbContextType, BreadcrumbItem } from './types';
import { generateBreadcrumbs, getPageTitle } from './route-metadata';

const BreadcrumbContext = createContext<BreadcrumbContextType | undefined>(undefined);

export function useBreadcrumb() {
  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumb must be used within BreadcrumbProvider');
  }
  return context;
}

interface BreadcrumbProviderProps {
  children: React.ReactNode;
}

export function BreadcrumbProvider({ children }: BreadcrumbProviderProps) {
  const pathname = usePathname();
  const [customItems, setCustomItems] = useState<BreadcrumbItem[]>([]);
  const [pageTitle, setPageTitle] = useState<string | null>(null);

  // Generate breadcrumb items based on current path
  const items: BreadcrumbItem[] = React.useMemo(() => {
    const pathItems = generateBreadcrumbs(pathname);
    
    // Mark the last item as current page
    const breadcrumbs = pathItems.map((item, index) => ({
      ...item,
      isCurrentPage: index === pathItems.length - 1
    }));

    // If we have a custom page title for the current page, update it
    if (pageTitle && breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].label = pageTitle;
    }

    // Add any custom breadcrumb items
    if (customItems.length > 0) {
      return [...breadcrumbs.slice(0, -1), ...customItems];
    }

    return breadcrumbs;
  }, [pathname, pageTitle, customItems]);

  // Reset custom items when path changes
  useEffect(() => {
    setCustomItems([]);
    setPageTitle(null);
  }, [pathname]);

  const addCustomBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setCustomItems(prev => [...prev, item]);
  }, []);

  const clearCustomBreadcrumbs = useCallback(() => {
    setCustomItems([]);
  }, []);

  const value: BreadcrumbContextType = {
    items,
    setPageTitle,
    addCustomBreadcrumb,
    clearCustomBreadcrumbs
  };

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}