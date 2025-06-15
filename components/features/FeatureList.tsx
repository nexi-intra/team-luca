'use client';

import { useFeatures } from '@/hooks/useFeatureAccess';
import { getRingName, getAllFeatures } from '@/lib/features/constants';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function FeatureList() {
  const { features, hasAccess } = useFeatures();
  const allFeatures = getAllFeatures();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Available Features</h3>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allFeatures.map(feature => {
          const isAccessible = hasAccess(feature.id);
          return (
            <Card key={feature.id} className={isAccessible ? '' : 'opacity-50'}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{feature.name}</CardTitle>
                  <Badge variant={isAccessible ? 'default' : 'secondary'}>
                    {getRingName(feature.ring)}
                  </Badge>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {isAccessible ? (
                    <span className="text-green-600">✓ Available</span>
                  ) : (
                    <span className="text-muted-foreground">Requires Ring {feature.ring}</span>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}