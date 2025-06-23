'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface DevComponentOverlayProps {
  componentName: string;
  isVisible: boolean;
}

export function DevComponentOverlay({ componentName, isVisible }: DevComponentOverlayProps) {
  const pathname = usePathname();
  const [showRoute, setShowRoute] = useState(false);
  const [routeTimeout, setRouteTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      setShowRoute(true);
      if (routeTimeout) {
        clearTimeout(routeTimeout);
      }
      const timeout = setTimeout(() => {
        setShowRoute(false);
      }, 3000);
      setRouteTimeout(timeout);
    }

    return () => {
      if (routeTimeout) {
        clearTimeout(routeTimeout);
      }
    };
  }, [isVisible, routeTimeout]);

  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 z-50 bg-black text-white px-3 py-1.5 text-sm font-mono rounded-br-md pointer-events-none"
            style={{
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {componentName}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRoute && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[100] pointer-events-none"
          >
            <div
              className="bg-black text-white px-8 py-4 rounded-lg font-mono text-5xl font-bold"
              style={{
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              {pathname}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}