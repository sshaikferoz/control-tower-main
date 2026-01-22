/**
 * React hook for theme management
 * Provides theme state and toggle function without unnecessary re-renders
 */

import { useCallback, useEffect, useState } from 'react';
import { Theme, getTheme, setTheme, toggleTheme as toggleThemeUtil } from '@/utils/theme';

const THEME_ATTRIBUTE = 'data-theme';

/**
 * Hook to manage theme state
 * @returns { theme, toggleTheme, setTheme }
 */
export function useTheme() {
    const [theme, setThemeState] = useState<Theme>(() => {
        if (typeof window === 'undefined') {
            return 'light';
        }
        return getTheme();
    });

    // Sync with system preference changes (only if no manual preference is set)
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const handleChange = (e: MediaQueryListEvent) => {
            // Only update if user hasn't manually set a preference
            const stored = localStorage.getItem('theme-preference');
            if (!stored) {
                const newTheme: Theme = e.matches ? 'dark' : 'light';
                setTheme(newTheme);
                setThemeState(newTheme);
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    // Listen for theme changes from other tabs/windows
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'theme-preference' && e.newValue) {
                const newTheme = e.newValue as Theme;
                if (newTheme === 'light' || newTheme === 'dark') {
                    setTheme(newTheme);
                    setThemeState(newTheme);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // Update state when theme attribute changes (for programmatic changes)
    useEffect(() => {
        if (typeof document === 'undefined') {
            return;
        }

        const observer = new MutationObserver(() => {
            const currentTheme = getTheme();
            setThemeState(currentTheme);
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: [THEME_ATTRIBUTE],
        });

        return () => observer.disconnect();
    }, []);

    const toggleTheme = useCallback(() => {
        const newTheme = toggleThemeUtil();
        setThemeState(newTheme);
        return newTheme;
    }, []);

    const setThemeValue = useCallback((newTheme: Theme) => {
        setTheme(newTheme);
        setThemeState(newTheme);
    }, []);

    return {
        theme,
        toggleTheme,
        setTheme: setThemeValue,
    };
}

