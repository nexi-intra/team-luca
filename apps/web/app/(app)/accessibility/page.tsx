'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBreadcrumbTitle } from '@/hooks/useBreadcrumbTitle';
import { useAccessibility } from '@/lib/accessibility/context';
import { 
  Accessibility, 
  Type, 
  Palette, 
  Volume2, 
  Eye,
  Minus,
  Plus,
  RotateCcw
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function AccessibilityPage() {
  useBreadcrumbTitle('Accessibility Settings');
  
  const {
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    screenReaderOptimized,
    setScreenReaderOptimized,
    resetSettings,
  } = useAccessibility();
  
  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 2, 24));
  };
  
  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 2, 12));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Accessibility className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Accessibility Settings</h1>
        </div>
        
        <Tabs defaultValue="visual" className="space-y-4">
          <TabsList>
            <TabsTrigger value="visual">Visual</TabsTrigger>
            <TabsTrigger value="interaction">Interaction</TabsTrigger>
            <TabsTrigger value="audio">Audio & Screen Readers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="visual" className="space-y-6">
            {/* Font Size Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5" />
                  Font Size
                </CardTitle>
                <CardDescription>
                  Adjust the text size across the entire application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={decreaseFontSize}
                    disabled={fontSize <= 12}
                    aria-label="Decrease font size"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <Slider
                      value={[fontSize]}
                      onValueChange={([value]) => setFontSize(value)}
                      min={12}
                      max={24}
                      step={1}
                      className="w-full"
                      aria-label="Font size slider"
                    />
                  </div>
                  
                  <Button 
                    size="icon" 
                    variant="outline"
                    onClick={increaseFontSize}
                    disabled={fontSize >= 24}
                    aria-label="Increase font size"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Current size: {fontSize}px
                  </p>
                  <p className="mt-2" style={{ fontSize: `${fontSize}px` }}>
                    Preview: The quick brown fox jumps over the lazy dog
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* High Contrast Mode */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  High Contrast Mode
                </CardTitle>
                <CardDescription>
                  Increase color contrast for better visibility
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="high-contrast">Enable High Contrast</Label>
                    <p className="text-sm text-muted-foreground">
                      Makes text and UI elements more distinct
                    </p>
                  </div>
                  <Switch
                    id="high-contrast"
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                    aria-label="Toggle high contrast mode"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="interaction" className="space-y-6">
            {/* Reduce Motion */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Motion & Animations
                </CardTitle>
                <CardDescription>
                  Control animation preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="reduce-motion">Reduce Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Minimize animations and transitions
                    </p>
                  </div>
                  <Switch
                    id="reduce-motion"
                    checked={reduceMotion}
                    onCheckedChange={setReduceMotion}
                    aria-label="Toggle reduce motion"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Keyboard Navigation Info */}
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Navigation</CardTitle>
                <CardDescription>
                  Navigate the application using keyboard shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 text-sm bg-muted rounded">Tab</kbd>
                    <span className="text-sm">Navigate between elements</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 text-sm bg-muted rounded">Enter</kbd>
                    <span className="text-sm">Activate buttons and links</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 text-sm bg-muted rounded">Esc</kbd>
                    <span className="text-sm">Close dialogs and menus</span>
                  </div>
                  <div className="flex justify-between">
                    <kbd className="px-2 py-1 text-sm bg-muted rounded">Space</kbd>
                    <span className="text-sm">Toggle checkboxes and buttons</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="audio" className="space-y-6">
            {/* Screen Reader Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Screen Reader Support
                </CardTitle>
                <CardDescription>
                  Optimize the interface for screen readers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="screen-reader">Screen Reader Optimization</Label>
                    <p className="text-sm text-muted-foreground">
                      Enhance compatibility with assistive technologies
                    </p>
                  </div>
                  <Switch
                    id="screen-reader"
                    checked={screenReaderOptimized}
                    onCheckedChange={setScreenReaderOptimized}
                    aria-label="Toggle screen reader optimization"
                  />
                </div>
              </CardContent>
            </Card>
            
            {/* Screen Reader Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Screen Reader Tips</CardTitle>
                <CardDescription>
                  Common screen reader commands for this application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Use heading navigation (H key) to jump between sections</li>
                  <li>• Press B to navigate between buttons</li>
                  <li>• Use landmark navigation to find main content areas</li>
                  <li>• Tables include proper headers for context</li>
                  <li>• All images include descriptive alt text</li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Reset Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            variant="outline" 
            onClick={resetSettings}
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Settings
          </Button>
        </div>
      </div>
    </div>
  );
}