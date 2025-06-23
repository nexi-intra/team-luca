import { Suspense } from 'react';
import DocsClient from './docs-client';

export default function DocsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DocsClient />
    </Suspense>
  );
}