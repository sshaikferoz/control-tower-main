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
            return 'dark';
        }
        return getTheme();
    });

    // Dark-only mode: keep state synced with DOM in case something changes it.
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
        setThemeState(getTheme());
    }, []);

    return {
        theme,
        toggleTheme,
        setTheme: setThemeValue,
    };
}

