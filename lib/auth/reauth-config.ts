import { AuthSource } from './types';

export interface ReauthConfig {
  enabled: boolean;
  intervalMinutes: number;
  warningMinutes: number;
  providers: AuthSource[];
}

export const defaultReauthConfig: ReauthConfig = {
  enabled: true,
  intervalMinutes: 10, // Re-authenticate every 10 minutes
  warningMinutes: 1,   // Show warning 1 minute before re-auth
  providers: ['msal', 'sso', 'supabase', 'custom'] // Magic auth excluded
};

export function shouldReauthenticate(
  authSource: AuthSource | null,
  lastAuthTime: Date | null,
  config: ReauthConfig = defaultReauthConfig
): boolean {
  if (!config.enabled || !authSource || !lastAuthTime) {
    return false;
  }

  // Magic auth doesn't require re-authentication
  if (!config.providers.includes(authSource)) {
    return false;
  }

  const now = new Date();
  const timeSinceAuth = now.getTime() - lastAuthTime.getTime();
  const intervalMs = config.intervalMinutes * 60 * 1000;

  return timeSinceAuth >= intervalMs;
}

export function getNextReauthTime(
  lastAuthTime: Date | null,
  config: ReauthConfig = defaultReauthConfig
): Date | null {
  if (!lastAuthTime || !config.enabled) {
    return null;
  }

  const nextTime = new Date(lastAuthTime);
  nextTime.setMinutes(nextTime.getMinutes() + config.intervalMinutes);
  return nextTime;
}

export function getTimeUntilReauth(
  nextReauthTime: Date | null
): number {
  if (!nextReauthTime) {
    return -1;
  }

  const now = new Date();
  return Math.max(0, nextReauthTime.getTime() - now.getTime());
}