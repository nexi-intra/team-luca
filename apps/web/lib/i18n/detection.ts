import { Language, LanguageDetectionResult } from "./types";
import { BROWSER_LANGUAGE_MAP, DEFAULT_LANGUAGE } from "./languages";

export async function detectLanguageFromBrowser(): Promise<LanguageDetectionResult> {
  if (typeof window === "undefined") {
    return {
      detectedLanguage: DEFAULT_LANGUAGE,
      confidence: 0,
      source: "default",
    };
  }

  // Check navigator.language first
  const browserLang = navigator.language;
  const mappedLang = BROWSER_LANGUAGE_MAP[browserLang];

  if (mappedLang) {
    return {
      detectedLanguage: mappedLang,
      confidence: 0.9,
      source: "browser",
    };
  }

  // Check navigator.languages array
  if (navigator.languages && navigator.languages.length > 0) {
    for (const lang of navigator.languages) {
      const mapped = BROWSER_LANGUAGE_MAP[lang];
      if (mapped) {
        return {
          detectedLanguage: mapped,
          confidence: 0.8,
          source: "browser",
        };
      }
    }
  }

  // Try to extract language from the browser language
  const langCode = browserLang.split("-")[0];
  const fallbackLang = BROWSER_LANGUAGE_MAP[langCode];

  if (fallbackLang) {
    return {
      detectedLanguage: fallbackLang,
      confidence: 0.7,
      source: "browser",
    };
  }

  return {
    detectedLanguage: DEFAULT_LANGUAGE,
    confidence: 0.1,
    source: "default",
  };
}

export async function detectLanguageFromSystem(): Promise<LanguageDetectionResult> {
  // In a browser environment, we can't access system language directly
  // This would be more relevant in an Electron app or with a native bridge
  try {
    if (typeof window !== "undefined" && "Intl" in window) {
      const locale = Intl.DateTimeFormat().resolvedOptions().locale;
      const mappedLang = BROWSER_LANGUAGE_MAP[locale];

      if (mappedLang) {
        return {
          detectedLanguage: mappedLang,
          confidence: 0.85,
          source: "system",
        };
      }
    }
  } catch (error) {
    console.error("Error detecting system language:", error);
  }

  return {
    detectedLanguage: DEFAULT_LANGUAGE,
    confidence: 0,
    source: "default",
  };
}

export async function detectLanguageFromGeoIP(): Promise<LanguageDetectionResult> {
  try {
    // Using a free IP geolocation API
    const response = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });

    if (!response.ok) {
      throw new Error("Failed to fetch geo data");
    }

    const data = await response.json();
    const countryCode = data.country_code;

    // Map country codes to languages
    const countryLanguageMap: Record<string, Language> = {
      US: "en-US",
      GB: "en-US",
      CA: "en-US",
      AU: "en-US",
      ES: "es-ES",
      MX: "es-ES",
      AR: "es-ES",
      FR: "fr-FR",
      DE: "de-DE",
      AT: "de-DE",
      CH: "de-DE",
      IT: "it-IT",
      BR: "pt-BR",
      PT: "pt-BR",
      JP: "ja-JP",
      KR: "ko-KR",
      CN: "zh-CN",
      TW: "zh-TW",
      HK: "zh-TW",
    };

    const detectedLang = countryLanguageMap[countryCode];

    if (detectedLang) {
      return {
        detectedLanguage: detectedLang,
        confidence: 0.6,
        source: "geoip",
      };
    }
  } catch (error) {
    console.error("Error detecting language from GeoIP:", error);
  }

  return {
    detectedLanguage: DEFAULT_LANGUAGE,
    confidence: 0,
    source: "default",
  };
}

export async function detectLanguageFromStorage(): Promise<LanguageDetectionResult | null> {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const savedLang = localStorage.getItem("user-language");
    if (savedLang && BROWSER_LANGUAGE_MAP[savedLang]) {
      return {
        detectedLanguage: savedLang as Language,
        confidence: 1.0,
        source: "user",
      };
    }
  } catch (error) {
    console.error("Error reading language from storage:", error);
  }

  return null;
}

export async function detectLanguage(): Promise<LanguageDetectionResult> {
  // First check if user has a saved preference
  const savedResult = await detectLanguageFromStorage();
  if (savedResult) {
    return savedResult;
  }

  // Try different detection methods in order of reliability
  const detectionMethods = [
    detectLanguageFromBrowser,
    detectLanguageFromSystem,
    detectLanguageFromGeoIP,
  ];

  let bestResult: LanguageDetectionResult = {
    detectedLanguage: DEFAULT_LANGUAGE,
    confidence: 0,
    source: "default",
  };

  for (const method of detectionMethods) {
    try {
      const result = await method();
      if (result.confidence > bestResult.confidence) {
        bestResult = result;
      }

      // If we have high confidence, no need to try other methods
      if (result.confidence >= 0.9) {
        break;
      }
    } catch (error) {
      console.error("Language detection method failed:", error);
    }
  }

  return bestResult;
}
