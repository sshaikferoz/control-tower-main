# Light/Dark Theme System

A complete theme system implementation using CSS variables and `data-theme` attribute on the root element.

## Features

- ✅ CSS variables for all theme colors
- ✅ No unnecessary React re-renders
- ✅ Theme persistence in localStorage
- ✅ Initializes on app load to prevent flicker
- ✅ Simple toggle function (light ↔ dark)
- ✅ No Redux or heavy state management
- ✅ TypeScript support
- ✅ Modern React best practices

## File Structure

```
src/
├── utils/
│   └── theme.ts                    # Theme utility functions
├── hooks/
│   └── ui/
│       └── useTheme.ts             # React hook for theme management
├── components/
│   └── ui/
│       ├── ThemeScript.tsx         # Initialization script (prevents flicker)
│       └── ThemeToggleButton.tsx   # Sample theme toggle button
└── app/
    ├── layout.tsx                  # Root layout (includes ThemeScript)
    └── globals.css                 # CSS variables for themes
```

## Usage

### 1. Basic Hook Usage

```tsx
import { useTheme } from '@/hooks/ui/useTheme';

function MyComponent() {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
    </div>
  );
}
```

### 2. Utility Functions (Non-React)

```tsx
import { getTheme, setTheme, toggleTheme } from '@/utils/theme';

// Get current theme
const currentTheme = getTheme(); // 'light' | 'dark'

// Set theme programmatically
setTheme('dark');

// Toggle theme
const newTheme = toggleTheme(); // Returns the new theme
```

### 3. Using Theme Toggle Button

```tsx
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';

function MyComponent() {
  return (
    <div>
      <ThemeToggleButton />
      <ThemeToggleButton showLabel={true} />
      <ThemeToggleButton className="custom-class" />
    </div>
  );
}
```

### 4. CSS Variables

The theme system uses CSS variables defined in `globals.css`. Use them in your styles:

```css
.my-component {
  background-color: var(--background);
  color: var(--foreground);
  border: 1px solid var(--primary1);
}
```

Available CSS variables:
- `--background`
- `--foreground`
- `--primary1`
- `--primary2`
- `--secondary1`
- `--scrollbar-thumb`
- `--scrollbar-track`

### 5. Inline Styles with CSS Variables

```tsx
<div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
  Content
</div>
```

## How It Works

1. **Initialization**: `ThemeScript` runs before React hydrates, setting the `data-theme` attribute on `<html>` to prevent flicker.

2. **Storage**: Theme preference is stored in `localStorage` with key `theme-preference`.

3. **CSS Variables**: CSS variables are defined for both themes and switch based on the `data-theme` attribute:
   - `:root[data-theme='light']` - Light theme variables
   - `:root[data-theme='dark']` - Dark theme variables

4. **React Hook**: `useTheme()` hook provides:
   - Current theme state
   - Toggle function
   - Set theme function
   - Automatic sync with system preferences (if no manual preference is set)
   - Cross-tab synchronization

## API Reference

### `useTheme()` Hook

Returns:
- `theme: 'light' | 'dark'` - Current theme
- `toggleTheme: () => 'light' | 'dark'` - Toggle between themes
- `setTheme: (theme: 'light' | 'dark') => void` - Set specific theme

### Utility Functions

- `getTheme(): 'light' | 'dark'` - Get current theme from DOM
- `setTheme(theme: 'light' | 'dark'): void` - Set theme on DOM and localStorage
- `toggleTheme(): 'light' | 'dark'` - Toggle theme and return new theme
- `getInitialTheme(): 'light' | 'dark'` - Get initial theme (localStorage or system preference)
- `initializeTheme(): void` - Initialize theme on app load

## Best Practices

1. **Use CSS Variables**: Always use CSS variables instead of hardcoded colors
2. **Avoid Inline Theme Logic**: Use the `useTheme()` hook instead of manually checking localStorage
3. **Prevent Flicker**: The `ThemeScript` component must be in the `<head>` of your root layout
4. **Type Safety**: Use the `Theme` type from `@/utils/theme` for type safety

## Example: Complete Component

```tsx
'use client';

import { useTheme } from '@/hooks/ui/useTheme';
import { ThemeToggleButton } from '@/components/ui/ThemeToggleButton';

export function MyThemedComponent() {
  const { theme } = useTheme();

  return (
    <div
      style={{
        backgroundColor: 'var(--background)',
        color: 'var(--foreground)',
        padding: '1rem',
      }}
    >
      <h1>Current Theme: {theme}</h1>
      <ThemeToggleButton />
    </div>
  );
}
```

## Migration from Old Theme System

If you're migrating from a class-based theme system (`.dark` class), update your CSS:

**Before:**
```css
:root.dark {
  --background: #0a0a0a;
}
```

**After:**
```css
:root[data-theme='dark'] {
  --background: #0a0a0a;
}
```

## Notes

- The theme system automatically syncs with system preferences if no manual preference is set
- Theme changes are synchronized across browser tabs/windows
- The system prevents unnecessary re-renders by using MutationObserver and event listeners efficiently
- All functions are SSR-safe (check for `typeof window !== 'undefined'`)

