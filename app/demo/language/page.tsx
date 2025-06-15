'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LanguageSelector } from '@/components/language-selector';
import { useLanguage, useTranslation, usePlural } from '@/lib/i18n';
import { Calendar, DollarSign, Hash, Globe2 } from 'lucide-react';

export default function LanguageDemoPage() {
  const { language, languageInfo, detectionResult, formatNumber, formatDate, formatCurrency } = useLanguage();
  const { t } = useTranslation();
  const plural = usePlural();
  
  const sampleDate = new Date();
  const sampleNumber = 1234567.89;
  const sampleCurrency = 999.99;
  const itemCounts = [0, 1, 2, 5, 21, 100];

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-4xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Language & Internationalization Demo</h1>
        <p className="text-muted-foreground">
          Explore automatic language detection and formatting capabilities
        </p>
      </div>

      {/* Language Selector */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Current Language</h2>
          <p className="text-sm text-muted-foreground">
            Select a language to see formatting changes
          </p>
        </div>
        <LanguageSelector />
      </div>

      {/* Detection Info */}
      {detectionResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe2 className="h-5 w-5" />
              Language Detection
            </CardTitle>
            <CardDescription>
              How we determined your language preference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Detected Language:</span>
              <Badge variant="secondary">{languageInfo.name}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Detection Source:</span>
              <Badge variant="outline">{detectionResult.source}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Confidence:</span>
              <div className="flex items-center gap-2">
                <div className="w-24 bg-secondary rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${detectionResult.confidence * 100}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {Math.round(detectionResult.confidence * 100)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Language Info */}
      <Card>
        <CardHeader>
          <CardTitle>Language Information</CardTitle>
          <CardDescription>
            Details about the selected language
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Language Code:</span>
              <span className="font-mono text-sm">{languageInfo.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Native Name:</span>
              <span className="font-medium">{languageInfo.nativeName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Direction:</span>
              <Badge variant="outline">{languageInfo.dir.toUpperCase()}</Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Date Format:</span>
              <span className="font-mono text-sm">{languageInfo.dateFormat}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Decimal Sep:</span>
              <span className="font-mono text-sm">{languageInfo.numberFormat.decimal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Thousands Sep:</span>
              <span className="font-mono text-sm">&quot;{languageInfo.numberFormat.thousands}&quot;</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formatting Examples */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Number Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Standard:</p>
              <p className="text-lg font-mono">{formatNumber(sampleNumber)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Compact:</p>
              <p className="text-lg font-mono">
                {formatNumber(sampleNumber, { notation: 'compact' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Percent:</p>
              <p className="text-lg font-mono">
                {formatNumber(0.1234, { style: 'percent', minimumFractionDigits: 2 })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Short:</p>
              <p className="text-lg font-mono">
                {formatDate(sampleDate, { dateStyle: 'short' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Medium:</p>
              <p className="text-lg font-mono">
                {formatDate(sampleDate, { dateStyle: 'medium' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full:</p>
              <p className="text-lg font-mono">
                {formatDate(sampleDate, { dateStyle: 'full' })}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Currency Formatting
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">USD:</p>
              <p className="text-lg font-mono">{formatCurrency(sampleCurrency, 'USD')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">EUR:</p>
              <p className="text-lg font-mono">{formatCurrency(sampleCurrency, 'EUR')}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">JPY:</p>
              <p className="text-lg font-mono">{formatCurrency(sampleCurrency, 'JPY')}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plural Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Plural Rules</CardTitle>
          <CardDescription>
            How plural forms work in {languageInfo.nativeName}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {itemCounts.map((count) => (
              <div key={count} className="flex items-center justify-between p-2 rounded-lg bg-secondary/50">
                <span className="font-mono text-sm">{count}</span>
                <span className="text-sm">
                  {plural(count, {
                    zero: 'No items',
                    one: 'One item',
                    two: 'Two items',
                    few: 'A few items',
                    many: 'Many items',
                    other: `${count} items`,
                  })}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Translation Example */}
      <Card>
        <CardHeader>
          <CardTitle>Translation Support</CardTitle>
          <CardDescription>
            Example of how translations would work (placeholder implementation)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Template String:</p>
            <p className="font-mono text-sm">
              {t('Welcome {{name}}, you have {{count}} new messages', { name: 'John', count: 5 })}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            In a production app, this would load translated strings from language files.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}