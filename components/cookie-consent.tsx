'use client';

import React, { useState, useEffect } from 'react';
import { X, Cookie, Shield, BarChart3, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { withDevOverlay } from '@/lib/dev/with-dev-overlay';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  preferences: boolean;
}

interface CookieConsentProps {
  onAccept?: (preferences: CookiePreferences) => void;
  onDecline?: () => void;
}

const CONSENT_KEY = 'cookie-consent';
const PREFERENCES_KEY = 'cookie-preferences';

function CookieConsentBase({ onAccept, onDecline }: CookieConsentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = localStorage.getItem(CONSENT_KEY);
    if (!hasConsent) {
      // Show consent banner after a short delay
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(PREFERENCES_KEY);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e);
        }
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    };
    saveConsent(allAccepted);
  };

  const handleAcceptSelected = () => {
    saveConsent(preferences);
  };

  const handleDeclineAll = () => {
    const onlyNecessary: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      preferences: false,
    };
    saveConsent(onlyNecessary);
    onDecline?.();
  };

  const saveConsent = (prefs: CookiePreferences) => {
    localStorage.setItem(CONSENT_KEY, 'true');
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
    setIsVisible(false);
    onAccept?.(prefs);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsVisible(false)} />
      
      <Card className="relative z-10 w-full max-w-2xl animate-in slide-in-from-bottom-4 duration-300">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              <CardTitle>Cookie Preferences</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            We use cookies to enhance your experience, analyze site traffic, and personalize content.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {!showDetails ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                By clicking &quot;Accept All&quot;, you agree to the storing of cookies on your device. You can also customize your preferences.
              </p>
              
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleAcceptAll} className="flex-1">
                  Accept All
                </Button>
                <Button onClick={() => setShowDetails(true)} variant="outline" className="flex-1">
                  Manage Preferences
                </Button>
                <Button onClick={handleDeclineAll} variant="ghost" className="flex-1">
                  Reject All
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="necessary" className="font-medium">
                          Necessary Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Essential for the website to function properly
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="necessary"
                      checked={preferences.necessary}
                      disabled
                      aria-label="Necessary cookies (always enabled)"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="analytics" className="font-medium">
                          Analytics Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Help us understand how visitors use our website
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="analytics"
                      checked={preferences.analytics}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, analytics: checked })
                      }
                      aria-label="Toggle analytics cookies"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                      <Settings className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <Label htmlFor="preferences" className="font-medium">
                          Preference Cookies
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Remember your settings and preferences
                        </p>
                      </div>
                    </div>
                    <Switch
                      id="preferences"
                      checked={preferences.preferences}
                      onCheckedChange={(checked) =>
                        setPreferences({ ...preferences, preferences: checked })
                      }
                      aria-label="Toggle preference cookies"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleAcceptSelected} className="flex-1">
                  Save Preferences
                </Button>
                <Button onClick={() => setShowDetails(false)} variant="outline" className="flex-1">
                  Back
                </Button>
              </div>
            </div>
          )}
          
          <p className="text-xs text-center text-muted-foreground">
            You can change your cookie settings at any time by clicking the cookie icon in the footer.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook to check cookie consent
export function useCookieConsent() {
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    setHasConsent(consent === 'true');

    if (consent) {
      const prefs = localStorage.getItem(PREFERENCES_KEY);
      if (prefs) {
        try {
          setPreferences(JSON.parse(prefs));
        } catch (e) {
          console.error('Failed to parse cookie preferences:', e);
        }
      }
    }
  }, []);

  const updatePreferences = (newPreferences: CookiePreferences) => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences));
    setPreferences(newPreferences);
  };

  return { hasConsent, preferences, updatePreferences };
}

export const CookieConsent = withDevOverlay(CookieConsentBase, "CookieConsent");