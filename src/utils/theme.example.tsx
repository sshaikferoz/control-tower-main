/**
 * Example usage of the theme system
 * 
 * This file demonstrates how to use the theme utilities and hooks
 */

import { getTheme, setTheme, toggleTheme, getInitialTheme } from './theme';
import { useTheme } from '@/hooks/ui/useTheme';

// ============================================
// Utility Functions (can be used anywhere)
// ============================================

// Get current theme
const currentTheme = getTheme(); // Returns 'light' | 'dark'

// Set theme programmatically
setTheme('dark');
setTheme('light');

// Toggle theme
const newTheme = toggleTheme(); // Returns the new theme

// Get initial theme (from localStorage or system preference)
const initialTheme = getInitialTheme();

// ============================================
// React Hook Usage
// ============================================

// In a React component:
const ExampleComponent: React.FC = () => {
    const { theme, toggleTheme, setTheme } = useTheme();

    return (
        <div>
            <p>Current theme: {theme}</p>
            <button onClick={toggleTheme}>Toggle Theme</button>
            <button onClick={() => setTheme('light')}>Light</button>
            <button onClick={() => setTheme('dark')}>Dark</button>
        </div>
    );
};

export default ExampleComponent;

// ============================================
// CSS Usage
// ============================================

/*
In your CSS files, use CSS variables:

.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--primary1);
}

The theme is controlled by the data-theme attribute on the <html> element:
- <html data-theme="light"> for light theme
- <html data-theme="dark"> for dark theme
*/

// ============================================
// TypeScript Types
// ============================================

import type { Theme } from './theme';

function acceptTheme(theme: Theme) {
    // theme is 'light' | 'dark'
    console.log(theme);
}

