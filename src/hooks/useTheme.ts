import { useCallback, useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'wos-theme';

/**
 * Theme state.
 *
 * Dark is the default, deliberately — this is a dark-arena identity, not a
 * light site with a night mode bolted on. `light` is the opt-in alternate.
 *
 * The chosen theme is written to `data-theme` on <html>; every colour resolves
 * through CSS variables (see src/index.css), so switching is a variable swap
 * rather than a `dark:` variant on every element.
 *
 * A visitor's OS preference is honoured on first visit only — once they pick,
 * their choice wins.
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Private browsing — the attribute is still set, only persistence fails.
    }
  }, [theme]);

  const setTheme = useCallback((next: Theme) => setThemeState(next), []);
  const toggle = useCallback(
    () => setThemeState((t) => (t === 'dark' ? 'light' : 'dark')),
    []
  );

  return { theme, setTheme, toggle };
}
