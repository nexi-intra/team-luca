'use client';

import React, { useState } from 'react';
import { useFeatureRingContext } from '@/lib/features/context';
import { getAllFeatures, getRingName, getRingDescription, getFeaturesByRing } from '@/lib/features/constants';
import type { FeatureRing } from '@/lib/features/constants';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CheckCircle, Circle, Settings, Sparkles, TestTube, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

const ringColors = {
  1: 'bg-red-500',
  2: 'bg-orange-500', 
  3: 'bg-yellow-500',
  4: 'bg-green-500',
};

const ringIcons = {
  1: TestTube,
  2: Sparkles, 
  3: Zap,
  4: CheckCircle,
};

export default function FeaturesPage() {
  const { userRing, setUserRing, hasAccessToFeature } = useFeatureRingContext();
  const [selectedRing, setSelectedRing] = useState<FeatureRing | 'all'>('all');
  
  const allFeatures = getAllFeatures();
  const filteredFeatures = selectedRing === 'all' ? allFeatures : getFeaturesByRing(selectedRing);
  
  const handleRingChange = (ring: FeatureRing) => {
    setUserRing(ring);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Feature Rings & Access</h1>
        <p className="text-muted-foreground">
          Manage your feature access level and explore available features across different rings.
        </p>
      </div>

      {/* Current Ring Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Your Current Access Level
          </CardTitle>
          <CardDescription>
            Your current ring determines which features you can access
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn("w-4 h-4 rounded-full", ringColors[userRing])}></div>
              <div>
                <p className="font-medium">Ring {userRing} - {getRingName(userRing)}</p>
                <p className="text-sm text-muted-foreground">{getRingDescription(userRing)}</p>
              </div>
            </div>
            <Select value={userRing.toString()} onValueChange={(value) => handleRingChange(parseInt(value) as FeatureRing)}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4].map((ring) => (
                  <SelectItem key={ring} value={ring.toString()}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", ringColors[ring as FeatureRing])}></div>
                      <span>Ring {ring} - {getRingName(ring as FeatureRing)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Ring Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((ring) => {
          const Icon = ringIcons[ring as FeatureRing];
          const hasAccess = userRing <= ring;
          const featuresInRing = getFeaturesByRing(ring as FeatureRing);
          
          return (
            <Card key={ring} className={cn(
              "transition-all",
              hasAccess ? "border-primary/50 bg-primary/5" : "opacity-60"
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-3 h-3 rounded-full", ringColors[ring as FeatureRing])}></div>
                  <CardTitle className="text-sm">Ring {ring}</CardTitle>
                  {hasAccess ? (
                    <CheckCircle className="h-4 w-4 text-green-500 ml-auto" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground ml-auto" />
                  )}
                </div>
                <CardDescription className="text-xs">
                  {getRingName(ring as FeatureRing)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm">{featuresInRing.length} features</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filter */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Available Features</h2>
        <Select value={selectedRing.toString()} onValueChange={(value) => setSelectedRing(value === 'all' ? 'all' : parseInt(value) as FeatureRing)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rings</SelectItem>
            {[1, 2, 3, 4].map((ring) => (
              <SelectItem key={ring} value={ring.toString()}>
                Ring {ring} - {getRingName(ring as FeatureRing)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFeatures.map((feature) => {
          const hasAccess = hasAccessToFeature(feature.id);
          const Icon = ringIcons[feature.ring];
          
          return (
            <Card key={feature.id} className={cn(
              "transition-all",
              hasAccess ? "border-primary/20" : "opacity-60 border-dashed"
            )}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {feature.name}
                      {hasAccess && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <div className={cn("w-2 h-2 rounded-full mr-1", ringColors[feature.ring])}></div>
                        Ring {feature.ring}
                      </Badge>
                      {feature.category && (
                        <Badge variant="secondary" className="text-xs">
                          {feature.category}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    {hasAccess ? 'Available' : `Requires Ring ${feature.ring} or higher`}
                  </div>
                  {!hasAccess && userRing > feature.ring && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRingChange(feature.ring)}
                    >
                      Enable Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredFeatures.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No features found for the selected ring.</p>
        </div>
      )}
    </div>
  );
}