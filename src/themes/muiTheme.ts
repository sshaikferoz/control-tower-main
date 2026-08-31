import { createTheme, type Theme } from '@mui/material/styles';
import type { ThemeMode } from '@/contexts/ThemeContext';

/**
 * App-wide MUI theme, kept in step with the CSS-variable theme system
 * (`globals.css` + `THEME_SYSTEM.md`) driven by the `data-theme` attribute.
 *
 * Why concrete colors instead of `var(--x)`: MUI runs color math
 * (`alpha()`, `lighten()`, `darken()`) on palette colors at render time, and
 * that math cannot parse a CSS variable — it throws
 * "Unsupported `var(--x)` color". So the palette uses concrete values that
 * MIRROR the CSS tokens below, chosen per light/dark mode. The CSS variables
 * remain the source of truth for Tailwind/inline styling; keep these token
 * values in sync with `globals.css` (or migrate to MUI's `cssVariables` later).
 */

const TOKENS = {
    light: {
        primary: '#00A3E0', // --primary2
        secondary: '#293366', // --secondary1
        background: '#FFFFFF', // --background
        paper: '#FFFFFF', // --widget-bg
        text: '#293366', // --foreground
        textSecondary: '#8088A3', // --text-muted
        divider: '#E8E9EE', // --border
    },
    dark: {
        primary: '#a396ff', // --primary2
        secondary: '#1a4d8f', // --secondary1
        background: '#0a1a35', // --background
        paper: '#0f2647', // elevated surface (‑‑widget-bg is transparent in dark)
        text: '#ededed', // --foreground
        textSecondary: '#a0aec0', // --text-muted
        divider: 'rgba(255,255,255,0.12)', // --border
    },
} as const;

const FONT_FAMILY =
    "'Poppins', system-ui, 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif";

export function createAppMuiTheme(mode: ThemeMode): Theme {
    const t = TOKENS[mode];

    return createTheme({
        palette: {
            mode,
            primary: { main: t.primary },
            secondary: { main: t.secondary },
            background: { default: t.background, paper: t.paper },
            text: { primary: t.text, secondary: t.textSecondary },
            divider: t.divider,
        },
        shape: { borderRadius: 10 },
        typography: {
            fontFamily: FONT_FAMILY,
            fontWeightRegular: 300,
            button: { textTransform: 'none', fontWeight: 500 },
        },
        components: {
            MuiButton: { defaultProps: { disableElevation: true } },
            // Avoid MUI's elevation gradient so surfaces read cleanly.
            MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
        },
    });
}
