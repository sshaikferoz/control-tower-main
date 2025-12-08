'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Grid, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export interface ColorVariant {
    id: string;
    name: string;
    colors: string[];
    gradient: {
        start: string;
        middle: string;
        end: string;
    };
}

// Professional color palettes based on Aramco brand colors
export const COLOR_VARIANTS: ColorVariant[] = [
    {
        id: 'natural',
        name: 'Natural',
        colors: ['#B9BF53', '#1C7B8B', '#C14751'],
        gradient: {
            start: '#0A1F43',
            middle: '#07284B',
            end: '#0D6691',
        },
    },
    {
        id: 'bright-cool',
        name: 'Bright Cool',
        colors: ['#BB82DB', '#31FFF3', '#21CBFF'],
        gradient: {
            start: '#0A1F43',
            middle: '#07284B',
            end: '#0D6691',
        },
    },
    {
        id: 'aramco-primary',
        name: 'Primary',
        colors: ['#84B000', '#00A3ED', '#0033A0', '#008430'],
        gradient: {
            start: '#0033A0',
            middle: '#00A3ED',
            end: '#84B000',
        },
    },
    {
        id: 'aramco-ocean',
        name: 'Ocean',
        colors: ['#00A3ED', '#26A8AB', '#0033A0', '#4FC1BB'],
        gradient: {
            start: '#0033A0',
            middle: '#00A3ED',
            end: '#26A8AB',
        },
    },
    {
        id: 'aramco-forest',
        name: 'Forest',
        colors: ['#84B000', '#008430', '#26A8AB', '#4FC1BB'],
        gradient: {
            start: '#008430',
            middle: '#84B000',
            end: '#26A8AB',
        },
    },
    {
        id: 'aramco-royal',
        name: 'Royal',
        colors: ['#0033A0', '#643278', '#00A3ED', '#398AE9'],
        gradient: {
            start: '#0033A0',
            middle: '#643278',
            end: '#00A3ED',
        },
    },
    {
        id: 'aramco-vibrant',
        name: 'Vibrant',
        colors: ['#84B000', '#FFC846', '#F05F41', '#26A8AB'],
        gradient: {
            start: '#84B000',
            middle: '#FFC846',
            end: '#F05F41',
        },
    },
    {
        id: 'aramco-sunset',
        name: 'Sunset',
        colors: ['#F05F41', '#FFC846', '#FFAA04', '#E0A76B'],
        gradient: {
            start: '#F05F41',
            middle: '#FFAA04',
            end: '#FFC846',
        },
    },
    {
        id: 'aramco-purple-dream',
        name: 'Purple Dream',
        colors: ['#643278', '#906CA6', '#398AE9', '#00A3ED'],
        gradient: {
            start: '#643278',
            middle: '#906CA6',
            end: '#398AE9',
        },
    },
    {
        id: 'aramco-teal-fresh',
        name: 'Teal Fresh',
        colors: ['#26A8AB', '#4FC1BB', '#00A3ED', '#498BB2'],
        gradient: {
            start: '#26A8AB',
            middle: '#4FC1BB',
            end: '#00A3ED',
        },
    },
    {
        id: 'aramco-earth',
        name: 'Earth',
        colors: ['#008430', '#84B000', '#9DC45E', '#C9BD31'],
        gradient: {
            start: '#008430',
            middle: '#84B000',
            end: '#9DC45E',
        },
    },
    {
        id: 'aramco-professional',
        name: 'Professional',
        colors: ['#0033A0', '#5F6369', '#323232', '#00A3ED'],
        gradient: {
            start: '#0033A0',
            middle: '#5F6369',
            end: '#00A3ED',
        },
    },
    {
        id: 'aramco-energy',
        name: 'Energy',
        colors: ['#84B000', '#FFC846', '#F05F41', '#643278'],
        gradient: {
            start: '#84B000',
            middle: '#FFC846',
            end: '#F05F41',
        },
    },
    {
        id: 'aramco-cool',
        name: 'Cool',
        colors: ['#00A3ED', '#26A8AB', '#4FC1BB', '#398AE9'],
        gradient: {
            start: '#00A3ED',
            middle: '#26A8AB',
            end: '#4FC1BB',
        },
    },
    {
        id: 'aramco-warm',
        name: 'Warm',
        colors: ['#FFC846', '#FFAA04', '#F05F41', '#E0A76B'],
        gradient: {
            start: '#FFC846',
            middle: '#FFAA04',
            end: '#F05F41',
        },
    },
    {
        id: 'aramco-balanced',
        name: 'Balanced',
        colors: ['#84B000', '#00A3ED', '#643278', '#FFC846'],
        gradient: {
            start: '#84B000',
            middle: '#00A3ED',
            end: '#643278',
        },
    },
    {
        id: 'aramco-modern',
        name: 'Modern',
        colors: ['#26A8AB', '#643278', '#398AE9', '#84B000'],
        gradient: {
            start: '#26A8AB',
            middle: '#643278',
            end: '#398AE9',
        },
    },
];

interface ColorVariantPickerProps {
    selectedVariant?: string;
    onVariantSelect: (variant: ColorVariant) => void;
    onColorSelect?: (color: string) => void;
    showGradient?: boolean;
    compact?: boolean;
    customVariants?: ColorVariant[];
}

