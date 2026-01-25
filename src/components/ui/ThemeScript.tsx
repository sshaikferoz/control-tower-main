/**
 * Theme initialization script
 * This script runs before React hydrates to prevent theme flicker
 * It must be placed in the <head> or at the start of <body>
 */

export function ThemeScript() {
  const themeScript = `
    (function() {
      const THEME_ATTRIBUTE = 'data-theme';
      const DARK_THEME = 'dark';

      try {
        document.documentElement.setAttribute(THEME_ATTRIBUTE, DARK_THEME);
        // Keep compatibility with components that rely on the "dark" class (e.g. chart theming).
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } catch (e) {
        // Ignore errors
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

