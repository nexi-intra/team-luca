"use client";

import React, { useEffect, useRef } from "react";
import { useDemoContext } from "@/lib/demo/context";
import { cn } from "@monorepo/utils";

interface DemoElementProps {
  id: string;
  children: React.ReactElement;
  className?: string;
}

export function DemoElement({ id, children, className }: DemoElementProps) {
  const { registerElement, unregisterElement, highlights } = useDemoContext();
  const elementRef = useRef<HTMLElement>(null);
  const isHighlighted = highlights.includes(id);

  useEffect(() => {
    const element = elementRef.current;
    if (element) {
      registerElement(id, element);
      return () => unregisterElement(id);
    }
    return undefined;
  }, [id, registerElement, unregisterElement]);

  // Use React.Children.only to ensure we have a single valid element
  const child = React.Children.only(children) as React.ReactElement<any>;

  return React.cloneElement(child, {
    ref: elementRef,
    "data-demo-id": id,
    className: cn(
      child.props.className,
      className,
      isHighlighted &&
        "ring-2 ring-primary ring-offset-2 transition-all duration-300",
    ),
  } as any);
}
