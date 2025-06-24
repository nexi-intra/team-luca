'use client';

import React from 'react';
import { Breadcrumb } from './Breadcrumb';

interface BreadcrumbContainerProps {
  className?: string;
}

export function BreadcrumbContainer({ className }: BreadcrumbContainerProps) {
  return (
    <div className={className || 'bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800'}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <Breadcrumb />
      </div>
    </div>
  );
}