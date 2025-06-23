'use client';

import { useEffect } from 'react';
import { AuthLogger } from './logger';

// Create logger instance
const logger = new AuthLogger('Auth Callback Hook');

export function useAuthCallback() {
  useEffect(() => {
    // Only run this on pages that receive auth callbacks
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');
    const error = params.get('error');
    
    // Check if this is an auth callback
    if (!code && !state && !error) {
      return;
    }
    
    logger.debug('Auth callback detected', { 
      hasCode: !!code, 
      hasState: !!state, 
      hasError: !!error,
      isPopup: !!window.opener 
    });
    
    // Check if this is a popup callback
    if (window.opener) {
      logger.debug('Processing popup callback');
      
      if (error) {
        const errorMessage = params.get('error_description') || error;
        logger.debug('Sending error to parent', errorMessage);
        window.opener.postMessage({
          type: 'auth-error',
          error: errorMessage
        }, window.location.origin);
      } else if (code && state) {
        logger.debug('Sending success to parent', { code: code.substring(0, 10) + '...', state });
        window.opener.postMessage({
          type: 'auth-success',
          payload: { code, state }
        }, window.location.origin);
      }

      // Close the popup after a short delay to ensure message is sent
      setTimeout(() => {
        logger.debug('Closing popup window');
        window.close();
      }, 100);
    } else {
      // Regular redirect flow - the auth context will handle it
      logger.debug('Regular redirect flow, auth context will handle');
    }
  }, []);
}