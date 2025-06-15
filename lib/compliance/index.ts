export interface ComplianceConfig {
  gdpr: {
    enabled: boolean;
    privacyPolicyUrl: string;
    dataProcessingAgreementUrl?: string;
  };
  ccpa: {
    enabled: boolean;
    doNotSellUrl?: string;
  };
  accessibility: {
    wcagLevel: 'A' | 'AA' | 'AAA';
    skipLinks: boolean;
    highContrastMode: boolean;
  };
  security: {
    forceHttps: boolean;
    cspEnabled: boolean;
    rateLimiting: boolean;
    auditLogging: boolean;
  };
  dataResidency: {
    allowedRegions: string[];
    blockRestrictedCountries: boolean;
  };
}

export const defaultComplianceConfig: ComplianceConfig = {
  gdpr: {
    enabled: true,
    privacyPolicyUrl: '/privacy',
  },
  ccpa: {
    enabled: true,
    doNotSellUrl: '/privacy#do-not-sell',
  },
  accessibility: {
    wcagLevel: 'AA',
    skipLinks: true,
    highContrastMode: true,
  },
  security: {
    forceHttps: true,
    cspEnabled: true,
    rateLimiting: true,
    auditLogging: true,
  },
  dataResidency: {
    allowedRegions: ['us', 'eu', 'ca'],
    blockRestrictedCountries: true,
  },
};

// Determine user's jurisdiction based on various signals
export function getUserJurisdiction(request: Request): string {
  // Check CloudFlare CF-IPCountry header
  const country = request.headers.get('cf-ipcountry');
  if (country) return country.toLowerCase();

  // Check Accept-Language header
  const language = request.headers.get('accept-language');
  if (language) {
    const locale = language.split(',')[0].split('-')[1];
    if (locale) return locale.toLowerCase();
  }

  // Default to US
  return 'us';
}

// Check if GDPR applies to user
export function isGdprApplicable(jurisdiction: string): boolean {
  const gdprCountries = [
    'at', 'be', 'bg', 'hr', 'cy', 'cz', 'dk', 'ee', 'fi', 'fr',
    'de', 'gr', 'hu', 'ie', 'it', 'lv', 'lt', 'lu', 'mt', 'nl',
    'pl', 'pt', 'ro', 'sk', 'si', 'es', 'se', // EU countries
    'is', 'li', 'no', // EEA countries
    'gb', // UK has UK GDPR
  ];
  return gdprCountries.includes(jurisdiction);
}

// Check if CCPA applies to user
export function isCcpaApplicable(jurisdiction: string): boolean {
  return jurisdiction === 'ca' || jurisdiction === 'us-ca';
}

// Generate privacy rights based on jurisdiction
export interface PrivacyRights {
  access: boolean;
  rectification: boolean;
  erasure: boolean;
  portability: boolean;
  restriction: boolean;
  objection: boolean;
  automatedDecisionMaking: boolean;
  doNotSell: boolean;
}

export function getUserPrivacyRights(jurisdiction: string): PrivacyRights {
  const baseRights: PrivacyRights = {
    access: true,
    rectification: true,
    erasure: false,
    portability: false,
    restriction: false,
    objection: false,
    automatedDecisionMaking: false,
    doNotSell: false,
  };

  if (isGdprApplicable(jurisdiction)) {
    return {
      ...baseRights,
      erasure: true,
      portability: true,
      restriction: true,
      objection: true,
      automatedDecisionMaking: true,
    };
  }

  if (isCcpaApplicable(jurisdiction)) {
    return {
      ...baseRights,
      erasure: true,
      doNotSell: true,
    };
  }

  return baseRights;
}