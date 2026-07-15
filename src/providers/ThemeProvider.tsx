import { useEffect, type ReactNode } from 'react';
import { usePreferencesStore } from '@/stores/preferencesStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const preferences = usePreferencesStore((s) => s.preferences);
  const applyToDOM = usePreferencesStore((s) => s.applyToDOM);

  // Listen for system theme changes when theme = 'system'
  useEffect(() => {
    if (preferences.theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => applyToDOM();

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [preferences.theme, applyToDOM]);

  // Apply on mount
  useEffect(() => {
    applyToDOM();
  }, [applyToDOM]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      document.documentElement.classList.add('no-animations');
    }
  }, []);

  return <>{children}</>;
}
