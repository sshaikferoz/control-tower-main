'use client';

import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    type Breakpoint,
} from '@mui/material';
import { X } from 'lucide-react';

interface AppDialogProps {
    open: boolean;
    onClose: () => void;
    title?: React.ReactNode;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: Breakpoint;
}

/**
 * Thin, theme-aware wrapper over MUI's Dialog — the shared primitive features
 * compose from. The complex behaviour (focus trap, portal, backdrop, a11y)
 * comes from MUI; colors come from the CSS-variable theme.
 */
export function AppDialog({ open, onClose, title, children, actions, maxWidth = 'sm' }: AppDialogProps) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={maxWidth}
            fullWidth
            slotProps={{
                paper: {
                    sx: {
                        // Solid app background so the modal is always readable
                        // (--widget-bg can be transparent in dark mode).
                        background: 'var(--background)',
                        color: 'var(--foreground)',
                        border: '1px solid var(--border)',
                        backgroundImage: 'none',
                    },
                },
            }}
        >
            {title != null && (
                <DialogTitle sx={{ pr: 6, color: 'var(--foreground)', fontWeight: 600 }}>
                    {title}
                    <IconButton
                        aria-label="Close"
                        onClick={onClose}
                        sx={{ position: 'absolute', right: 8, top: 8, color: 'var(--text-muted)' }}
                    >
                        <X size={18} />
                    </IconButton>
                </DialogTitle>
            )}
            <DialogContent dividers>{children}</DialogContent>
            {actions && <DialogActions>{actions}</DialogActions>}
        </Dialog>
    );
}
