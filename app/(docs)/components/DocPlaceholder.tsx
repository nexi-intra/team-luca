import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';

interface DocPlaceholderProps {
  title: string;
  description: string;
  ring: 'users' | 'power-users' | 'developers' | 'admins' | 'system-admins' | 'compliance';
  comingSoon?: boolean;
}

const ringConfig = {
  'users': { label: 'All Users', color: 'default' },
  'power-users': { label: 'Power Users', color: 'secondary' },
  'developers': { label: 'Developers', color: 'outline' },
  'admins': { label: 'Administrators', color: 'destructive' },
  'system-admins': { label: 'System Admins', color: 'destructive' },
  'compliance': { label: 'Compliance & Security', color: 'destructive' }
};

export function DocPlaceholder({ title, description, ring, comingSoon = true }: DocPlaceholderProps) {
  const config = ringConfig[ring];
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-3xl font-bold text-[#233862] dark:text-white">{title}</h1>
          <Badge variant={config.color as any}>{config.label}</Badge>
        </div>
        <p className="text-lg text-gray-600 dark:text-gray-300">{description}</p>
      </div>

      {comingSoon && (
        <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
              <AlertCircle className="h-5 w-5" />
              Documentation Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-yellow-700 dark:text-yellow-300">
              This documentation page is currently under development. Please check back soon for detailed information about {title.toLowerCase()}.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}