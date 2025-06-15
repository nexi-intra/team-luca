'use client';

import { useEffect } from 'react';
import { useBreadcrumb } from '@/lib/breadcrumb/context';

/**
 * Hook to set a custom page title for the current breadcrumb
 * @param title - The custom title to display in the breadcrumb
 */
export function useBreadcrumbTitle(title: string) {
  const { setPageTitle } = useBreadcrumb();

  useEffect(() => {
    setPageTitle(title);
  }, [title, setPageTitle]);
}