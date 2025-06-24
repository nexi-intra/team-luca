"use client";

import { useEffect, useState, useCallback } from "react";

interface AccessibilitySettings {
  reducedMotion: boolean;
  highContrast: boolean;
  screenReaderActive: boolean;
  keyboardNavigation: boolean;
  fontSize: "normal" | "large" | "extra-large";
}

export function useAccessibility() {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    reducedMotion: false,
    highContrast: false,
    screenReaderActive: false,
    keyboardNavigation: false,
    fontSize: "normal",
  });

  useEffect(() => {
    // Check for reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSettings((prev) => ({ ...prev, reducedMotion: motionQuery.matches }));

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setSettings((prev) => ({ ...prev, reducedMotion: e.matches }));
    };
    motionQuery.addEventListener("change", handleMotionChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    setSettings((prev) => ({ ...prev, highContrast: contrastQuery.matches }));

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setSettings((prev) => ({ ...prev, highContrast: e.matches }));
    };
    contrastQuery.addEventListener("change", handleContrastChange);

    // Detect keyboard navigation
    let lastInteraction: "mouse" | "keyboard" = "mouse";

    const handleMouseDown = () => {
      lastInteraction = "mouse";
      setSettings((prev) => ({ ...prev, keyboardNavigation: false }));
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        lastInteraction = "keyboard";
        setSettings((prev) => ({ ...prev, keyboardNavigation: true }));
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    // Load saved font size preference
    const savedFontSize = localStorage.getItem(
      "accessibility-font-size",
    ) as AccessibilitySettings["fontSize"];
    if (savedFontSize) {
      setSettings((prev) => ({ ...prev, fontSize: savedFontSize }));
      applyFontSize(savedFontSize);
    }

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
      contrastQuery.removeEventListener("change", handleContrastChange);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const setFontSize = useCallback((size: AccessibilitySettings["fontSize"]) => {
    setSettings((prev) => ({ ...prev, fontSize: size }));
    localStorage.setItem("accessibility-font-size", size);
    applyFontSize(size);
  }, []);

  const applyFontSize = (size: AccessibilitySettings["fontSize"]) => {
    document.documentElement.classList.remove(
      "text-size-normal",
      "text-size-large",
      "text-size-extra-large",
    );
    document.documentElement.classList.add(`text-size-${size}`);
  };

  return {
    ...settings,
    setFontSize,
  };
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Build shortcut key from event
      const parts: string[] = [];
      if (e.ctrlKey) parts.push("ctrl");
      if (e.metaKey) parts.push("cmd");
      if (e.altKey) parts.push("alt");
      if (e.shiftKey) parts.push("shift");
      parts.push(e.key.toLowerCase());

      const shortcut = parts.join("+");
      const handler = shortcuts[shortcut];

      if (handler) {
        e.preventDefault();
        handler();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts]);
}

// Hook for managing ARIA live regions
export function useAriaLive() {
  const [announcement, setAnnouncement] = useState("");
  const [priority, setPriority] = useState<"polite" | "assertive">("polite");

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      setPriority(priority);
      setAnnouncement("");

      // Small delay to ensure screen readers catch the change
      setTimeout(() => {
        setAnnouncement(message);
      }, 100);
    },
    [],
  );

  return { announcement, priority, announce };
}
