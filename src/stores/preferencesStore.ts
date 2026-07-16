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

function normalizePreferences(prefs: UserPreferences): UserPreferences {
  const usesLegacySoftDark =
    prefs.primaryColor.toUpperCase() === '#2D2433' &&
    prefs.cardColor.toUpperCase() === '#1E1A23';

  if (!usesLegacySoftDark) return prefs;

  return {
    ...prefs,
    theme: 'dark',
    primaryColor: '#F3C5DB',
    buttonColor: '#E891B9',
    cardColor: '#211C25',
    accentColor: '#C995B8',
    bottomBarColor: '#1E1A23',
  };
}

function applyPreferencesToDOM(prefs: UserPreferences) {
  const root = document.documentElement;

  // Theme
  const isDark =
    prefs.theme === 'dark' ||
    (prefs.theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.style.colorScheme = isDark ? 'dark' : 'light';

  // Colors
  root.style.setProperty('--color-primary', prefs.primaryColor);
  root.style.setProperty('--color-button', prefs.buttonColor);
  root.style.setProperty('--color-card', isDark ? '#211C25' : prefs.cardColor);
  root.style.setProperty('--color-accent', prefs.accentColor);
  root.style.setProperty('--color-bottom-bar', isDark ? '#1E1A23' : prefs.bottomBarColor);

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
    const normalizedPreferences = normalizePreferences(prefs);
    set({ preferences: normalizedPreferences, isLoaded: true });
    applyPreferencesToDOM(normalizedPreferences);
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
