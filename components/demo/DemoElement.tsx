'use client';

import React, { useEffect, useRef } from 'react';
import { useDemoContext } from '@/lib/demo/context';
import { cn } from '@/lib/utils';

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
  }, [id, registerElement, unregisterElement]);

  return React.cloneElement(children, {
    ref: elementRef,
    'data-demo-id': id,
    className: cn(
      children.props.className,
      className,
      isHighlighted && 'ring-2 ring-primary ring-offset-2 transition-all duration-300'
    )
  });
}