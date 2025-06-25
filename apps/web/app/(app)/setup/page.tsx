import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function SetupPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Setup Guide</h1>
        <p className="text-gray-600">
          Follow these steps to configure your Magic Button application.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prerequisites</CardTitle>
          <CardDescription>
            Make sure you have the following before starting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Azure CLI installed</div>
                <div className="text-sm text-gray-600">
                  Required for Azure authentication and app registration
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Azure subscription</div>
                <div className="text-sm text-gray-600">
                  With permissions to create app registrations
                </div>
              </div>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <div className="font-medium">Node.js 18+ and pnpm</div>
                <div className="text-sm text-gray-600">
                  For running the application locally
                </div>
              </div>
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Steps</CardTitle>
          <CardDescription>
            Complete these steps in order to set up authentication
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-4">
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium">Configure Azure AD / Entra ID</div>
                <div className="text-sm text-gray-600 mb-2">
                  Register your application and configure redirect URLs
                </div>
                <Link href="/setup/azure">
                  <Button variant="outline" size="sm">
                    Go to Azure Setup
                  </Button>
                </Link>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium">
                  Configure Environment Variables
                </div>
                <div className="text-sm text-gray-600">
                  Set up your .env.local file with the required variables
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div className="flex-1">
                <div className="font-medium">Test Authentication</div>
                <div className="text-sm text-gray-600">
                  Verify that your setup is working correctly
                </div>
              </div>
            </li>
          </ol>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Link href="/magicbutton/auth-demo">
              <Button variant="outline">Auth Demo Page</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
