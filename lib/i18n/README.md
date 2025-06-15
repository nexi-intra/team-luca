# Language Context Provider

A comprehensive internationalization (i18n) solution with automatic language detection, formatting utilities, and translation support.

## Features

- 🌍 **Automatic Language Detection**
  - Browser language preference
  - System locale detection
  - GeoIP-based detection
  - Saved user preferences

- 🔤 **Multiple Language Support**
  - English (US)
  - Spanish (Spain)
  - French (France)
  - German (Germany)
  - Italian (Italy)
  - Portuguese (Brazil)
  - Japanese
  - Korean
  - Chinese (Simplified & Traditional)

- 📝 **Formatting Utilities**
  - Number formatting
  - Date/time formatting
  - Currency formatting
  - Plural rules

- ♿ **Accessibility**
  - Language change announcements
  - Proper lang attributes
  - RTL support ready

## Usage

### Basic Setup

The `LanguageProvider` is already integrated into the app's providers:

```tsx
import { LanguageProvider } from '@/lib/i18n';

<LanguageProvider>
  {children}
</LanguageProvider>
```

### Using the Language Hook

```tsx
import { useLanguage } from '@/lib/i18n';

function MyComponent() {
  const {
    language,           // Current language code (e.g., 'en-US')
    languageInfo,       // Full language information
    availableLanguages, // List of all supported languages
    setLanguage,        // Change language
    formatNumber,       // Format numbers
    formatDate,         // Format dates
    formatCurrency,     // Format currency
  } = useLanguage();

  return (
    <div>
      <p>Current language: {languageInfo.nativeName}</p>
      <p>Number: {formatNumber(1234.56)}</p>
      <p>Date: {formatDate(new Date())}</p>
      <p>Price: {formatCurrency(99.99, 'USD')}</p>
    </div>
  );
}
```

### Language Selector Component

```tsx
import { LanguageSelector } from '@/components/language-selector';

// Full selector with dropdown
<LanguageSelector />

// Compact version
<LanguageSelector 
  variant="ghost" 
  size="sm"
  showName={false}
/>

// Mobile-friendly select element
<LanguageSelectorCompact />
```

### Translation Hook

```tsx
import { useTranslation } from '@/lib/i18n';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <p>{t('Welcome {{name}}, you have {{count}} messages', {
      name: 'John',
      count: 5
    })}</p>
  );
}
```

### Plural Rules

```tsx
import { usePlural } from '@/lib/i18n';

function ItemCount({ count }: { count: number }) {
  const plural = usePlural();

  return (
    <p>{plural(count, {
      zero: 'No items',
      one: 'One item',
      other: `${count} items`
    })}</p>
  );
}
```

## Language Detection

The system uses multiple detection methods in priority order:

1. **User Preference** (localStorage) - Confidence: 100%
2. **Browser Language** (navigator.language) - Confidence: 90%
3. **System Locale** (Intl API) - Confidence: 85%
4. **GeoIP Location** - Confidence: 60%
5. **Default** (en-US) - Confidence: 10%

## Adding New Languages

1. Add the language to the `Language` type in `types.ts`
2. Add language info to `LANGUAGES` in `languages.ts`
3. Add browser language mappings to `BROWSER_LANGUAGE_MAP`
4. Add country mappings for GeoIP detection

## Formatting Examples

### Numbers
```tsx
formatNumber(1234567.89)
// en-US: "1,234,567.89"
// de-DE: "1.234.567,89"
// fr-FR: "1 234 567,89"

formatNumber(0.123, { style: 'percent' })
// en-US: "12.3%"

formatNumber(1234567, { notation: 'compact' })
// en-US: "1.2M"
```

### Dates
```tsx
formatDate(new Date(), { dateStyle: 'full' })
// en-US: "Monday, January 15, 2024"
// es-ES: "lunes, 15 de enero de 2024"

formatDate(new Date(), { dateStyle: 'short' })
// en-US: "1/15/24"
// de-DE: "15.01.24"
```

### Currency
```tsx
formatCurrency(99.99, 'USD')
// en-US: "$99.99"
// de-DE: "99,99 $"

formatCurrency(99.99, 'EUR')
// en-US: "€99.99"
// de-DE: "99,99 €"
```

## Best Practices

1. Always use the formatting functions instead of manual formatting
2. Let the system auto-detect language on first visit
3. Respect user's language preference once set
4. Use semantic keys for translations
5. Consider plural rules for different languages
6. Test with different locales and number formats

## Future Enhancements

- [ ] Load translations from JSON files
- [ ] Lazy load language-specific data
- [ ] Add more languages
- [ ] Support for custom date/time formats
- [ ] Number input localization
- [ ] RTL layout support
- [ ] Language-specific fonts