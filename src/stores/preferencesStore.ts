import { create } from 'zustand';
import type { UserPreferences } from '@/types';
import { DEFAULT_PREFERENCES, FONT_SIZE_MAP, BORDER_RADIUS_MAP } from '@/constants/app';

interface PreferencesState {
  preferences: UserPreferences;
  isLoaded: boolean;
  setPreferences: (prefs: UserPreferences) => void;
  updatePreference: <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => void;
  applyToDOM: () => void;
}

function applyPreferencesToDOM(prefs: UserPreferences) {
  const root = document.documentElement;

  // Theme
  const isDark =
    prefs.theme === 'dark' ||
    (prefs.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');

  // Colors
  root.style.setProperty('--color-primary', prefs.primaryColor);
  root.style.setProperty('--color-button', prefs.buttonColor);
  root.style.setProperty('--color-card', prefs.cardColor);
  root.style.setProperty('--color-accent', prefs.accentColor);
  root.style.setProperty('--color-bottom-bar', prefs.bottomBarColor);

  // Chart palette
  prefs.chartPalette.forEach((color, index) => {
    root.style.setProperty(`--color-chart-${index + 1}`, color);
  });

  // Font size
  root.style.setProperty('--font-size-base', FONT_SIZE_MAP[prefs.fontSize] ?? '16px');

  // Border radius
  root.style.setProperty('--radius-base', BORDER_RADIUS_MAP[prefs.borderRadius] ?? '16px');

  // Animations
  if (!prefs.animationsEnabled) {
    root.classList.add('no-animations');
  } else {
    root.classList.remove('no-animations');
  }
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: DEFAULT_PREFERENCES,
  isLoaded: false,

  setPreferences: (prefs) => {
    set({ preferences: prefs, isLoaded: true });
    applyPreferencesToDOM(prefs);
  },

  updatePreference: (key, value) => {
    const newPrefs = { ...get().preferences, [key]: value };
    set({ preferences: newPrefs });
    applyPreferencesToDOM(newPrefs);
  },

  applyToDOM: () => {
    applyPreferencesToDOM(get().preferences);
  },
}));
