"use client";

import React from "react";
import { DevComponentOverlay } from "@/components/dev/DevComponentOverlay";
import { useDevOverlay } from "@/hooks/use-dev-overlay";

export function withDevOverlay<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string,
) {
  const WrappedComponent = React.forwardRef<any, P>((props, ref) => {
    const isVisible = useDevOverlay();

    if (process.env.NODE_ENV !== "development") {
      return <Component {...(props as any)} ref={ref} />;
    }

    return (
      <div className="relative">
        <DevComponentOverlay
          componentName={componentName}
          isVisible={isVisible}
        />
        <Component {...(props as any)} ref={ref} />
      </div>
    );
  });

  WrappedComponent.displayName = `withDevOverlay(${componentName})`;

  return WrappedComponent;
}
