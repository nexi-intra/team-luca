'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LanguageSelector } from './language-selector';
import { Button } from './ui/button';
import { Menu } from 'lucide-react';
import { CommandTrigger } from './command/CommandTrigger';
import { ThemeToggle } from './theme-toggle';
import { AccessibilityQuickControls } from './accessibility/quick-controls';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function MainHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/magic-button-logo.svg"
              alt="Magic Button"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="hidden font-bold sm:inline-block">
              Magic Button
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link
              href="/magicbutton"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Demo
            </Link>
            <Link
              href="/magicbutton/language"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Languages
            </Link>
            <Link
              href="/magicbutton/auth-demo"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Authentication
            </Link>
            <Link
              href="/magicbutton/demo/sidebar"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Sidebar
            </Link>
            <Link
              href="/accessibility"
              className="transition-colors hover:text-foreground/80 text-foreground/60"
            >
              Accessibility
            </Link>
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <CommandTrigger 
            variant="ghost"
            size="sm"
            className="hidden sm:flex"
          />
          <LanguageSelector 
            variant="ghost" 
            size="sm"
            showName={false}
            className="hidden sm:flex"
          />
          <AccessibilityQuickControls />
          <ThemeToggle />
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="md:hidden"
                size="icon"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col space-y-4 mt-4">
                <Link
                  href="/magicbutton"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Demo
                </Link>
                <Link
                  href="/demo/language"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Languages
                </Link>
                <Link
                  href="/magicbutton/auth-demo"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Authentication
                </Link>
                <Link
                  href="/magicbutton/demo/sidebar"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Sidebar
                </Link>
                <Link
                  href="/accessibility"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Accessibility
                </Link>
              </nav>
              <div className="mt-6 space-y-4">
                <LanguageSelector variant="outline" className="w-full" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Theme</span>
                  <ThemeToggle />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}