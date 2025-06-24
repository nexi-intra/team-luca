'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Trash2, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAuth } from '@monorepo/auth';
import { useBranding, useWhitelabel } from '@/components/providers/WhitelabelProvider';

export function MagicButtonFooter() {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const branding = useBranding();
  const { getContent } = useWhitelabel();
  const footerContent = getContent('footer');

  const handleClearAll = async () => {
    setIsClearing(true);
    
    try {
      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear localStorage
      localStorage.clear();

      // Clear sessionStorage
      sessionStorage.clear();

      // Clear IndexedDB (if used)
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        databases.forEach(db => {
          if (db.name) {
            indexedDB.deleteDatabase(db.name);
          }
        });
      }

      // Clear service worker caches
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Logout user
      await signOut();

      toast.success('All data cleared successfully', {
        description: 'Cookies, session, and local storage have been reset.'
      });

      // Redirect to home after a short delay
      setTimeout(() => {
        router.push('/');
        router.refresh();
      }, 1000);

    } catch (error) {
      console.error('Error clearing data:', error);
      toast.error('Failed to clear all data', {
        description: 'Some data might not have been cleared properly.'
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50 mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center space-x-2">
            <Image
              src={branding.logo.light}
              alt={branding.appName}
              width={24}
              height={24}
              className="rounded"
            />
            <span className="text-sm text-[#233862] dark:text-gray-300">
              {footerContent.copyright}
            </span>
          </div>

          {/* Middle section - Links */}
          <div className="flex items-center space-x-4">
            {footerContent.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-[#233862] dark:hover:text-gray-200 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Reset Button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset All Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Clear All Browser Data
                </AlertDialogTitle>
                <AlertDialogDescription className="space-y-2">
                  <p>
                    This action will permanently delete:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>All cookies</li>
                    <li>Local storage data</li>
                    <li>Session storage data</li>
                    <li>Cached data</li>
                    <li>Your current authentication session</li>
                  </ul>
                  <p className="font-semibold pt-2">
                    This action cannot be undone. You will be logged out and redirected to the home page.
                  </p>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {isClearing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    'Clear All Data'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </footer>
  );
}