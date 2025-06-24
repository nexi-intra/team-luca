"use client";

import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Circle, Square, Download, Upload } from "lucide-react";
import { DemoStep, DemoScript } from "@/lib/demo/types";
import { generateMarkdownScript } from "@/lib/demo/parser";
import { useDemoContext } from "@/lib/demo/context";

export function DemoRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedSteps, setRecordedSteps] = useState<DemoStep[]>([]);
  const [scriptTitle, setScriptTitle] = useState("");
  const [scriptDescription, setScriptDescription] = useState("");
  const { loadScriptFromMarkdown } = useDemoContext();
  const observerRef = useRef<MutationObserver | null>(null);

  const startRecording = () => {
    setIsRecording(true);
    setRecordedSteps([]);

    // Add click listener
    document.addEventListener("click", handleClick, true);

    // Add input listener
    document.addEventListener("input", handleInput, true);

    // Add navigation listener
    window.addEventListener("popstate", handleNavigation);

    // Create mutation observer for DOM changes
    observerRef.current = new MutationObserver(handleMutation);
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["class", "style"],
    });
  };

  const stopRecording = () => {
    setIsRecording(false);

    // Remove listeners
    document.removeEventListener("click", handleClick, true);
    document.removeEventListener("input", handleInput, true);
    window.removeEventListener("popstate", handleNavigation);

    // Disconnect observer
    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }
  };

  const handleClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    const demoId =
      target.getAttribute("data-demo-id") ||
      target.closest("[data-demo-id]")?.getAttribute("data-demo-id");

    if (demoId && !target.closest("[data-demo-recorder]")) {
      const step: DemoStep = {
        id: `step-${Date.now()}`,
        type: "click",
        target: demoId,
        description: `Click on ${demoId}`,
      };
      setRecordedSteps((prev) => [...prev, step]);
    }
  };

  const handleInput = (event: Event) => {
    const target = event.target as HTMLInputElement;
    const demoId =
      target.getAttribute("data-demo-id") ||
      target.closest("[data-demo-id]")?.getAttribute("data-demo-id");

    if (demoId && !target.closest("[data-demo-recorder]")) {
      const step: DemoStep = {
        id: `step-${Date.now()}`,
        type: "type",
        target: demoId,
        value: target.value,
        description: `Type "${target.value}" in ${demoId}`,
      };

      // Update last step if it's the same target
      setRecordedSteps((prev) => {
        const last = prev[prev.length - 1];
        if (last && last.type === "type" && last.target === demoId) {
          return [...prev.slice(0, -1), step];
        }
        return [...prev, step];
      });
    }
  };

  const handleNavigation = () => {
    const step: DemoStep = {
      id: `step-${Date.now()}`,
      type: "navigate",
      value: window.location.pathname,
      description: `Navigate to ${window.location.pathname}`,
    };
    setRecordedSteps((prev) => [...prev, step]);
  };

  const handleMutation = (_mutations: MutationRecord[]) => {
    // Could be used to detect dynamic content changes
  };

  const saveScript = () => {
    const script: DemoScript = {
      id: scriptTitle.toLowerCase().replace(/\s+/g, "-"),
      title: scriptTitle,
      description: scriptDescription,
      steps: recordedSteps,
      metadata: {
        author: "Recorded",
        version: "1.0.0",
        tags: ["recorded"],
      },
    };

    const markdown = generateMarkdownScript(script);

    // Download as file
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadInPlayer = () => {
    const script: DemoScript = {
      id: scriptTitle.toLowerCase().replace(/\s+/g, "-"),
      title: scriptTitle,
      description: scriptDescription,
      steps: recordedSteps,
      metadata: {
        author: "Recorded",
        version: "1.0.0",
        tags: ["recorded"],
      },
    };

    const markdown = generateMarkdownScript(script);
    loadScriptFromMarkdown(markdown);
  };

  return (
    <Card className="w-full max-w-2xl" data-demo-recorder>
      <CardHeader>
        <CardTitle>Demo Recorder</CardTitle>
        <CardDescription>
          Record user interactions to create demo scripts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Script Title</Label>
          <Input
            id="title"
            value={scriptTitle}
            onChange={(e) => setScriptTitle(e.target.value)}
            placeholder="Enter demo title"
            disabled={isRecording}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={scriptDescription}
            onChange={(e) => setScriptDescription(e.target.value)}
            placeholder="Describe what this demo shows"
            disabled={isRecording}
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          {!isRecording ? (
            <Button onClick={startRecording} className="flex-1">
              <Circle className="h-4 w-4 mr-2" />
              Start Recording
            </Button>
          ) : (
            <Button
              onClick={stopRecording}
              variant="destructive"
              className="flex-1"
            >
              <Square className="h-4 w-4 mr-2" />
              Stop Recording
            </Button>
          )}
        </div>

        {recordedSteps.length > 0 && (
          <>
            <div className="space-y-2">
              <Label>Recorded Steps ({recordedSteps.length})</Label>
              <div className="max-h-48 overflow-y-auto space-y-1 p-2 border rounded">
                {recordedSteps.map((step, index) => (
                  <div key={step.id} className="text-sm p-2 bg-muted rounded">
                    <span className="font-mono text-xs">
                      {index + 1}. {step.type.toUpperCase()}
                    </span>
                    {step.target && <span className="ml-2">{step.target}</span>}
                    {step.value && (
                      <span className="ml-2 text-muted-foreground">
                        &quot;{step.value}&quot;
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={saveScript}
                variant="outline"
                disabled={!scriptTitle}
              >
                <Download className="h-4 w-4 mr-2" />
                Save Script
              </Button>
              <Button
                onClick={loadInPlayer}
                variant="outline"
                disabled={!scriptTitle}
              >
                <Upload className="h-4 w-4 mr-2" />
                Load in Player
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
