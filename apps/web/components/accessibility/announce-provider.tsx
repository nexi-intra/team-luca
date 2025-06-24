'use client';

import React, { createContext, useContext, useRef, useCallback } from 'react';

interface AnnounceContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
}

const AnnounceContext = createContext<AnnounceContextType | undefined>(undefined);

export function AnnounceProvider({ children }: { children: React.ReactNode }) {
  const politeRef = useRef<HTMLDivElement>(null);
  const assertiveRef = useRef<HTMLDivElement>(null);

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const element = priority === 'assertive' ? assertiveRef.current : politeRef.current;
    
    if (element) {
      // Clear the element first to ensure the screen reader announces the new message
      element.textContent = '';
      
      // Use a small delay to ensure the clear is registered
      setTimeout(() => {
        element.textContent = message;
        
        // Clear after announcement
        setTimeout(() => {
          element.textContent = '';
        }, 1000);
      }, 100);
    }
  }, []);

  return (
    <AnnounceContext.Provider value={{ announce }}>
      {children}
      {/* Screen reader only announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true" ref={politeRef} />
      <div className="sr-only" aria-live="assertive" aria-atomic="true" ref={assertiveRef} />
    </AnnounceContext.Provider>
  );
}

export function useAnnounce() {
  const context = useContext(AnnounceContext);
  if (!context) {
    throw new Error('useAnnounce must be used within an AnnounceProvider');
  }
  return context;
}