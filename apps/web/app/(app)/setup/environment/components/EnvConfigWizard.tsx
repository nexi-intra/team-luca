"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  FileText,
} from "lucide-react";
import { EnvCheckResult } from "@/lib/setup/types";
import { toast } from "sonner";

export function EnvConfigWizard() {
  const [envStatus, setEnvStatus] = useState<EnvCheckResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [generatingTemplate, setGeneratingTemplate] = useState(false);

  useEffect(() => {
    loadEnvironment();
  }, []);

  const loadEnvironment = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/setup/check-env");

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to check environment");
      }

      const result: EnvCheckResult = await response.json();
      setEnvStatus(result);

      // Initialize values with current values
      const initialValues: Record<string, string> = {};
      result.variables.forEach((v) => {
        if (v.currentValue) {
          initialValues[v.key] = v.currentValue;
        }
      });
      setValues(initialValues);
    } catch (error: any) {
      console.error("Failed to check environment:", error);
      toast.error(
        "Failed to check environment: " + (error?.message || String(error)),
      );
      // Set a default state to prevent complete failure
      setEnvStatus({
        isDevMode: false,
        envFile: null,
        variables: [],
        canWrite: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string) => {
    setSaving({ ...saving, [key]: true });
    try {
      const response = await fetch("/api/setup/update-env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message);
        await loadEnvironment();
      } else {
        toast.error(result.message || result.error || "Failed to save");
      }
    } catch (error: any) {
      toast.error("Failed to save: " + (error?.message || String(error)));
    } finally {
      setSaving({ ...saving, [key]: false });
    }
  };

  const generateTemplate = async () => {
    try {
      setGeneratingTemplate(true);
      const response = await fetch("/api/setup/generate-template");

      const result = await response.json();

      if (response.ok && result.success) {
        toast.success(result.message || "Template file generated successfully");
      } else {
        toast.error(result.message || "Failed to generate template file");
      }
    } catch (error: any) {
      console.error("Generate template error:", error);
      toast.error(
        "Failed to generate template: " + (error?.message || String(error)),
      );
    } finally {
      setGeneratingTemplate(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!envStatus) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load environment configuration
        </AlertDescription>
      </Alert>
    );
  }

  const categories = ["auth", "api", "general", "telemetry"] as const;
  const categoryLabels = {
    auth: "Authentication",
    api: "API Keys",
    general: "General",
    telemetry: "Telemetry (Optional)",
  };

  const getVariablesByCategory = (category: string) =>
    envStatus.variables.filter((v) => v.category === category);

  const getStatusCounts = () => {
    const counts = { valid: 0, invalid: 0, missing: 0 };
    envStatus.variables.forEach((v) => {
      if (v.required && !v.currentValue) {
        counts.missing++;
      } else if (!v.isValid) {
        counts.invalid++;
      } else {
        counts.valid++;
      }
    });
    return counts;
  };

  const counts = getStatusCounts();
  const allValid = counts.invalid === 0 && counts.missing === 0;

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>
                Configure your application environment variables
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={generateTemplate}
                disabled={generatingTemplate}
              >
                {generatingTemplate ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Generate Template
              </Button>
              <Button variant="outline" size="sm" onClick={loadEnvironment}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Environment File Status */}
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Environment File:</span>
            </div>
            <Badge variant={envStatus.envFile ? "secondary" : "outline"}>
              {envStatus.envFile || "Not found - will create .env.local"}
            </Badge>
          </div>

          {/* Status Counters */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium">{counts.valid} Valid</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-sm font-medium">
                {counts.invalid} Invalid
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              <span className="text-sm font-medium">
                {counts.missing} Missing
              </span>
            </div>
            {allValid && (
              <Badge variant="default" className="ml-auto">
                All Required Variables Set
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configuration Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="auth">
            <TabsList className="grid w-full grid-cols-4">
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {categoryLabels[category]}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent
                key={category}
                value={category}
                className="space-y-4 mt-6"
              >
                {getVariablesByCategory(category).map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <Label
                          htmlFor={variable.key}
                          className="flex items-center gap-2"
                        >
                          {variable.key}
                          {variable.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                          {!variable.isValid && (
                            <Badge variant="destructive" className="text-xs">
                              Invalid
                            </Badge>
                          )}
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          {variable.description}
                        </p>
                        {variable.example && (
                          <p className="text-xs text-muted-foreground">
                            Example:{" "}
                            <code className="bg-muted px-1 py-0.5 rounded">
                              {variable.example}
                            </code>
                          </p>
                        )}
                        {variable.error && (
                          <p className="text-xs text-red-500">
                            {variable.error}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          id={variable.key}
                          type={
                            showSecrets[variable.key]
                              ? "text"
                              : variable.key.includes("SECRET") ||
                                  variable.key.includes("KEY")
                                ? "password"
                                : "text"
                          }
                          value={values[variable.key] || ""}
                          onChange={(e) =>
                            setValues({
                              ...values,
                              [variable.key]: e.target.value,
                            })
                          }
                          placeholder={
                            variable.currentValue ? "Value is set" : "Not set"
                          }
                          className={!variable.isValid ? "border-red-500" : ""}
                        />
                        {(variable.key.includes("SECRET") ||
                          variable.key.includes("KEY")) && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
                            onClick={() =>
                              setShowSecrets({
                                ...showSecrets,
                                [variable.key]: !showSecrets[variable.key],
                              })
                            }
                          >
                            {showSecrets[variable.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() =>
                          handleSave(variable.key, values[variable.key] || "")
                        }
                        disabled={saving[variable.key] || !values[variable.key]}
                      >
                        {saving[variable.key] ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Note:</strong> After updating environment variables,
          you&apos;ll need to restart your development server for changes to
          take effect.
        </AlertDescription>
      </Alert>
    </div>
  );
}
