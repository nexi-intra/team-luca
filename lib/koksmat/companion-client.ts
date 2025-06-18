'use client';

import { io, Socket } from 'socket.io-client';
import { createLogger } from '@/lib/logger';

const logger = createLogger('KoksmatCompanion');

export interface CompanionStatus {
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  uptime?: number;
  scripts?: {
    running: number;
    completed: number;
    failed: number;
  };
}

export interface ScriptOutput {
  id: string;
  type: 'stdout' | 'stderr';
  data: string;
}

export interface ScriptResult {
  id: string;
  name: string;
  code: number;
  duration: number;
  success: boolean;
  output?: Array<{ type: string; data: string; timestamp: number }>;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'verbose' | 'info' | 'warn' | 'error';
  message: string;
  source?: string;
}

class KoksmatCompanionClient {
  private socket: Socket | null = null;
  private status: CompanionStatus = { status: 'disconnected' };
  private listeners: Set<(status: CompanionStatus) => void> = new Set();
  private scriptListeners: Map<string, Set<(data: any) => void>> = new Map();
  private logListeners: Set<(log: LogEntry) => void> = new Set();
  private reconnectTimer: NodeJS.Timeout | null = null;
  private readonly COMPANION_URL = process.env.NEXT_PUBLIC_KOKSMAT_COMPANION_URL || 'http://localhost:2512';

  connect() {
    if (this.socket?.connected) {
      return;
    }

    logger.info('Connecting to Koksmat Companion at', this.COMPANION_URL);
    this.updateStatus({ status: 'connecting' });

    try {
      this.socket = io(this.COMPANION_URL, {
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
      });

      this.setupEventHandlers();
    } catch (error) {
      logger.error('Failed to create socket connection:', error);
      this.updateStatus({ status: 'error' });
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      logger.info('Connected to Koksmat Companion');
      this.updateStatus({ status: 'connected' });
      
      // Clear any reconnect timer
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    });

    this.socket.on('disconnect', () => {
      logger.warn('Disconnected from Koksmat Companion');
      this.updateStatus({ status: 'disconnected' });
    });

    this.socket.on('connect_error', (error) => {
      logger.error('Connection error:', error.message);
      this.updateStatus({ status: 'error' });
    });

    this.socket.on('companion:status', (data) => {
      logger.verbose('Received companion status:', data);
      this.updateStatus({
        status: 'connected',
        uptime: data.uptime,
        scripts: data.scripts,
      });
    });

    // Script-related events
    this.socket.on('script:started', (data) => {
      logger.info('Script started:', data);
      this.notifyScriptListeners(data.id, { ...data, type: 'started' });
    });

    this.socket.on('script:output', (data: ScriptOutput) => {
      this.notifyScriptListeners(data.id, { ...data, type: 'output' });
    });

    this.socket.on('script:completed', (data: ScriptResult) => {
      logger.info('Script completed:', data);
      this.notifyScriptListeners(data.id, { ...data, type: 'completed' });
    });

    this.socket.on('script:error', (data) => {
      logger.error('Script error:', data);
      this.notifyScriptListeners(data.id, { ...data, type: 'error' });
    });

    // Log events
    this.socket.on('log:entry', (log: LogEntry) => {
      this.notifyLogListeners(log);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.updateStatus({ status: 'disconnected' });
  }

  private updateStatus(status: CompanionStatus) {
    this.status = status;
    this.listeners.forEach(listener => listener(status));
  }

  private notifyScriptListeners(scriptId: string, data: any) {
    const listeners = this.scriptListeners.get(scriptId);
    if (listeners) {
      listeners.forEach(listener => listener(data));
    }
  }

  private notifyLogListeners(log: LogEntry) {
    this.logListeners.forEach(listener => listener(log));
  }

  onStatusChange(listener: (status: CompanionStatus) => void) {
    this.listeners.add(listener);
    // Immediately call with current status
    listener(this.status);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  onScriptEvent(scriptId: string, listener: (data: any) => void) {
    if (!this.scriptListeners.has(scriptId)) {
      this.scriptListeners.set(scriptId, new Set());
    }
    this.scriptListeners.get(scriptId)!.add(listener);

    return () => {
      const listeners = this.scriptListeners.get(scriptId);
      if (listeners) {
        listeners.delete(listener);
        if (listeners.size === 0) {
          this.scriptListeners.delete(scriptId);
        }
      }
    };
  }

  onLogEntry(listener: (log: LogEntry) => void) {
    this.logListeners.add(listener);
    
    return () => {
      this.logListeners.delete(listener);
    };
  }

  executeScript(name: string, args?: string[], env?: Record<string, string>) {
    if (!this.socket?.connected) {
      throw new Error('Not connected to Koksmat Companion');
    }

    const id = `script-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    this.socket.emit('script:execute', {
      id,
      name,
      args,
      env,
    });

    return id;
  }

  async getStatus(): Promise<any> {
    try {
      const response = await fetch(`${this.COMPANION_URL}/api/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch status');
      }
      return await response.json();
    } catch (error) {
      logger.error('Failed to get companion status:', error);
      throw error;
    }
  }

  async listScripts(): Promise<string[]> {
    try {
      const response = await fetch(`${this.COMPANION_URL}/api/scripts`);
      if (!response.ok) {
        throw new Error('Failed to fetch scripts');
      }
      const data = await response.json();
      return data.scripts || [];
    } catch (error) {
      logger.error('Failed to list scripts:', error);
      return [];
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.COMPANION_URL}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
export const koksmatCompanion = new KoksmatCompanionClient();