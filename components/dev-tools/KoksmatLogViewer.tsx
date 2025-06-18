'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Search, AlertCircle, Info, AlertTriangle, Bug, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { koksmatCompanion } from '@/lib/koksmat/companion-client';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'verbose' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
}

interface KoksmatLogViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

const logLevelConfig = {
  verbose: { icon: Bug, color: 'text-gray-500', bgColor: 'bg-gray-100 dark:bg-gray-800' },
  info: { icon: Info, color: 'text-blue-500', bgColor: 'bg-blue-100 dark:bg-blue-900' },
  warn: { icon: AlertTriangle, color: 'text-yellow-500', bgColor: 'bg-yellow-100 dark:bg-yellow-900' },
  error: { icon: AlertCircle, color: 'text-red-500', bgColor: 'bg-red-100 dark:bg-red-900' },
};

export function KoksmatLogViewer({ isOpen, onClose }: KoksmatLogViewerProps) {
  const [position, setPosition] = useState({ x: window.innerWidth * 0.1, y: window.innerHeight * 0.1 });
  const [size, setSize] = useState({ width: window.innerWidth * 0.8, height: window.innerHeight * 0.8 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const panelRef = useRef<HTMLDivElement>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to logs from companion
  useEffect(() => {
    if (!isOpen) return;

    // Add some initial mock logs for demo
    const mockLogs: LogEntry[] = [
      { id: '1', timestamp: new Date().toISOString(), level: 'info', message: 'Log viewer opened', source: 'log-viewer' },
      { id: '2', timestamp: new Date().toISOString(), level: 'verbose', message: 'Subscribing to companion logs...', source: 'log-viewer' },
    ];
    setLogs(mockLogs);

    // Subscribe to real logs from companion
    const unsubscribe = koksmatCompanion.onLogEntry((log) => {
      setLogs(prev => [...prev, log]);
    });

    return () => {
      unsubscribe();
    };
  }, [isOpen]);

  // Filter logs based on level and search
  useEffect(() => {
    let filtered = logs;

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(log => 
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.source?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [logs, selectedLevel, searchTerm]);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, autoScroll]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.log-viewer-header')) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStart]);

  if (!isOpen) return null;

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3
    });
  };

  return (
    <div
      ref={panelRef}
      className="fixed z-[10000] rounded-lg border bg-background shadow-2xl"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="log-viewer-header flex items-center justify-between border-b px-4 py-2 cursor-move bg-muted/50">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold">Koksmat Companion Logs</h3>
          <Badge variant="outline" className="text-xs">
            {filteredLogs.length} logs
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-2 border-b px-4 py-2">
        <div className="flex items-center gap-2 flex-1">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="h-8 w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="verbose">Verbose</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="warn">Warning</SelectItem>
              <SelectItem value="error">Error</SelectItem>
            </SelectContent>
          </Select>
          
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 pl-8"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={cn("h-8", autoScroll && "bg-accent")}
          >
            Auto-scroll
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLogs([])}
            className="h-8"
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Logs */}
      <div className="flex-1 overflow-auto p-4" style={{ height: 'calc(100% - 8rem)' }}>
        {filteredLogs.length === 0 ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <p className="text-sm">No logs to display</p>
          </div>
        ) : (
          <div className="space-y-1 font-mono text-xs">
            {filteredLogs.map((log) => {
              const config = logLevelConfig[log.level];
              const Icon = config.icon;
              
              return (
                <div
                  key={log.id}
                  className={cn(
                    "flex items-start gap-2 rounded px-2 py-1",
                    config.bgColor
                  )}
                >
                  <Icon className={cn("h-3 w-3 mt-0.5 shrink-0", config.color)} />
                  <span className="text-muted-foreground shrink-0">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  {log.source && (
                    <span className="text-muted-foreground shrink-0">
                      [{log.source}]
                    </span>
                  )}
                  <span className="break-all">{log.message}</span>
                </div>
              );
            })}
            <div ref={logsEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}