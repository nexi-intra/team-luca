"use client";

import React, { useEffect, useRef } from "react";

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocus?: boolean;
  className?: string;
}

export function FocusTrap({
  children,
  active = true,
  returnFocus = true,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!active) return;

    // Store the currently focused element
    previousActiveElementRef.current = document.activeElement;

    // Get all focusable elements
    const getFocusableElements = () => {
      if (!containerRef.current) return [];

      const focusableSelectors = [
        "a[href]:not([disabled])",
        "button:not([disabled])",
        "textarea:not([disabled])",
        "input:not([disabled])",
        "select:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(",");

      return Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(focusableSelectors),
      ).filter((el) => {
        // Check if element is visible
        const style = window.getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden";
      });
    };

    // Focus the first focusable element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0 && focusableElements[0]) {
      focusableElements[0].focus();
    }

    // Handle tab key
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (!firstElement || !lastElement) return;

      // Tab backwards
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Return focus to previous element
      if (
        returnFocus &&
        previousActiveElementRef.current instanceof HTMLElement
      ) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [active, returnFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Hook to manage focus programmatically
export function useFocusManagement() {
  const focusElement = useCallback((selector: string) => {
    const element = document.querySelector<HTMLElement>(selector);
    if (element) {
      element.focus();
      element.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, []);

  const moveFocus = useCallback((direction: "next" | "previous") => {
    const focusable = Array.from(
      document.querySelectorAll<HTMLElement>(
        'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => {
      const style = window.getComputedStyle(el);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        !el.hasAttribute("disabled")
      );
    });

    const currentIndex = focusable.indexOf(
      document.activeElement as HTMLElement,
    );

    if (currentIndex === -1) {
      focusable[0]?.focus();
      return;
    }

    let nextIndex: number;
    if (direction === "next") {
      nextIndex = (currentIndex + 1) % focusable.length;
    } else {
      nextIndex = currentIndex - 1;
      if (nextIndex < 0) nextIndex = focusable.length - 1;
    }

    focusable[nextIndex]?.focus();
  }, []);

  return { focusElement, moveFocus };
}

import { useCallback } from "react";
