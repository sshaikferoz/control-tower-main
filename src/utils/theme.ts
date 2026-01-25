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
        return 'dark';
    }

    // Dark-only mode (ignore stored/system preference)
    return 'dark';
}

/**
 * Set the theme on the document root element
 */
export function setTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;
    // Dark-only mode: clamp everything to dark
    root.setAttribute(THEME_ATTRIBUTE, 'dark');
    root.classList.add('dark');
    root.classList.remove('light');
    try {
        localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    } catch {
        // Ignore storage errors
    }
}

/**
 * Get the current theme from the document
 */
export function getTheme(): Theme {
    if (typeof document === 'undefined') {
        return 'dark';
    }

    const root = document.documentElement;
    const theme = root.getAttribute(THEME_ATTRIBUTE) as Theme | null;

    if (theme === 'light' || theme === 'dark') {
        return 'dark';
    }

    return getInitialTheme();
}

/**
 * Toggle between light and dark theme
 */
export function toggleTheme(): Theme {
    setTheme('dark');
    return 'dark';
}

/**
 * Initialize theme on app load (call this before React renders to avoid flicker)
 */
export function initializeTheme(): void {
    if (typeof document === 'undefined') {
        return;
    }

    setTheme('dark');
}

