import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { X, Play, FileCode, Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Script {
  id: string;
  name: string;
  description: string;
  folder: string;
  path: string;
  parameters?: Array<{
    name: string;
    type: string;
    description?: string;
    required?: boolean;
    default?: any;
  }>;
}

interface ScriptRunnerProps {
  script: Script;
  onRun: (scriptId: string, parameters: Record<string, any>) => void;
  onClose: () => void;
}

export function ScriptRunner({ script, onRun, onClose }: ScriptRunnerProps) {
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateAndRun = () => {
    const newErrors: Record<string, string> = {};

    // Validate required parameters
    script.parameters?.forEach((param) => {
      if (param.required && !parameters[param.name]) {
        newErrors[param.name] = `${param.name} is required`;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onRun(script.path, parameters);
  };

  const updateParameter = (name: string, value: any) => {
    setParameters((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-5 w-5" />
            <CardTitle>{script.name}.ps1</CardTitle>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>{script.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {script.parameters && script.parameters.length > 0 ? (
          <>
            <div className="space-y-4">
              {script.parameters.map((param) => (
                <div key={param.name} className="space-y-2">
                  <Label htmlFor={param.name}>
                    {param.name}
                    {param.required && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </Label>

                  {param.description && (
                    <p className="text-sm text-muted-foreground">
                      {param.description}
                    </p>
                  )}

                  {param.type === "boolean" ? (
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={param.name}
                        checked={parameters[param.name] || false}
                        onCheckedChange={(checked) =>
                          updateParameter(param.name, checked)
                        }
                      />
                      <Label htmlFor={param.name} className="font-normal">
                        {parameters[param.name] ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  ) : param.type === "number" ? (
                    <Input
                      id={param.name}
                      type="number"
                      value={parameters[param.name] || ""}
                      onChange={(e) =>
                        updateParameter(
                          param.name,
                          e.target.value ? Number(e.target.value) : undefined,
                        )
                      }
                      placeholder={
                        param.default
                          ? `Default: ${param.default}`
                          : "Enter value"
                      }
                    />
                  ) : (
                    <Input
                      id={param.name}
                      type="text"
                      value={parameters[param.name] || ""}
                      onChange={(e) =>
                        updateParameter(param.name, e.target.value)
                      }
                      placeholder={
                        param.default
                          ? `Default: ${param.default}`
                          : "Enter value"
                      }
                    />
                  )}

                  {errors[param.name] && (
                    <p className="text-sm text-red-500">{errors[param.name]}</p>
                  )}
                </div>
              ))}
            </div>

            {Object.keys(errors).length > 0 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Please fill in all required parameters before running the
                  script.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              This script doesn&apos;t require any parameters.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={validateAndRun}>
            <Play className="h-4 w-4 mr-2" />
            Run Script
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
