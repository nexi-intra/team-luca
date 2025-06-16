import { RouteMetadata } from './types';

// Define page titles for routes
export const routeMetadata: RouteMetadata = {
  '/': 'Home',
  '/magicbutton': 'Magic Button',
  '/magicbutton/features': 'Features',
  '/magicbutton/demo': 'Demo',
  '/magicbutton/auth-demo': 'Authentication Demo',
  '/magicbutton/auth-demo/reauth-test': 'Re-Authentication Test',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/dashboard': 'Dashboard',
  '/sidebar-demo': 'Sidebar Demo',
  '/demo/sidebar': 'Sidebar Component Demo',
  '/accessibility': 'Accessibility',
  '/admin/console': 'System Console',
};

// Helper to get title from path
export function getPageTitle(pathname: string): string {
  // Check exact match first
  if (routeMetadata[pathname]) {
    return routeMetadata[pathname];
  }

  // Try to match with trailing slash removed
  const pathWithoutSlash = pathname.replace(/\/$/, '');
  if (routeMetadata[pathWithoutSlash]) {
    return routeMetadata[pathWithoutSlash];
  }

  // Try to infer from last segment
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length > 0) {
    const lastSegment = segments[segments.length - 1];
    return lastSegment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  return 'Page';
}

// Helper to generate breadcrumb items from pathname
export function generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: Array<{ label: string; href: string }> = [];

  // Always include home
  breadcrumbs.push({ label: 'Home', href: '/' });

  // Build up the path
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = getPageTitle(currentPath);
    breadcrumbs.push({
      label,
      href: currentPath,
    });
  });

  return breadcrumbs;
}