/**
 * Theme initialization script
 * This script runs before React hydrates to prevent theme flicker
 * It must be placed in the <head> or at the start of <body>
 * Reads theme from localStorage (control-tower-theme) and applies it
 */

export function ThemeScript() {
  const themeScript = `
    (function() {
      const THEME_ATTRIBUTE = 'data-theme';
      const STORAGE_KEY = 'control-tower-theme';
      const DARK_THEME = 'dark';
      const LIGHT_THEME = 'light';

      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        var theme = (stored === LIGHT_THEME || stored === DARK_THEME) ? stored : DARK_THEME;
        document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
      } catch (e) {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, DARK_THEME);
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

