"use client";

import { useAccessibility } from "@/lib/accessibility/context";
import { Button } from "@/components/ui/button";
import { Type, Minus, Plus, Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function AccessibilityQuickControls() {
  const { fontSize, setFontSize, highContrast, setHighContrast } =
    useAccessibility();

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        {/* Font size controls */}
        <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
          {fontSize}px
        </span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFontSize(Math.max(fontSize - 2, 12))}
              disabled={fontSize <= 12}
              aria-label="Decrease font size"
            >
              <Type className="h-3.5 w-3.5" />
              <Minus className="h-2 w-2 -ml-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Decrease font size</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setFontSize(Math.min(fontSize + 2, 24))}
              disabled={fontSize >= 24}
              aria-label="Increase font size"
            >
              <Type className="h-3.5 w-3.5" />
              <Plus className="h-2 w-2 -ml-1" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Increase font size</p>
          </TooltipContent>
        </Tooltip>

        {/* High contrast toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${highContrast ? "bg-accent" : ""}`}
              onClick={() => setHighContrast(!highContrast)}
              aria-label="Toggle high contrast"
              data-active={highContrast}
            >
              <Eye className="h-3.5 w-3.5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{highContrast ? "Disable" : "Enable"} high contrast</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
