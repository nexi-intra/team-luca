"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

interface AccessibilityContextType {
  fontSize: number;
  setFontSize: (size: number) => void;
  highContrast: boolean;
  setHighContrast: (enabled: boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (enabled: boolean) => void;
  screenReaderOptimized: boolean;
  setScreenReaderOptimized: (enabled: boolean) => void;
  resetSettings: () => void;
}

const AccessibilityContext = createContext<
  AccessibilityContextType | undefined
>(undefined);

export function AccessibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReaderOptimized, setScreenReaderOptimized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load preferences from localStorage on mount
  useEffect(() => {
    const savedFontSize = localStorage.getItem("a11y-font-size");
    const savedHighContrast = localStorage.getItem("a11y-high-contrast");
    const savedReduceMotion = localStorage.getItem("a11y-reduce-motion");
    const savedScreenReader = localStorage.getItem("a11y-screen-reader");

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast === "true") setHighContrast(true);
    if (savedReduceMotion === "true") setReduceMotion(true);
    if (savedScreenReader === "true") setScreenReaderOptimized(true);

    setIsHydrated(true);
  }, []);

  // Apply settings to DOM
  useEffect(() => {
    if (!isHydrated) return;

    // Apply font size to root element - this affects rem units
    document.documentElement.style.fontSize = `${fontSize}px`;

    // Force a style recalculation to ensure changes are applied
    document.documentElement.offsetHeight;

    localStorage.setItem("a11y-font-size", fontSize.toString());

    // Apply high contrast
    if (highContrast) {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
    localStorage.setItem("a11y-high-contrast", highContrast.toString());

    // Apply reduce motion
    if (reduceMotion) {
      document.documentElement.classList.add("reduce-motion");
    } else {
      document.documentElement.classList.remove("reduce-motion");
    }
    localStorage.setItem("a11y-reduce-motion", reduceMotion.toString());

    // Save screen reader preference
    localStorage.setItem(
      "a11y-screen-reader",
      screenReaderOptimized.toString(),
    );
  }, [fontSize, highContrast, reduceMotion, screenReaderOptimized, isHydrated]);

  const resetSettings = () => {
    setFontSize(16);
    setHighContrast(false);
    setReduceMotion(false);
    setScreenReaderOptimized(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        highContrast,
        setHighContrast,
        reduceMotion,
        setReduceMotion,
        screenReaderOptimized,
        setScreenReaderOptimized,
        resetSettings,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error(
      "useAccessibility must be used within AccessibilityProvider",
    );
  }
  return context;
}
