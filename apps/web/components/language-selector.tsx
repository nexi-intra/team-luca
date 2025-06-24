"use client";

import React, { useState } from "react";
import { Check, Globe, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";
import { cn } from "@monorepo/utils";
import { withDevOverlay } from "@/lib/dev/with-dev-overlay";

interface LanguageSelectorProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  showName?: boolean;
}

function LanguageSelectorBase({
  className,
  variant = "outline",
  size = "default",
  showIcon = true,
  showName = true,
}: LanguageSelectorProps) {
  const {
    language,
    languageInfo,
    availableLanguages,
    setLanguage,
    detectionResult,
  } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={cn("gap-2", className)}
          aria-label="Select language"
        >
          {showIcon && <Globe className="h-4 w-4" />}
          {showName && (
            <span className="hidden sm:inline-block">
              {languageInfo.nativeName}
            </span>
          )}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          Choose Language
          {detectionResult && detectionResult.source !== "user" && (
            <span className="text-xs text-muted-foreground ml-2">
              (auto-detected)
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className="cursor-pointer"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex flex-col">
                <span className="font-medium">{lang.nativeName}</span>
                <span className="text-xs text-muted-foreground">
                  {lang.name}
                </span>
              </div>
              {language === lang.code && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Compact version for mobile or space-constrained areas
function LanguageSelectorCompactBase({ className }: { className?: string }) {
  const { languageInfo, availableLanguages, setLanguage } = useLanguage();

  return (
    <select
      value={languageInfo.code}
      onChange={(e) => setLanguage(e.target.value as any)}
      className={cn(
        "bg-background border border-input rounded-md px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        className,
      )}
      aria-label="Select language"
    >
      {availableLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.nativeName}
        </option>
      ))}
    </select>
  );
}

export const LanguageSelector = withDevOverlay(
  LanguageSelectorBase,
  "LanguageSelector",
);
export const LanguageSelectorCompact = withDevOverlay(
  LanguageSelectorCompactBase,
  "LanguageSelectorCompact",
);
