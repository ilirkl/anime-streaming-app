'use client';

import { cn } from '@/lib/utils';
import React from 'react';

interface ContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function ContentWrapper({ children, className }: ContentWrapperProps) {
  return (
    <div className={cn('app-padding', className)}>
      {children}
    </div>
  );
}
