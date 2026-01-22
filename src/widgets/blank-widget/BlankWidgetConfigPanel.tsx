'use client';

import React from 'react';
import { Box, Checkbox, FormControlLabel, TextField, Typography } from '@mui/material';
import { BlankWidgetConfig } from './BlankWidgetConfig.types';

interface BlankWidgetConfigPanelProps {
    value: BlankWidgetConfig;
    onChange: (config: BlankWidgetConfig) => void;
}

const defaultConfig: BlankWidgetConfig = {
    showTitle: true,
    title: '',
};

export const BlankWidgetConfigPanel: React.FC<BlankWidgetConfigPanelProps> = ({
    value = defaultConfig,
    onChange,
}) => {
    const config = { ...defaultConfig, ...value };

    return (
        <Box sx={{ color: 'white' }}>
            <Typography
                variant="caption"
                className="text-white/70 text-xs mb-2 block"
            >
                Basic display options for the blank widget.
            </Typography>

            <Box
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: 2,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1,
                }}
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config.showTitle !== false}
                            onChange={(e) =>
                                onChange({
                                    ...config,
                                    showTitle: e.target.checked,
                                })
                            }
                            sx={{
                                color: 'rgba(255, 255, 255, 0.7)',
                                '&.Mui-checked': {
                                    color: '#00d4ff',
                                },
                            }}
                        />
                    }
                    label={
                        <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                            Show Title
                        </Typography>
                    }
                />

                <Box sx={{ mt: 1.5 }}>
                    <TextField
                        fullWidth
                        size="small"
                        label="Title"
                        value={config.title || ''}
                        onChange={(e) =>
                            onChange({
                                ...config,
                                title: e.target.value,
                            })
                        }
                        InputLabelProps={{
                            sx: {
                                color: 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.75rem',
                                '&.Mui-focused': {
                                    color: 'rgba(255, 255, 255, 0.9)',
                                },
                            },
                        }}
                        inputProps={{
                            style: { color: 'white', fontSize: '0.75rem', padding: '6px 8px' },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.3)',
                                },
                                '&:hover fieldset': {
                                    borderColor: 'rgba(255, 255, 255, 0.5)',
                                },
                                '&.Mui-focused fieldset': {
                                    borderColor: '#00d4ff',
                                },
                            },
                        }}
                    />
                </Box>
            </Box>
        </Box>
    );
};

