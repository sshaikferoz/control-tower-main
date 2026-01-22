/**
 * Theme utility functions for managing light/dark theme
 * Uses data-theme attribute on root element and CSS variables
 */

export type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'theme-preference';
const THEME_ATTRIBUTE = 'data-theme';

/**
 * Get the current theme from localStorage or system preference
 */
export function getInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    // Check localStorage first
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === 'light' || stored === 'dark') {
        return stored;
    }

    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Set the theme on the document root element
 */
export function setTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    root.setAttribute(THEME_ATTRIBUTE, theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
}

/**
 * Get the current theme from the document
 */
export function getTheme(): Theme {
    if (typeof document === 'undefined') {
        return 'light';
    }

    const root = document.documentElement;
    const theme = root.getAttribute(THEME_ATTRIBUTE) as Theme | null;

    if (theme === 'light' || theme === 'dark') {
        return theme;
    }

    return getInitialTheme();
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): Theme {
    const currentTheme = getTheme();
    const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    return newTheme;
}

/**
 * Initialize theme on app load (call this before React renders to avoid flicker)
 */
export function initializeTheme(): void {
    if (typeof document === 'undefined') {
        return;
    }

    const theme = getInitialTheme();
    setTheme(theme);
}

