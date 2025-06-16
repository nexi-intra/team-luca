import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Code, Sparkles, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function MagicButtonDemoPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-12">
      {/* Hero Section */}
      <section className="text-center py-12">
        <div className="inline-flex items-center justify-center p-2 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-full mb-6">
          <Play className="w-8 h-8 text-[#233862] dark:text-white" />
        </div>
        <h1 className="text-5xl font-bold text-[#233862] dark:text-white mb-4">
          Interactive Demo
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
          Experience the power of Magic Button Assistant through live demonstrations and interactive examples.
        </p>
      </section>

      {/* Demo Categories */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-[#233862] dark:text-white" />
            </div>
            <CardTitle className="text-[#233862] dark:text-white">AI Assistant Demo</CardTitle>
            <CardDescription>
              See how our AI assistant can help with various tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Watch Magic Button analyze code, suggest improvements, and generate documentation automatically.
            </p>
            <Button className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
              Try AI Assistant
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors">
          <CardHeader>
            <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
              <Code className="w-6 h-6 text-[#233862] dark:text-white" />
            </div>
            <CardTitle className="text-[#233862] dark:text-white">Code Generation</CardTitle>
            <CardDescription>
              Generate boilerplate code and components instantly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Create React components, API endpoints, and more with natural language descriptions.
            </p>
            <Button className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
              Start Generating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Live Demo Section */}
      <section className="bg-[#233862]/5 dark:bg-gray-800/50 rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-[#233862] dark:text-white mb-6 text-center">
          Live Playground
        </h2>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <p className="text-gray-600 dark:text-gray-300 text-center py-12">
            Interactive demo components will be displayed here. This is where users can try out Magic Button features in real-time.
          </p>
        </div>
      </section>

      {/* Coming Soon Features */}
      <section>
        <h2 className="text-3xl font-bold text-[#233862] dark:text-white text-center mb-8">
          More Demos Coming Soon
        </h2>
        <div className="grid md:grid-cols-3 gap-4">
          {['Workflow Automation', 'Data Analysis', 'Report Generation'].map((feature) => (
            <div key={feature} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 text-center">
              <h3 className="font-semibold text-[#233862] dark:text-white mb-2">{feature}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Available in the next release</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-8">
        <h3 className="text-2xl font-bold text-[#233862] dark:text-white mb-4">
          Ready to build your own Magic Button?
        </h3>
        <div className="flex gap-4 justify-center">
          <Button size="lg" className="bg-[#233862] hover:bg-[#233862]/90">
            Get Started
          </Button>
          <Button size="lg" variant="outline" className="border-[#233862] dark:border-gray-600 text-[#233862] dark:text-white">
            View Documentation
          </Button>
        </div>
      </section>
    </div>
  );
}