const ColorVariantPicker: React.FC<ColorVariantPickerProps> = ({
    selectedVariant,
    onVariantSelect,
    onColorSelect,
    showGradient = true,
    compact = false,
    customVariants = [],
}) => {
    // Merge default variants with custom variants
    const allVariants = [...COLOR_VARIANTS, ...customVariants];

    const handleVariantClick = (variant: ColorVariant) => {
        onVariantSelect(variant);
    };

    const handleColorClick = (color: string, variant: ColorVariant) => {
        onColorSelect?.(color);
        // Also select the variant if a color is clicked
        onVariantSelect(variant);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Accordion
                defaultExpanded={true}
                sx={{
                    backgroundColor: 'transparent',
                    boxShadow: 'none',
                    '&:before': {
                        display: 'none',
                    },
                    '&.Mui-expanded': {
                        margin: 0,
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon sx={{ color: 'white' }} />}
                    sx={{
                        backgroundColor: 'transparent',
                        minHeight: '48px',
                        '&.Mui-expanded': {
                            minHeight: '48px',
                        },
                        '& .MuiAccordionSummary-content': {
                            margin: '12px 0',
                            '&.Mui-expanded': {
                                margin: '12px 0',
                            },
                        },
                    }}
                >
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'white',
                            fontWeight: 500,
                        }}
                    >
                        Color Variant
                    </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: '16px 0' }}>
                    <Box
                        sx={{
                            height: '400px',
                            overflowY: 'auto',
                            overflowX: 'hidden',
                            paddingRight: '8px',
                            '&::-webkit-scrollbar': {
                                width: '8px',
                            },
                            '&::-webkit-scrollbar-track': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderRadius: '4px',
                            },
                            '&::-webkit-scrollbar-thumb': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                borderRadius: '4px',
                                '&:hover': {
                                    backgroundColor: 'rgba(255, 255, 255, 0.5)',
                                },
                            },
                        }}
                    >
                        <Grid container spacing={2}>
                            {allVariants.map((variant) => {
                                const isSelected = selectedVariant === variant.id;
                                const isCustom = customVariants.some((cv) => cv.id === variant.id);
                                return (
                                    <Grid item xs={12} sm={6} md={4} key={variant.id}>
                                        <Card
                                            sx={{
                                                height: '100%',
                                                minHeight: '180px',
                                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                                border: isSelected
                                                    ? '2px solid #00d4ff'
                                                    : '2px solid rgba(255, 255, 255, 0.2)',
                                                borderRadius: '8px',
                                                cursor: 'pointer',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                '&:hover': {
                                                    borderColor: '#00d4ff',
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
                                                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                                                },
                                            }}
                                            onClick={() => handleVariantClick(variant)}
                                        >
                                            <CardContent
                                                sx={{
                                                    p: compact ? 1.5 : 2,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    height: '100%',
                                                    flex: 1,
                                                }}
                                            >
                                                {/* Header with variant name and checkmark */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        marginBottom: 1.5,
                                                    }}
                                                >
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <Typography
                                                            variant="subtitle2"
                                                            sx={{
                                                                color: 'white',
                                                                fontWeight: 600,
                                                                fontSize: compact ? '0.875rem' : '1rem',
                                                            }}
                                                        >
                                                            {variant.name}
                                                        </Typography>
                                                        {isCustom && (
                                                            <Box
                                                                sx={{
                                                                    fontSize: '0.65rem',
                                                                    backgroundColor: '#00d4ff20',
                                                                    color: '#00d4ff',
                                                                    px: 0.5,
                                                                    py: 0.25,
                                                                    borderRadius: '4px',
                                                                }}
                                                            >
                                                                Custom
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    {isSelected && (
                                                        <CheckCircleIcon
                                                            sx={{
                                                                color: '#00d4ff',
                                                                fontSize: compact ? '1.2rem' : '1.5rem',
                                                            }}
                                                        />
                                                    )}
                                                </Box>

                                                {/* Gradient preview */}
                                                {showGradient && (
                                                    <Box
                                                        sx={{
                                                            height: compact ? 30 : 40,
                                                            background: `linear-gradient(to bottom, ${variant.gradient.start} 0%, ${variant.gradient.middle} 45%, ${variant.gradient.end} 100%)`,
                                                            borderRadius: '4px',
                                                            marginBottom: 1.5,
                                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                                        }}
                                                    />
                                                )}

                                                {/* Color palette */}
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        gap: 1,
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    {variant.colors.map((color, index) => (
                                                        <Box
                                                            key={index}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleColorClick(color, variant);
                                                            }}
                                                            sx={{
                                                                flex: 1,
                                                                aspectRatio: '1',
                                                                backgroundColor: color,
                                                                borderRadius: '4px',
                                                                border: '2px solid rgba(255, 255, 255, 0.3)',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s ease',
                                                                '&:hover': {
                                                                    transform: 'scale(1.1)',
                                                                    boxShadow: `0 0 8px ${color}80`,
                                                                    borderColor: '#00d4ff',
                                                                },
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default ColorVariantPicker;
