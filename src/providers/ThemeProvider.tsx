import { useEffect, type ReactNode } from 'react';
import { usePreferencesStore } from '@/stores/preferencesStore';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = usePreferencesStore((s) => s.preferences.theme);
  const applyToDOM = usePreferencesStore((s) => s.applyToDOM);

  useEffect(() => {
    applyToDOM();
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const syncSystemTheme = () => applyToDOM();
    const syncWhenVisible = () => {
      if (document.visibilityState === 'visible') syncSystemTheme();
    };

    // Alguns navegadores móveis só atualizam a preferência quando o app volta
    // ao primeiro plano. Estes eventos mantêm o tema sincronizado nesses casos.
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', syncSystemTheme);
    } else {
      mediaQuery.addListener(syncSystemTheme);
    }
    window.addEventListener('focus', syncSystemTheme);
    window.addEventListener('pageshow', syncSystemTheme);
    document.addEventListener('visibilitychange', syncWhenVisible);

    return () => {
      if (typeof mediaQuery.removeEventListener === 'function') {
        mediaQuery.removeEventListener('change', syncSystemTheme);
      } else {
        mediaQuery.removeListener(syncSystemTheme);
      }
      window.removeEventListener('focus', syncSystemTheme);
      window.removeEventListener('pageshow', syncSystemTheme);
      document.removeEventListener('visibilitychange', syncWhenVisible);
    };
  }, [theme, applyToDOM]);

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      document.documentElement.classList.add('no-animations');
    }
  }, []);

  return <>{children}</>;
}
