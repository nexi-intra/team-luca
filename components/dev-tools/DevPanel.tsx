"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { X, Globe, Moon, Sun, RotateCcw, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import html2canvas from "html2canvas";
import { cn } from "@/lib/utils";
import { useFeatureRingContext } from "@/lib/features/context";
import { getRingName, FEATURE_RINGS } from "@/lib/features/constants";
import type { FeatureRing } from "@/lib/features/constants";
import { createLogger } from "@/lib/logger";

const logger = createLogger('DevPanel');

interface Position {
  x: number;
  y: number;
}

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Español" },
  { code: "fr", name: "Français" },
  { code: "de", name: "Deutsch" },
  { code: "it", name: "Italiano" },
  { code: "pt", name: "Português" },
  { code: "zh", name: "中文" },
  { code: "ja", name: "日本語" },
];

export default function DevPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<Position>(() => {
    // Load saved position from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('devPanelPosition');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return { x: 20, y: 20 };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [panelPosition, setPanelPosition] = useState<'left' | 'right'>('left');
  const { theme, setTheme } = useTheme();
  
  // Feature ring context
  const { userRing, setUserRing } = useFeatureRingContext();
  
  const router = useRouter();
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef<Position>({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleRingChange = (value: string) => {
    const newRing = parseInt(value) as FeatureRing;
    logger.info('Changing ring from', userRing, 'to', newRing);
    setUserRing(newRing);
    
    // Force a small delay to see the change
    setTimeout(() => {
      logger.verbose('Ring after change:', userRing);
    }, 100);
  };

  // Debug current ring
  useEffect(() => {
    logger.verbose('Current user ring:', userRing);
  }, [userRing]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(0, Math.min(window.innerWidth - 48, e.clientX - dragStartPos.current.x));
      const newY = Math.max(0, Math.min(window.innerHeight - 48, e.clientY - dragStartPos.current.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      // Save position to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('devPanelPosition', JSON.stringify(position));
      }
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, position]);

  // Determine panel position based on icon location
  useEffect(() => {
    if (isOpen && dragRef.current) {
      const iconRect = dragRef.current.getBoundingClientRect();
      const panelWidth = 288; // w-72 = 18rem = 288px
      const windowWidth = window.innerWidth;
      
      // If icon is too close to right edge, show panel on left
      if (iconRect.right + panelWidth > windowWidth - 20) {
        setPanelPosition('right');
      } else {
        setPanelPosition('left');
      }
    }
  }, [isOpen, position]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      // Ensure icon stays within viewport on resize
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 48),
        y: Math.min(prev.y, window.innerHeight - 48)
      }));
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }


  const handleMouseDown = (e: React.MouseEvent) => {
    if (!dragRef.current) return;
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleLanguageChange = (value: string) => {
    setCurrentLanguage(value);
    // Update document language
    document.documentElement.lang = value;
    // You can dispatch a custom event or update context here
    window.dispatchEvent(new CustomEvent("languageChange", { detail: value }));
  };

  const handleReset = () => {
    // Save dev panel position before clearing
    const savedPosition = localStorage.getItem('devPanelPosition');
    
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    
    // Clear local storage
    localStorage.clear();
    
    // Clear session storage
    sessionStorage.clear();
    
    // Restore dev panel position
    if (savedPosition) {
      localStorage.setItem('devPanelPosition', savedPosition);
    }
    
    // Reload the page
    router.refresh();
    window.location.reload();
  };

  const handleScreenshot = async () => {
    try {
      const canvas = await html2canvas(document.body, {
        scale: 2, // High resolution
        logging: false,
        useCORS: true,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
      });
      
      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `screenshot-${new Date().toISOString()}.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      });
    } catch (error) {
      logger.error("Screenshot failed:", error);
      alert("Failed to capture screenshot");
    }
  };

  return (
    <div
      ref={dragRef}
      className="fixed z-[9999] select-none"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      {/* Draggable Icon */}
      <button
        className={`relative h-12 w-12 cursor-move rounded-full bg-white p-2 shadow-lg transition-opacity duration-200 ${
          isHovered || isOpen ? "opacity-100" : "opacity-20"
        }`}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Image
          src="/magic-button-logo.svg"
          alt="Dev Tools"
          width={32}
          height={32}
          className="pointer-events-none"
        />
      </button>

      {/* Control Panel */}
      <Collapsible open={isOpen}>
        <CollapsibleContent 
          ref={panelRef}
          className={cn(
            "absolute top-14 w-72 rounded-lg border bg-background p-4 shadow-xl",
            panelPosition === 'right' ? "right-0" : "left-0"
          )}
          style={{
            // Ensure panel doesn't go off bottom of screen
            maxHeight: `calc(100vh - ${position.y + 70}px)`,
            overflowY: 'auto'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Developer Tools</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-4">
            {/* Language Selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Language
              </label>
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="h-8">
                  <Globe className="h-3 w-3 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Theme Toggle */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Theme: {theme || 'system'}
              </label>
              <div className="flex gap-1">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("light")}
                  className="flex-1"
                >
                  <Sun className="h-3 w-3 mr-1" />
                  Light
                </Button>
                <Button
                  variant={theme === "dark" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("dark")}
                  className="flex-1"
                >
                  <Moon className="h-3 w-3 mr-1" />
                  Dark
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme("system")}
                  className="flex-1"
                >
                  Auto
                </Button>
              </div>
            </div>

            {/* Feature Ring Selector */}
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">
                Feature Ring
              </label>
              <Select 
                value={userRing.toString()} 
                onValueChange={handleRingChange}
              >
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[10000]">
                  <SelectItem value="1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span>Ring 1 - {getRingName(1)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span>Ring 2 - {getRingName(2)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span>Ring 3 - {getRingName(3)}</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="4">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span>Ring 4 - {getRingName(4)}</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground mt-1 space-y-1">
                <p>Current: Ring {userRing} ({getRingName(userRing)})</p>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((ring) => (
                    <div
                      key={ring}
                      className={cn(
                        "w-4 h-4 rounded text-xs flex items-center justify-center font-bold",
                        userRing <= ring 
                          ? "bg-green-500 text-white" 
                          : "bg-gray-300 text-gray-600"
                      )}
                    >
                      {ring}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={handleScreenshot}
              >
                <Camera className="h-3 w-3 mr-2" />
                Capture Screenshot
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="w-full justify-start"
                onClick={() => setShowResetDialog(true)}
              >
                <RotateCcw className="h-3 w-3 mr-2" />
                Reset Storage
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Storage?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will clear all cookies, sessions, and local storage. 
              You will be logged out and all saved preferences will be lost.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReset}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}