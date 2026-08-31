'use client';

import { AppBar, Toolbar, Typography, IconButton, Button, Tooltip } from '@mui/material';
import { Moon, Sun, Pencil, Save, Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface DashboardToolbarProps {
    title: string;
    isAdmin: boolean;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    onOpenConfig: () => void;
}

/**
 * App bar for the dashboard shell. MUI provides the AppBar/Toolbar/Button
 * behaviour; colors come from the CSS-variable theme; Tailwind handles spacing.
 */
export function DashboardToolbar({
    title,
    isAdmin,
    isEditMode,
    onToggleEditMode,
    onOpenConfig,
}: DashboardToolbarProps) {
    const { theme, toggleTheme } = useTheme();

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                background: 'var(--header-bg)',
                color: 'var(--header-title)',
                borderBottom: '1px solid var(--border)',
            }}
        >
            <Toolbar className="gap-2">
                <Typography
                    variant="h6"
                    component="h1"
                    sx={{ flexGrow: 1, fontWeight: 600, color: 'var(--header-title)' }}
                >
                    {title}
                </Typography>

                <Tooltip title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>
                    <IconButton onClick={toggleTheme} aria-label="Toggle theme" sx={{ color: 'var(--header-icon)' }}>
                        {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                    </IconButton>
                </Tooltip>

                {isAdmin && (
                    <>
                        <Tooltip title="UI Configuration">
                            <IconButton
                                onClick={onOpenConfig}
                                aria-label="Open configuration"
                                sx={{ color: 'var(--header-icon)' }}
                            >
                                <Settings size={20} />
                            </IconButton>
                        </Tooltip>

                        <Button
                            variant={isEditMode ? 'contained' : 'outlined'}
                            startIcon={isEditMode ? <Save size={18} /> : <Pencil size={18} />}
                            onClick={onToggleEditMode}
                            sx={
                                isEditMode
                                    ? { backgroundColor: 'var(--secondary1)', color: '#fff' }
                                    : { borderColor: 'var(--primary2)', color: 'var(--primary2)' }
                            }
                        >
                            {isEditMode ? 'Save Layout' : 'Edit'}
                        </Button>
                    </>
                )}
            </Toolbar>
        </AppBar>
    );
}
