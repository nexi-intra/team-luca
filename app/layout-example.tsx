import { BreadcrumbContainer } from '@/components/navigation/BreadcrumbContainer';

export default function ExampleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <h1>Your App</h1>
        </div>
      </header>

      {/* Breadcrumb - automatically shows when not on home page */}
      <BreadcrumbContainer />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}