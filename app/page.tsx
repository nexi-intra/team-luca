import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="container mx-auto p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Magic Button Assistant for XXX</h1>
          <p className="text-lg text-muted-foreground">
            Leverage Claude AI to its fullest potential for your specific use case
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Welcome to your Magic Button Assistant template
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This template includes everything you need to build a specialized AI assistant:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Next.js 14 with App Router</li>
                <li>OpenTelemetry instrumentation</li>
                <li>shadcn/ui components</li>
                <li>Azure AD authentication</li>
                <li>Claude AI integration</li>
              </ul>
              <Button className="mt-4">
                Start Building
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customize Your Assistant</CardTitle>
              <CardDescription>
                Tailor this template for your specific needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Replace &quot;XXX&quot; throughout the codebase with your specific use case:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Update app title and metadata</li>
                <li>Add your specific prompts</li>
                <li>Configure domain-specific features</li>
                <li>Customize the UI for your workflow</li>
              </ul>
              <Button variant="outline" className="mt-4">
                View Documentation
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}