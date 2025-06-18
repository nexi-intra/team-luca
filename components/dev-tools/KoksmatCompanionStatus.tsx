'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Play, 
  Terminal, 
  Activity,
  AlertCircle,
  Loader2,
  FileText
} from 'lucide-react';
import { koksmatCompanion, CompanionStatus } from '@/lib/koksmat/companion-client';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { KoksmatLogViewer } from './KoksmatLogViewer';

export function KoksmatCompanionStatus() {
  const [status, setStatus] = useState<CompanionStatus>({ status: 'disconnected' });
  const [scripts, setScripts] = useState<string[]>([]);
  const [isLoadingScripts, setIsLoadingScripts] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showLogViewer, setShowLogViewer] = useState(false);

  useEffect(() => {
    // Auto-connect on mount
    koksmatCompanion.connect();

    // Subscribe to status changes
    const unsubscribe = koksmatCompanion.onStatusChange(setStatus);

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (status.status === 'connected') {
      loadScripts();
    }
  }, [status.status]);

  const loadScripts = async () => {
    setIsLoadingScripts(true);
    try {
      const scriptList = await koksmatCompanion.listScripts();
      setScripts(scriptList);
    } catch (error) {
      console.error('Failed to load scripts:', error);
    } finally {
      setIsLoadingScripts(false);
    }
  };

  const handleConnect = () => {
    if (status.status === 'connected') {
      koksmatCompanion.disconnect();
    } else {
      koksmatCompanion.connect();
    }
  };

  const executeScript = async (scriptName: string) => {
    try {
      const scriptId = koksmatCompanion.executeScript(scriptName);
      
      // Listen for script events
      const unsubscribe = koksmatCompanion.onScriptEvent(scriptId, (event) => {
        console.log('Script event:', event);
        // You could show output in a modal or console here
      });

      // Clean up after 30 seconds
      setTimeout(unsubscribe, 30000);
    } catch (error) {
      console.error('Failed to execute script:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'connected':
        return <Wifi className="h-3 w-3" />;
      case 'connecting':
        return <Loader2 className="h-3 w-3 animate-spin" />;
      case 'error':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <WifiOff className="h-3 w-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'connected':
        return 'text-green-500';
      case 'connecting':
        return 'text-yellow-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-muted-foreground">
          Koksmat Companion
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("h-6 px-2 gap-1", getStatusColor())}
            >
              {getStatusIcon()}
              <span className="text-xs capitalize">{status.status}</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 z-[10001]" align="end">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Koksmat Companion</h4>
                <Badge variant={status.status === 'connected' ? 'default' : 'secondary'}>
                  {status.status}
                </Badge>
              </div>

              {status.status === 'disconnected' && (
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    Start the companion server to enable script automation:
                  </p>
                  <pre className="bg-muted p-2 rounded text-xs">
                    <code>cd koksmat-companion{'\n'}npm install{'\n'}npm start</code>
                  </pre>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleConnect}
                  >
                    <Wifi className="h-3 w-3 mr-2" />
                    Connect to Companion
                  </Button>
                </div>
              )}

              {status.status === 'connected' && (
                <>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="space-y-1">
                      <Activity className="h-4 w-4 mx-auto text-blue-500" />
                      <p className="text-xs font-medium">{status.scripts?.running || 0}</p>
                      <p className="text-xs text-muted-foreground">Running</p>
                    </div>
                    <div className="space-y-1">
                      <Terminal className="h-4 w-4 mx-auto text-green-500" />
                      <p className="text-xs font-medium">{status.scripts?.completed || 0}</p>
                      <p className="text-xs text-muted-foreground">Completed</p>
                    </div>
                    <div className="space-y-1">
                      <AlertCircle className="h-4 w-4 mx-auto text-red-500" />
                      <p className="text-xs font-medium">{status.scripts?.failed || 0}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>

                  {status.uptime && (
                    <p className="text-xs text-muted-foreground">
                      Uptime: {Math.floor(status.uptime / 1000 / 60)}m {Math.floor((status.uptime / 1000) % 60)}s
                    </p>
                  )}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-medium">Available Scripts</h5>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2"
                        onClick={loadScripts}
                        disabled={isLoadingScripts}
                      >
                        {isLoadingScripts ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          'Refresh'
                        )}
                      </Button>
                    </div>

                    {scripts.length > 0 ? (
                      <div className="space-y-1">
                        {scripts.map((script) => (
                          <div
                            key={script}
                            className="flex items-center justify-between p-1 rounded hover:bg-accent"
                          >
                            <span className="text-xs font-mono">{script}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2"
                              onClick={() => executeScript(script)}
                            >
                              <Play className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        No scripts found in scripts/ directory
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => setShowLogViewer(true)}
                    >
                      <FileText className="h-3 w-3 mr-2" />
                      View Logs
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleConnect}
                    >
                      <WifiOff className="h-3 w-3 mr-2" />
                      Disconnect
                    </Button>
                  </div>
                </>
              )}

              {status.status === 'error' && (
                <div className="space-y-2">
                  <p className="text-sm text-red-500">
                    Failed to connect to companion server
                  </p>
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={handleConnect}
                  >
                    Retry Connection
                  </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Log Viewer */}
      <KoksmatLogViewer 
        isOpen={showLogViewer} 
        onClose={() => setShowLogViewer(false)} 
      />
    </div>
  );
}