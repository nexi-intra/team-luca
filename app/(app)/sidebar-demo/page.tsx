import { Suspense } from 'react';
import SidebarDemoClient from './sidebar-demo-client';

export default function SidebarDemoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SidebarDemoClient />
    </Suspense>
  );
}