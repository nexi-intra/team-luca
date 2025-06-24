/**
 * Breadcrumb navigation types
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface BreadcrumbContextType {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  addBreadcrumb: (breadcrumb: BreadcrumbItem) => void;
  removeBreadcrumb: (index: number) => void;
}

export interface RouteMetadata {
  route: string;
  breadcrumbs: BreadcrumbItem[];
}

/**
 * Command palette types
 */
export type CommandCategory =
  | "navigation"
  | "actions"
  | "search"
  | "help"
  | "theme"
  | "language"
  | "accessibility"
  | "debug";

export interface CommandAction {
  id: string;
  name: string;
  shortcut?: string[];
  category: CommandCategory;
  icon?: React.ComponentType<{ className?: string }>;
  handler: () => void | Promise<void>;
  keywords?: string[];
  featureRing?: number;
}

export interface CommandPaletteContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  commands: CommandAction[];
  registerCommand: (command: CommandAction) => void;
  unregisterCommand: (id: string) => void;
  executeCommand: (id: string) => void;
}

/**
 * Language and internationalization types
 */
export type Language =
  | "en"
  | "es"
  | "fr"
  | "de"
  | "it"
  | "pt"
  | "zh"
  | "ja"
  | "ko"
  | "ar"
  | "hi"
  | "ru"
  | "nl"
  | "sv"
  | "no"
  | "da"
  | "fi"
  | "pl"
  | "tr"
  | "cs"
  | "hu"
  | "ro"
  | "bg"
  | "hr"
  | "sr"
  | "sk"
  | "sl"
  | "et"
  | "lv"
  | "lt"
  | "is"
  | "mt"
  | "ga"
  | "cy"
  | "eu"
  | "ca"
  | "gl"
  | "uk"
  | "be"
  | "kk"
  | "uz"
  | "ky"
  | "tg"
  | "mn"
  | "ne"
  | "si"
  | "my"
  | "km"
  | "lo"
  | "vi"
  | "id"
  | "ms"
  | "th"
  | "fil"
  | "sw"
  | "am"
  | "ha"
  | "yo"
  | "ig"
  | "zu"
  | "xh"
  | "af"
  | "st"
  | "tn"
  | "ny";

export interface LanguageInfo {
  code: Language;
  name: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  enabled: boolean;
}

export interface LanguageDetectionResult {
  detectedLanguage: Language;
  confidence: number;
  source: "browser" | "user" | "default";
}

export interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: LanguageInfo[];
  detectLanguage: () => LanguageDetectionResult;
  t: (key: string, params?: Record<string, string>) => string;
}

export interface TranslationStrings {
  [key: string]: string | TranslationStrings;
}

export interface Translations {
  [language: string]: TranslationStrings;
}

/**
 * Accessibility types
 */
export interface AccessibilityContextType {
  reducedMotion: boolean;
  setReducedMotion: (value: boolean) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  fontSize: "small" | "medium" | "large" | "extra-large";
  setFontSize: (size: "small" | "medium" | "large" | "extra-large") => void;
  keyboardNavigation: boolean;
  setKeyboardNavigation: (value: boolean) => void;
  screenReaderMode: boolean;
  setScreenReaderMode: (value: boolean) => void;
}

export interface AnnounceContextType {
  announce: (message: string, priority?: "polite" | "assertive") => void;
  clear: () => void;
}

/**
 * Theme types
 */
export type Theme = "light" | "dark" | "system";

/**
 * Cookie consent types
 */
export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export interface CookieConsentProps {
  onAccept: (preferences: CookiePreferences) => void;
  onDecline: () => void;
}

/**
 * User interface types
 */
export interface UserLike {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

export interface UserAvatarProps {
  user: UserLike;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * White-label configuration types
 */
export interface WhitelabelConfig {
  name: string;
  company: string;
  logo: {
    light: string;
    dark: string;
    width: number;
    height: number;
  };
  favicon: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  legal: {
    privacyUrl?: string;
    termsUrl?: string;
    cookiePolicyUrl?: string;
  };
  support: {
    email?: string;
    phone?: string;
    documentationUrl?: string;
  };
}

export interface WhitelabelContextType {
  config: WhitelabelConfig;
}

/**
 * Component positioning types
 */
export type Position =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right";

/**
 * Focus management types
 */
export interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string;
}
