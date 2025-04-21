'use client';

import { useEffect, useState } from 'react';

/**
 * A hook that safely handles hydration by returning null during SSR
 * and the actual value after hydration is complete.
 * 
 * @param callback Function that returns the value to use after hydration
 * @param fallback Optional fallback value to use during SSR
 * @returns The value from callback after hydration, or fallback during SSR
 */
export function useSafeHydration<T>(callback: () => T, fallback: T | null = null): T | null {
  const [value, setValue] = useState<T | null>(fallback);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
    setValue(callback());
  }, [callback]);

  return isHydrated ? value : fallback;
}

/**
 * A hook that safely handles window-dependent values during hydration
 * 
 * @param getter Function that accesses window properties
 * @param fallback Fallback value to use during SSR
 * @returns The value from getter after hydration, or fallback during SSR
 */
export function useWindowValue<T>(getter: () => T, fallback: T): T {
  const [value, setValue] = useState<T>(fallback);
  
  useEffect(() => {
    // Only run on client side after hydration
    setValue(getter());
  }, [getter]);
  
  return value;
}

/**
 * A utility to safely access window properties
 * Returns undefined during SSR and the actual value on the client
 */
export function safeWindow<T>(accessor: () => T): T | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }
  
  try {
    return accessor();
  } catch (error) {
    console.error('Error accessing window property:', error);
    return undefined;
  }
}
