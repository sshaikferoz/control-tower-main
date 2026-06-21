import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    Tooltip,
    Divider,
    Typography,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { useTheme } from '@/contexts/ThemeContext';

export interface WidgetVisibilityItem {
    sectionId: string;
    sectionName: string;
    widgetId: string;
    widgetTitle: string;
    widgetDescription: string;
    hidden: boolean;
}

interface WidgetVisibilityDialogProps {
    open: boolean;
    items: WidgetVisibilityItem[];
    onClose: () => void;
    onToggle: (sectionId: string, widgetId: string, hidden: boolean) => void;
}

export const WidgetVisibilityDialog: React.FC<WidgetVisibilityDialogProps> = ({
    open,
    items,
    onClose,
    onToggle,
}) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const paperBackground = isDark ? 'rgba(10, 26, 53, 0.96)' : 'var(--widget-surface)';
    const panelBackground = isDark ? 'rgba(8, 20, 42, 0.92)' : 'var(--widget-bg)';
    const itemBackground = isDark ? 'rgba(255, 255, 255, 0.05)' : 'var(--widget-bg)';
    const borderColor = isDark ? 'rgba(255, 255, 255, 0.2)' : 'var(--widget-border)';
    const iconBackground = isDark ? 'rgba(255, 255, 255, 0.08)' : 'var(--widget-surface)';
    const iconHoverBackground = isDark ? 'rgba(255, 255, 255, 0.16)' : 'var(--widget-surface-hover)';

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    background: paperBackground,
                    color: 'var(--foreground)',
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    boxShadow: 'var(--widget-shadow)',
                },
            }}
        >
            <DialogTitle
                sx={{
                    color: 'var(--foreground)',
                    borderBottom: `1px solid ${borderColor}`,
                    background: panelBackground,
                }}
            >
                Widget Visibility
            </DialogTitle>
            <DialogContent dividers sx={{ borderColor, background: paperBackground }}>
                {items.length === 0 ? (
                    <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                        No widgets found for this tab.
                    </Typography>
                ) : (
                    items.map((item, index) => (
                        <div key={`${item.sectionId}-${item.widgetId}`}>
                            <div
                                className="flex items-start justify-between gap-4 py-2 px-2 rounded-md"
                                style={{
                                    background: itemBackground,
                                    border: `1px solid ${borderColor}`,
                                }}
                            >
                                <div>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'var(--foreground)' }}>
                                        {item.widgetTitle}
                                    </Typography>
                                    <Typography variant="caption" sx={{ display: 'block', color: 'var(--text-muted)' }}>
                                        Section: {item.sectionName}
                                    </Typography>
                                    {item.widgetDescription && (
                                        <Typography variant="body2" sx={{ color: 'var(--text-muted)' }}>
                                            {item.widgetDescription}
                                        </Typography>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Typography variant="caption" sx={{ color: 'var(--section-title)', fontWeight: 600 }}>
                                        {item.hidden ? 'Hidden' : 'Visible'}
                                    </Typography>
                                    <Tooltip title={item.hidden ? 'Show widget' : 'Hide widget'}>
                                        <IconButton
                                            onClick={() => onToggle(item.sectionId, item.widgetId, !item.hidden)}
                                            size="small"
                                            sx={{
                                                color: item.hidden ? 'var(--text-muted)' : 'var(--foreground)',
                                                background: iconBackground,
                                                border: `1px solid ${borderColor}`,
                                                '&:hover': { background: iconHoverBackground },
                                            }}
                                        >
                                            {item.hidden ? (
                                                <VisibilityOffIcon fontSize="small" />
                                            ) : (
                                                <VisibilityIcon fontSize="small" />
                                            )}
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            </div>
                            {index < items.length - 1 && <Divider sx={{ borderColor, my: 1 }} />}
                        </div>
                    ))
                )}
            </DialogContent>
            <DialogActions sx={{ borderTop: `1px solid ${borderColor}`, background: panelBackground }}>
                <Button
                    onClick={onClose}
                    variant="contained"
                    sx={{
                        backgroundColor: 'var(--secondary1)',
                        color: 'white',
                        '&:hover': { backgroundColor: 'var(--secondary1)', opacity: 0.9 },
                    }}
                >
                    Done
                </Button>
            </DialogActions>
        </Dialog>
    );
};
