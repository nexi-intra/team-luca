"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { CommandPaletteContextType, CommandAction } from "./types";
import { defaultCommandActions } from "./default-actions";
import { useFeatureRingContext } from "@monorepo/features";

const CommandPaletteContext = createContext<
  CommandPaletteContextType | undefined
>(undefined);

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext);
  if (!context) {
    throw new Error(
      "useCommandPalette must be used within CommandPaletteProvider",
    );
  }
  return context;
}

interface CommandPaletteProviderProps {
  children: React.ReactNode;
  customActions?: CommandAction[];
}

export function CommandPaletteProvider({
  children,
  customActions = [],
}: CommandPaletteProviderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [registeredActions, setRegisteredActions] = useState<CommandAction[]>(
    [],
  );
  const { currentRing } = useFeatureRingContext();

  // Filter actions based on current user's ring access
  const availableActions = React.useMemo(() => {
    const allActions = [
      ...defaultCommandActions,
      ...registeredActions,
      ...customActions,
    ];
    return allActions.filter((action) => currentRing <= action.requiredRing);
  }, [registeredActions, customActions, currentRing]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const registerAction = useCallback((action: CommandAction) => {
    setRegisteredActions((prev) => {
      // Prevent duplicate registrations
      if (prev.find((a) => a.id === action.id)) {
        return prev;
      }
      return [...prev, action];
    });
  }, []);

  const unregisterAction = useCallback((actionId: string) => {
    setRegisteredActions((prev) => prev.filter((a) => a.id !== actionId));
  }, []);

  const executeAction = useCallback(
    async (actionId: string) => {
      const action = availableActions.find((a) => a.id === actionId);
      if (action) {
        try {
          await action.action();
          setIsOpen(false);
        } catch (error) {
          console.error(`Failed to execute action ${actionId}:`, error);
        }
      }
    },
    [availableActions],
  );

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Command/Ctrl + K to open command palette
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        toggle();
        return;
      }

      // Handle action shortcuts when palette is closed
      if (!isOpen) {
        for (const action of availableActions) {
          if (action.shortcut && matchesShortcut(event, action.shortcut)) {
            event.preventDefault();
            executeAction(action.id);
            break;
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, availableActions, toggle, executeAction]);

  const value: CommandPaletteContextType = {
    isOpen,
    setIsOpen,
    toggle,
    actions: availableActions,
    registerAction,
    unregisterAction,
    executeAction,
  };

  return (
    <CommandPaletteContext.Provider value={value}>
      {children}
    </CommandPaletteContext.Provider>
  );
}

// Helper function to match keyboard shortcuts
function matchesShortcut(event: KeyboardEvent, shortcut: string): boolean {
  const parts = shortcut.toLowerCase().split("+");
  const hasCmd = parts.includes("cmd") || parts.includes("ctrl");
  const hasShift = parts.includes("shift");
  const hasAlt = parts.includes("alt");
  const key = parts[parts.length - 1];

  if (hasCmd && !(event.metaKey || event.ctrlKey)) return false;
  if (hasShift && !event.shiftKey) return false;
  if (hasAlt && !event.altKey) return false;

  return event.key.toLowerCase() === key;
}
