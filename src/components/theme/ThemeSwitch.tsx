'use client';

import { useTheme } from '@/components/theme/ThemeProvider';
import { Switch } from '@/components/ui/switch';
import { useEffect, useState } from 'react';
import { useSafeHydration } from '@/lib/use-safe-hydration';
import { useSystemTheme } from '@/hooks/useSystemTheme';

interface ThemeSwitchProps {
  onThemeChange?: (isDark: boolean) => void;
}

export function ThemeSwitch({ onThemeChange }: ThemeSwitchProps) {
  const { theme, setTheme } = useTheme();
  const systemTheme = useSystemTheme();
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Use our safe hydration hook to prevent hydration mismatch
  const isDark = useSafeHydration(() => {
    return theme === 'dark' || (theme === 'system' && systemTheme === 'dark');
  }, false);

  // Update state when the safe value changes
  useEffect(() => {
    if (isDark !== null) {
      setIsDarkMode(isDark);
    }
  }, [isDark]);

  const handleChange = (checked: boolean) => {
    setIsDarkMode(checked);
    setTheme(checked ? 'dark' : 'light');

    if (onThemeChange) {
      onThemeChange(checked);
    }
  };

  return (
    <Switch
      checked={isDarkMode}
      onCheckedChange={handleChange}
      aria-label="Toggle dark mode"
    />
  );
}
