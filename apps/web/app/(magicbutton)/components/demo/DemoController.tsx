'use client';

import React from 'react';
import { useDemoContext } from '@/lib/demo/context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Square, SkipForward, SkipBack, ChevronRight, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function DemoController() {
  const {
    isPlaying,
    isPaused,
    currentScript,
    currentStepIndex,
    scripts,
    speed,
    error,
    play,
    pause,
    stop,
    nextStep,
    previousStep,
    goToStep,
    setSpeed,
    loadScript
  } = useDemoContext();

  const progress = currentScript 
    ? ((currentStepIndex + 1) / currentScript.steps.length) * 100 
    : 0;

  const currentStep = currentScript?.steps[currentStepIndex];

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Demo Controller</span>
          {currentScript && (
            <Badge variant="outline">
              Step {currentStepIndex + 1} of {currentScript.steps.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Script Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Demo</label>
          <Select 
            value={currentScript?.id} 
            onValueChange={loadScript}
            disabled={isPlaying}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a demo script" />
            </SelectTrigger>
            <SelectContent>
              {scripts.map(script => (
                <SelectItem key={script.id} value={script.id}>
                  {script.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {currentScript && (
          <>
            {/* Script Info */}
            <div className="space-y-1">
              <h4 className="text-sm font-medium">{currentScript.title}</h4>
              <p className="text-sm text-muted-foreground">{currentScript.description}</p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Current Step */}
            {currentStep && (
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {currentStep.type.toUpperCase()}
                  </Badge>
                  {currentStep.target && (
                    <span className="text-sm font-mono">{currentStep.target}</span>
                  )}
                </div>
                {currentStep.description && (
                  <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                )}
              </div>
            )}

            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={previousStep}
                disabled={isPlaying || currentStepIndex === 0}
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() => goToStep(currentStepIndex - 1)}
                disabled={isPlaying || currentStepIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {!isPlaying && !isPaused ? (
                <Button onClick={play} className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Play Demo
                </Button>
              ) : isPlaying ? (
                <Button onClick={pause} variant="secondary" className="flex-1">
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              ) : (
                <Button onClick={play} variant="secondary" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}

              <Button
                size="icon"
                variant="outline"
                onClick={stop}
                disabled={!isPlaying && !isPaused}
              >
                <Square className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={() => goToStep(currentStepIndex + 1)}
                disabled={isPlaying || currentStepIndex >= currentScript.steps.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                size="icon"
                variant="outline"
                onClick={nextStep}
                disabled={isPlaying || currentStepIndex >= currentScript.steps.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>

            {/* Speed Control */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Playback Speed</label>
                <span className="text-sm text-muted-foreground">{speed}x</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value ?? 1)}
                min={0.5}
                max={5}
                step={0.5}
                disabled={isPlaying}
              />
            </div>
          </>
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}