import { BreadcrumbContainer } from '@/components/navigation/BreadcrumbContainer';
import { MainHeader } from '@/components/main-header';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Header with navigation */}
      <MainHeader />
      
      {/* Breadcrumb navigation */}
      <BreadcrumbContainer />
      
      {/* Main content */}
      <main className="min-h-screen">
        {children}
      </main>
    </>
  );
}