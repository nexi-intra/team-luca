import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, Layout } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

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
          Experience the power of Magic Button Assistant through live
          demonstrations and interactive examples.
        </p>
      </section>

      {/* Demo Categories */}
      <section className="flex justify-center">
        <Card className="border-gray-200 dark:border-gray-700 hover:border-[#233862]/30 dark:hover:border-gray-600 transition-colors max-w-md">
          <CardHeader>
            <div className="w-12 h-12 bg-[#233862]/10 dark:bg-[#233862]/20 rounded-lg flex items-center justify-center mb-4">
              <Layout className="w-6 h-6 text-[#233862] dark:text-white" />
            </div>
            <CardTitle className="text-[#233862] dark:text-white">
              Sidebar Component
            </CardTitle>
            <CardDescription>
              Interactive sidebar with authentication integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Explore our feature-rich sidebar component with collapsible
              groups, authentication status, and mobile support.
            </p>
            <Link href="/magicbutton/demo/sidebar">
              <Button className="bg-[#233862] hover:bg-[#233862]/90 dark:bg-white dark:hover:bg-gray-100 dark:text-[#233862]">
                View Sidebar Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
