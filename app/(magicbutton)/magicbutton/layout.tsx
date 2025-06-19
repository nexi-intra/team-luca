"use client";

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BreadcrumbContainer } from '@/components/navigation/BreadcrumbContainer';
import { MagicButtonFooter } from '@/app/(magicbutton)/components/MagicButtonFooter';
import { ThemeToggle } from '@/components/theme-toggle';

export default function MagicButtonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FEFEFE] to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
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
              <span className="text-xl font-semibold text-[#233862] dark:text-gray-100">
                Magic Button
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/magicbutton"
                className={`transition-colors font-medium ${
                  pathname === '/magicbutton' 
                    ? 'text-[#233862] dark:text-gray-100 font-semibold' 
                    : 'text-[#233862]/70 dark:text-gray-400 hover:text-[#233862] dark:hover:text-gray-100'
                }`}
              >
                Overview
              </Link>
              <Link 
                href="/magicbutton/features"
                className={`transition-colors font-medium ${
                  pathname === '/magicbutton/features' 
                    ? 'text-[#233862] dark:text-gray-100 font-semibold' 
                    : 'text-[#233862]/70 dark:text-gray-400 hover:text-[#233862] dark:hover:text-gray-100'
                }`}
              >
                Features
              </Link>
              <Link 
                href="/magicbutton/demo"
                className={`transition-colors font-medium ${
                  pathname === '/magicbutton/demo' 
                    ? 'text-[#233862] dark:text-gray-100 font-semibold' 
                    : 'text-[#233862]/70 dark:text-gray-400 hover:text-[#233862] dark:hover:text-gray-100'
                }`}
              >
                Demo
              </Link>
              <Link 
                href="/magicbutton/language"
                className={`transition-colors font-medium ${
                  pathname === '/magicbutton/language' 
                    ? 'text-[#233862] dark:text-gray-100 font-semibold' 
                    : 'text-[#233862]/70 dark:text-gray-400 hover:text-[#233862] dark:hover:text-gray-100'
                }`}
              >
                Languages
              </Link>
              <Link 
                href="/magicbutton/auth-demo"
                className={`transition-colors font-medium ${
                  pathname === '/magicbutton/auth-demo' 
                    ? 'text-[#233862] dark:text-gray-100 font-semibold' 
                    : 'text-[#233862]/70 dark:text-gray-400 hover:text-[#233862] dark:hover:text-gray-100'
                }`}
              >
                Authentication
              </Link>
              <div className="h-4 w-px bg-[#233862]/20 dark:bg-gray-600" />
              <Link 
                href="/"
                className="text-[#233862]/60 dark:text-gray-500 hover:text-[#233862] dark:hover:text-gray-300 transition-colors font-medium"
              >
                Exit Demo
              </Link>
            </nav>
            <div className="hidden md:block ml-4">
              <ThemeToggle />
            </div>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-[#233862] dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <span className="sr-only">Open menu</span>
              {!mobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 dark:border-gray-700">
                <Link
                  href="/magicbutton"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    pathname === '/magicbutton'
                      ? 'bg-[#233862]/10 dark:bg-gray-800 text-[#233862] dark:text-gray-100 font-semibold'
                      : 'text-[#233862]/70 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#233862] dark:hover:text-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Overview
                </Link>
                <Link
                  href="/magicbutton/features"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    pathname === '/magicbutton/features'
                      ? 'bg-[#233862]/10 dark:bg-gray-800 text-[#233862] dark:text-gray-100 font-semibold'
                      : 'text-[#233862]/70 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#233862] dark:hover:text-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="/magicbutton/demo"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    pathname === '/magicbutton/demo'
                      ? 'bg-[#233862]/10 dark:bg-gray-800 text-[#233862] dark:text-gray-100 font-semibold'
                      : 'text-[#233862]/70 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#233862] dark:hover:text-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Demo
                </Link>
                <Link
                  href="/magicbutton/language"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    pathname === '/magicbutton/language'
                      ? 'bg-[#233862]/10 dark:bg-gray-800 text-[#233862] dark:text-gray-100 font-semibold'
                      : 'text-[#233862]/70 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#233862] dark:hover:text-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Languages
                </Link>
                <Link
                  href="/magicbutton/auth-demo"
                  className={`block px-3 py-2 rounded-md font-medium ${
                    pathname === '/magicbutton/auth-demo'
                      ? 'bg-[#233862]/10 dark:bg-gray-800 text-[#233862] dark:text-gray-100 font-semibold'
                      : 'text-[#233862]/70 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-[#233862] dark:hover:text-gray-100'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Authentication
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <Link
                  href="/"
                  className="block px-3 py-2 rounded-md text-[#233862]/60 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Exit Demo
                </Link>
                <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-[#233862] dark:text-gray-100">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          )}
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