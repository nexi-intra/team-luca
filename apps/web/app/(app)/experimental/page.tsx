import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FlaskConical, Terminal } from "lucide-react";
import Link from "next/link";

export default function ExperimentalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Experimental Features</h1>
        <p className="text-muted-foreground mt-2">
          Explore cutting-edge features that are still in development. These
          features may change or be removed in future versions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              PowerShell Scripts
            </CardTitle>
            <CardDescription>
              Run and manage PowerShell scripts with real-time output streaming
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Execute PowerShell commands, view process output, and manage
              running scripts through an interactive terminal interface.
            </p>
            <Button asChild>
              <Link href="/scripts">Open Script Manager</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 p-4">
        <div className="flex items-center gap-2">
          <FlaskConical className="h-5 w-5 text-yellow-600 dark:text-yellow-500" />
          <h3 className="font-medium text-yellow-900 dark:text-yellow-100">
            Experimental Notice
          </h3>
        </div>
        <p className="mt-2 text-sm text-yellow-800 dark:text-yellow-200">
          These features are experimental and may contain bugs or undergo
          significant changes. Use with caution in production environments.
        </p>
      </div>
    </div>
  );
}
