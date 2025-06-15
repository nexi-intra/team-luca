'use client';

import React from 'react';

export function AccessibilitySkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="absolute left-0 top-0 z-50 bg-background px-4 py-2 text-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <a
        href="#main-navigation"
        className="absolute left-0 top-10 z-50 bg-background px-4 py-2 text-foreground focus:not-sr-only focus:outline-none focus:ring-2 focus:ring-ring"
      >
        Skip to navigation
      </a>
    </div>
  );
}