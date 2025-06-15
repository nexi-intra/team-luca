import Image from 'next/image';
import Link from 'next/link';
import { BreadcrumbContainer } from '@/components/navigation/BreadcrumbContainer';
import { MagicButtonFooter } from '@/components/navigation/MagicButtonFooter';

export default function MagicButtonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] to-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/magicbutton" className="flex items-center space-x-3">
              <Image
                src="/magic-button-logo.svg"
                alt="Magic Button"
                width={40}
                height={40}
                className="rounded-lg"
              />
              <span className="text-xl font-semibold text-[#233862]">
                Magic Button
              </span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              <Link 
                href="/magicbutton"
                className="text-[#233862] hover:text-[#233862]/80 transition-colors font-medium"
              >
                Home
              </Link>
              <Link 
                href="/magicbutton/features"
                className="text-[#233862] hover:text-[#233862]/80 transition-colors font-medium"
              >
                Features
              </Link>
              <Link 
                href="/magicbutton/demo"
                className="text-[#233862] hover:text-[#233862]/80 transition-colors font-medium"
              >
                Demo
              </Link>
              <Link 
                href="/magicbutton/auth-demo"
                className="text-[#233862] hover:text-[#233862]/80 transition-colors font-medium"
              >
                Auth Demo
              </Link>
              <Link 
                href="/demo/language"
                className="text-[#233862] hover:text-[#233862]/80 transition-colors font-medium"
              >
                Language
              </Link>
              <Link 
                href="/"
                className="text-[#233862] hover:text-[#233862]/80 transition-colors font-medium"
              >
                Exit
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <BreadcrumbContainer />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <MagicButtonFooter />
    </div>
  );
}