'use client';

import { useEffect, useState } from 'react';
import { useSafeHydration } from '@/lib/use-safe-hydration';

export function useSystemTheme() {
  // Use our safe hydration hook to prevent hydration mismatch
  const systemTheme = useSafeHydration<'light' | 'dark'>(() => {
    // This callback only runs on the client after hydration
    const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return isDarkMode ? 'dark' : 'light';
  }, 'light'); // Default to light during SSR

  // Set up the event listener for theme changes
  const [currentTheme, setCurrentTheme] = useState<'light' | 'dark'>(systemTheme || 'light');

  useEffect(() => {
    // Update state when systemTheme changes after hydration
    if (systemTheme) {
      setCurrentTheme(systemTheme);
    }

    // Listen for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setCurrentTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [systemTheme]);

  // Return the current theme, defaulting to light
  return currentTheme || 'light';
}
