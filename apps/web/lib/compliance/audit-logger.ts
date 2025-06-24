import { SessionPayload } from '@monorepo/auth';
import { config } from '@/lib/config';

export interface AuditEvent {
  id: string;
  timestamp: Date;
  userId?: string;
  userEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  action: string;
  resource?: string;
  result: 'success' | 'failure' | 'error';
  metadata?: Record<string, any>;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

export class AuditLogger {
  private static instance: AuditLogger;

  private constructor() {}

  static getInstance(): AuditLogger {
    if (!AuditLogger.instance) {
      AuditLogger.instance = new AuditLogger();
    }
    return AuditLogger.instance;
  }

  async log(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    const auditEvent: AuditEvent = {
      ...event,
      id: this.generateEventId(),
      timestamp: new Date(),
    };

    // In production, send to your audit logging service
    // For now, just log to console in development
    if (config.getOrDefault('general.environment', 'development') === 'development') {
      console.log('[AUDIT]', JSON.stringify(auditEvent, null, 2));
    } else {
      // TODO: Send to audit logging service (e.g., Datadog, Splunk, ELK)
      await this.sendToAuditService(auditEvent);
    }
  }

  async logAuthEvent(
    action: 'login' | 'logout' | 'session_created' | 'session_expired' | 'permission_denied',
    user?: SessionPayload,
    request?: Request,
    result: 'success' | 'failure' = 'success',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId: user?.userId,
      userEmail: user?.email,
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      action: `auth.${action}`,
      result,
      metadata,
      severity: result === 'failure' ? 'warning' : 'info',
    });
  }

  async logDataAccess(
    action: 'read' | 'write' | 'delete',
    resource: string,
    user?: SessionPayload,
    request?: Request,
    result: 'success' | 'failure' = 'success',
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      userId: user?.userId,
      userEmail: user?.email,
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      action: `data.${action}`,
      resource,
      result,
      metadata,
      severity: action === 'delete' ? 'warning' : 'info',
    });
  }

  async logSecurityEvent(
    action: string,
    severity: 'warning' | 'error' | 'critical',
    request?: Request,
    metadata?: Record<string, any>
  ): Promise<void> {
    await this.log({
      ipAddress: request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined,
      userAgent: request?.headers.get('user-agent') || undefined,
      action: `security.${action}`,
      result: 'failure',
      metadata,
      severity,
    });
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToAuditService(event: AuditEvent): Promise<void> {
    // Implement your audit logging service integration here
    // Examples:
    // - AWS CloudTrail
    // - Azure Monitor
    // - Google Cloud Audit Logs
    // - Datadog
    // - Splunk
    
    // For now, just write to console
    console.log('[AUDIT]', JSON.stringify(event));
  }
}

export const auditLogger = AuditLogger.getInstance();