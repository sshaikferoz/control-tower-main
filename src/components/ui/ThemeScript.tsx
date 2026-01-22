/**
 * Theme initialization script
 * This script runs before React hydrates to prevent theme flicker
 * It must be placed in the <head> or at the start of <body>
 */

export function ThemeScript() {
  const themeScript = `
    (function() {
      const THEME_STORAGE_KEY = 'theme-preference';
      const THEME_ATTRIBUTE = 'data-theme';
      
      function getInitialTheme() {
        try {
          const stored = localStorage.getItem(THEME_STORAGE_KEY);
          if (stored === 'light' || stored === 'dark') {
            return stored;
          }
        } catch (e) {
          // localStorage not available
        }
        
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      
      function setTheme(theme) {
        try {
          document.documentElement.setAttribute(THEME_ATTRIBUTE, theme);
          localStorage.setItem(THEME_STORAGE_KEY, theme);
        } catch (e) {
          // Ignore errors
        }
      }
      
      const theme = getInitialTheme();
      setTheme(theme);
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

