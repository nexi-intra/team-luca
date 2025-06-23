'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useSidebar } from '@/components/ui/sidebar';
import { Menu, ChevronLeft, ChevronRight, Maximize2, Minimize2 } from 'lucide-react';

export default function SidebarDemoClient() {
  const { state, toggleSidebar, width } = useSidebar();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sidebar Demo</h1>
          <p className="text-muted-foreground">
            Interactive demonstration of the sidebar component
          </p>
        </div>
        <Badge variant="outline">Ring 1 Feature</Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar Controls</CardTitle>
          <CardDescription>
            Control the sidebar using these options or keyboard shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSidebar}
              className="gap-2"
            >
              {state === 'expanded' ? (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  Collapse Sidebar
                </>
              ) : (
                <>
                  <ChevronRight className="h-4 w-4" />
                  Expand Sidebar
                </>
              )}
            </Button>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>or press</span>
              <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                <span className="text-xs">⌘</span>B
              </kbd>
            </div>
          </div>
          
          {state === 'expanded' && (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Current width: <span className="font-mono">{width}px</span>
              </p>
              <p className="text-sm text-muted-foreground">
                Drag the right edge of the sidebar to resize it
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Side-by-Side Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The sidebar now renders alongside the main content instead of overlaying it.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resizable Width</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Drag the sidebar edge to resize between 200px and 500px. Width is saved to cookies.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Collapse Control</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Click the rail or use ⌘B to toggle between expanded and collapsed states.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Persistent State</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Both collapsed state and width are saved to cookies and persist across sessions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Mobile Responsive</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              On mobile devices, the sidebar becomes a sheet overlay for better UX.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Feature Ring Protection</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The sidebar is protected by Ring 1 access. Users need experimental access to see it.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}