'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Language, LanguageInfo, LanguageContextType, LanguageDetectionResult } from './types';
import { LANGUAGES, DEFAULT_LANGUAGE } from './languages';
import { detectLanguage } from './detection';
import { useAnnounce } from '@/components/accessibility/announce-provider';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [isLoading, setIsLoading] = useState(true);
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult | null>(null);
  const { announce } = useAnnounce();

  // Initialize language detection
  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        setIsLoading(true);
        const result = await detectLanguage();
        setDetectionResult(result);
        setLanguageState(result.detectedLanguage);
        
        // Set document language attribute
        if (typeof document !== 'undefined') {
          document.documentElement.lang = result.detectedLanguage;
        }
      } catch (error) {
        console.error('Error initializing language:', error);
        setLanguageState(DEFAULT_LANGUAGE);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = useCallback((newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('user-language', newLanguage);
    }
    
    // Update document language attribute
    if (typeof document !== 'undefined') {
      document.documentElement.lang = newLanguage;
    }
    
    // Update detection result to reflect user preference
    setDetectionResult({
      detectedLanguage: newLanguage,
      confidence: 1.0,
      source: 'user',
    });
    
    // Announce language change
    const langInfo = LANGUAGES[newLanguage];
    announce(`Language changed to ${langInfo.nativeName}`, 'polite');
  }, [announce]);

  const detectLanguageManually = useCallback(async (): Promise<Language> => {
    try {
      const result = await detectLanguage();
      setDetectionResult(result);
      return result.detectedLanguage;
    } catch (error) {
      console.error('Error detecting language:', error);
      return DEFAULT_LANGUAGE;
    }
  }, []);

  const formatNumber = useCallback((value: number, options?: Intl.NumberFormatOptions): string => {
    try {
      return new Intl.NumberFormat(language, options).format(value);
    } catch (error) {
      console.error('Error formatting number:', error);
      return value.toString();
    }
  }, [language]);

  const formatDate = useCallback((date: Date, options?: Intl.DateTimeFormatOptions): string => {
    try {
      return new Intl.DateTimeFormat(language, options).format(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return date.toLocaleDateString();
    }
  }, [language]);

  const formatCurrency = useCallback((value: number, currency: string = 'USD'): string => {
    try {
      return new Intl.NumberFormat(language, {
        style: 'currency',
        currency,
      }).format(value);
    } catch (error) {
      console.error('Error formatting currency:', error);
      return `${currency} ${value.toFixed(2)}`;
    }
  }, [language]);

  const languageInfo = useMemo(() => LANGUAGES[language], [language]);
  const availableLanguages = useMemo(() => Object.values(LANGUAGES), []);

  const value: LanguageContextType = {
    language,
    languageInfo,
    availableLanguages,
    isLoading,
    detectionResult,
    setLanguage,
    detectLanguage: detectLanguageManually,
    formatNumber,
    formatDate,
    formatCurrency,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Hook for translations
export function useTranslation() {
  const { language } = useLanguage();
  
  // This is a placeholder - in a real app, you'd load translations from files
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    // Simple parameter replacement
    let translated = key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        translated = translated.replace(`{{${paramKey}}}`, String(value));
      });
    }
    
    return translated;
  }, []);
  
  return { t, language };
}

// Hook for plural rules
export function usePlural() {
  const { language } = useLanguage();
  
  const plural = useCallback((count: number, options: {
    zero?: string;
    one: string;
    two?: string;
    few?: string;
    many?: string;
    other: string;
  }): string => {
    const pr = new Intl.PluralRules(language);
    const rule = pr.select(count);
    
    switch (rule) {
      case 'zero':
        return options.zero || options.other;
      case 'one':
        return options.one;
      case 'two':
        return options.two || options.other;
      case 'few':
        return options.few || options.other;
      case 'many':
        return options.many || options.other;
      default:
        return options.other;
    }
  }, [language]);
  
  return plural;
}