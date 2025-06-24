'use client';

import * as React from 'react';
import { cn } from '@monorepo/utils';

interface SidebarResizerProps extends React.HTMLAttributes<HTMLDivElement> {
  onResize?: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  defaultWidth?: number;
}

export function SidebarResizer({
  className,
  onResize,
  minWidth = 200,
  maxWidth = 500,
  defaultWidth = 256,
  ...props
}: SidebarResizerProps) {
  const [isResizing, setIsResizing] = React.useState(false);
  const [width, setWidth] = React.useState(defaultWidth);

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const newWidth = Math.min(Math.max(e.clientX, minWidth), maxWidth);
      setWidth(newWidth);
      onResize?.(newWidth);
      
      // Update CSS variable for sidebar width
      document.documentElement.style.setProperty('--sidebar-width', `${newWidth}px`);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    if (isResizing) {
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, minWidth, maxWidth, onResize]);

  return (
    <div
      className={cn(
        'group absolute right-0 top-0 h-full w-1 cursor-col-resize hover:bg-blue-500/50 transition-colors',
        'after:absolute after:inset-y-0 after:-left-1 after:-right-1 after:content-[""]',
        isResizing && 'bg-blue-500',
        className
      )}
      onMouseDown={() => setIsResizing(true)}
      {...props}
    />
  );
}