"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RingGate } from "@/components/features/RingGate";
import { Terminal, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export const dynamic = "force-dynamic";

export default function SystemConsolePage() {
  return (
    <RingGate requiredRing={1}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Terminal className="h-8 w-8 text-[#233862]" />
            <h1 className="text-3xl font-bold">System Console</h1>
          </div>

          <Alert className="mb-6 border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Ring 1 Access Only:</strong> This area contains sensitive
              system controls and is restricted to super administrators.
            </AlertDescription>
          </Alert>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Protected System Area
              </CardTitle>
              <CardDescription>
                Direct system access and administrative controls
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm">
                <p>$ system status</p>
                <p className="mt-2">System Status: OPERATIONAL</p>
                <p>Uptime: 42 days, 3 hours, 27 minutes</p>
                <p>Memory Usage: 67%</p>
                <p>CPU Load: 23%</p>
                <p>Active Connections: 1,234</p>
                <p className="mt-2 text-gray-500">$ _</p>
              </div>

              <p className="text-sm text-muted-foreground">
                This is a demonstration of Ring 1 feature gating. Only users
                with Ring 1 access can view this page.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </RingGate>
  );
}
