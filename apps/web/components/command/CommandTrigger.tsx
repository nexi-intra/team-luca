"use client";

import React from "react";
import { useCommandPalette } from "@/lib/command/context";
import { Button } from "@/components/ui/button";
import { Command } from "lucide-react";
import { RingGate } from "@/components/features/RingGate";

interface CommandTriggerProps {
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  showShortcut?: boolean;
}

export function CommandTrigger({
  variant = "outline",
  size = "sm",
  className,
  showShortcut = true,
}: CommandTriggerProps) {
  const { toggle } = useCommandPalette();

  return (
    <RingGate requiredRing={1}>
      <Button
        variant={variant}
        size={size}
        onClick={toggle}
        className={className}
      >
        <Command className="h-4 w-4" />
        {showShortcut && size !== "icon" && (
          <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        )}
      </Button>
    </RingGate>
  );
}
