'use client';

import React, { useState } from 'react';
import { 
  Accessibility, 
  ZoomIn, 
  ZoomOut, 
  Contrast, 
  Type,
  Volume2,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAccessibility } from '@/lib/accessibility/context';
import { useAnnounce } from './announce-provider';

export function AccessibilityToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { fontSize, setFontSize, highContrast, setHighContrast } = useAccessibility();
  const { announce } = useAnnounce();

  const handleFontSizeChange = (direction: 'increase' | 'decrease') => {
    let newSize: number;
    if (direction === 'increase') {
      newSize = Math.min(fontSize + 2, 24);
    } else {
      newSize = Math.max(fontSize - 2, 12);
    }
    
    if (newSize !== fontSize) {
      setFontSize(newSize);
      announce(`Font size changed to ${newSize} pixels`);
    }
  };

  const toggleHighContrast = () => {
    setHighContrast(!highContrast);
    announce(`High contrast mode ${!highContrast ? 'enabled' : 'disabled'}`);
  };

  return (
    <div className="fixed right-4 bottom-4 z-40">
      {isOpen && (
        <Card className="mb-2 animate-in slide-in-from-bottom-2">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">Font Size ({fontSize}px)</span>
              <div className="flex gap-1">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => handleFontSizeChange('decrease')}
                  disabled={fontSize <= 12}
                  aria-label="Decrease font size"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-8 w-8"
                  onClick={() => handleFontSizeChange('increase')}
                  disabled={fontSize >= 24}
                  aria-label="Increase font size"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">High Contrast</span>
              <Button
                size="icon"
                variant={highContrast ? 'default' : 'outline'}
                className="h-8 w-8"
                onClick={toggleHighContrast}
                aria-label="Toggle high contrast mode"
              >
                <Contrast className="h-4 w-4" />
              </Button>
            </div>

            <div className="border-t pt-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.open('/accessibility', '_blank')}
              >
                <Type className="h-4 w-4 mr-2" />
                Accessibility Statement
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Button
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full h-12 w-12 shadow-lg"
        aria-label={isOpen ? 'Close accessibility toolbar' : 'Open accessibility toolbar'}
        aria-expanded={isOpen}
      >
        <Accessibility className="h-5 w-5" />
      </Button>
    </div>
  );
}