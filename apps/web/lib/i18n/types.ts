export type Language =
  | "en-US"
  | "es-ES"
  | "fr-FR"
  | "de-DE"
  | "it-IT"
  | "pt-BR"
  | "ja-JP"
  | "ko-KR"
  | "zh-CN"
  | "zh-TW";

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  dateFormat: string;
  numberFormat: {
    decimal: string;
    thousands: string;
    currency: string;
  };
}

export interface LanguageDetectionResult {
  detectedLanguage: Language;
  confidence: number;
  source: "browser" | "system" | "geoip" | "user" | "default";
}

export interface LanguageContextType {
  language: Language;
  languageInfo: LanguageInfo;
  availableLanguages: LanguageInfo[];
  isLoading: boolean;
  detectionResult: LanguageDetectionResult | null;
  setLanguage: (language: Language) => void;
  detectLanguage: () => Promise<Language>;
  formatNumber: (value: number, options?: Intl.NumberFormatOptions) => string;
  formatDate: (date: Date, options?: Intl.DateTimeFormatOptions) => string;
  formatCurrency: (value: number, currency?: string) => string;
}

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}

export interface Translations {
  [language: string]: TranslationStrings;
}
