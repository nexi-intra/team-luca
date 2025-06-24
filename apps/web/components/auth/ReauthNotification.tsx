'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@monorepo/auth';
import { getTimeUntilReauth } from '@/lib/auth/reauth-config';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, RefreshCw, X } from 'lucide-react';
import { createLogger } from '@monorepo/logger';

const logger = createLogger('ReauthNotification');

export function ReauthNotification() {
  const auth = useAuth();
  const { 
    isAuthenticated, 
    authSource,
    refreshSession
  } = auth;
  
  // These properties might not be available in the new auth system
  const isReauthRequired = false; // Not implemented in new auth system
  const nextReauthTime = null; // Not implemented in new auth system
  const skipReauth = () => { logger.info('Skip reauth called'); }; // No-op
  
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || authSource === 'magic' || !nextReauthTime) {
      return;
    }

    const updateTimer = () => {
      const remaining = getTimeUntilReauth(nextReauthTime);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isAuthenticated, authSource, nextReauthTime]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
      setShowNotification(false);
    } catch (error) {
      logger.error('Failed to refresh session:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSkip = () => {
    skipReauth();
    setShowNotification(false);
  };

  const formatTime = (ms: number): string => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't show for magic auth or if not authenticated
  if (!isAuthenticated || authSource === 'magic') {
    return null;
  }

  // Show warning when less than 1 minute remaining
  const showWarning = timeRemaining > 0 && timeRemaining < 60000;
  
  // Show re-auth required notification
  if (isReauthRequired && showNotification) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Alert className="w-96 border-orange-200 bg-orange-50">
          <RefreshCw className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Re-authentication Required</AlertTitle>
          <AlertDescription className="text-orange-700">
            Your session needs to be refreshed for security. Please re-authenticate to continue.
          </AlertDescription>
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isRefreshing ? (
                <>
                  <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                  Refreshing...
                </>
              ) : (
                'Refresh Now'
              )}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleSkip}
            >
              Skip for Now
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  // Show warning notification
  if (showWarning && showNotification) {
    return (
      <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Alert className="w-96 border-blue-200 bg-blue-50">
          <Clock className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-800">Session Expiring Soon</AlertTitle>
          <AlertDescription className="text-blue-700">
            Your session will require re-authentication in {formatTime(timeRemaining)}.
          </AlertDescription>
          <Progress 
            value={(60000 - timeRemaining) / 600} 
            className="mt-2 h-1"
          />
          <div className="mt-4 flex gap-2">
            <Button 
              size="sm" 
              variant="default"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              Refresh Early
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="ml-auto h-6 w-6"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  return null;
}