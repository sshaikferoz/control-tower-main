'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const THEME_STORAGE_KEY = 'control-tower-theme';
export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
    theme: ThemeMode;
    setTheme: (theme: ThemeMode) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<ThemeMode>('dark');

    const setTheme = useCallback((newTheme: ThemeMode) => {
        setThemeState(newTheme);
        if (typeof window !== 'undefined') {
            localStorage.setItem(THEME_STORAGE_KEY, newTheme);
            document.documentElement.setAttribute('data-theme', newTheme);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(newTheme);
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setThemeState((prev) => {
            const next = prev === 'dark' ? 'light' : 'dark';
            if (typeof window !== 'undefined') {
                localStorage.setItem(THEME_STORAGE_KEY, next);
                document.documentElement.setAttribute('data-theme', next);
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(next);
            }
            return next;
        });
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
        if (stored && (stored === 'light' || stored === 'dark')) {
            setThemeState(stored);
            document.documentElement.setAttribute('data-theme', stored);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(stored);
        } else {
            document.documentElement.setAttribute('data-theme', theme);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);
        }
    }, [theme]);

    const value: ThemeContextType = {
        theme,
        setTheme,
        toggleTheme,
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
