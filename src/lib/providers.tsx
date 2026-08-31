'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider as MuiThemeProvider, CssBaseline } from '@mui/material';
import { store } from '@/store/store';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { createAppMuiTheme } from '@/themes/muiTheme';

/**
 * Bridges the app's CSS-variable theme (ThemeContext / `data-theme`) into MUI:
 * rebuilds the MUI theme whenever the light/dark mode flips so MUI components
 * track the same source of truth as Tailwind and the CSS variables.
 * Must live *inside* ThemeProvider so `useTheme()` is available.
 */
function MuiThemeBridge({ children }: { children: ReactNode }) {
    const { theme } = useTheme();
    const muiTheme = useMemo(() => createAppMuiTheme(theme), [theme]);

    return (
        <MuiThemeProvider theme={muiTheme}>
            <CssBaseline enableColorScheme />
            {children}
        </MuiThemeProvider>
    );
}

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnWindowFocus: false,
                        retry: 1,
                        staleTime: 5 * 60 * 1000, // 5 minutes
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <Provider store={store}>
                <ThemeProvider>
                    <MuiThemeBridge>{children}</MuiThemeBridge>
                </ThemeProvider>
            </Provider>
        </QueryClientProvider>
    );
}
