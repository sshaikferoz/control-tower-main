'use client';

import React, { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';

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
    const [isOpen, setIsOpen] = useState(true);

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
        <div className="w-full text-white">
            {/* Header / Accordion toggle */}
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-left transition-colors hover:bg-white/10"
            >
                <span className="text-sm font-medium text-white">Color Variant</span>
                {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-white/70" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-white/70" />
                )}
            </button>

            {isOpen && (
                <div className="mt-3 h-[400px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                        {allVariants.map((variant) => {
                            const isSelected = selectedVariant === variant.id;
                            const isCustom = customVariants.some((cv) => cv.id === variant.id);

                            return (
                                <button
                                    key={variant.id}
                                    type="button"
                                    onClick={() => handleVariantClick(variant)}
                                    className={`flex min-h-[180px] flex-col rounded-lg border-2 bg-white/5 p-3 text-left transition-all ${isSelected
                                            ? 'border-cyan-400 shadow-[0_4px_12px_rgba(0,212,255,0.3)]'
                                            : 'border-white/20 hover:border-cyan-400 hover:bg-white/10 hover:shadow-[0_4px_12px_rgba(0,212,255,0.3)]'
                                        } ${compact ? 'p-3' : 'p-4'}`}
                                >
                                    {/* Header with variant name and checkmark */}
                                    <div className="mb-3 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`font-semibold text-white ${compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'
                                                    }`}
                                            >
                                                {variant.name}
                                            </span>
                                            {isCustom && (
                                                <span className="rounded px-1.5 py-0.5 text-[0.65rem] font-medium text-cyan-400 bg-cyan-400/10">
                                                    Custom
                                                </span>
                                            )}
                                        </div>
                                        {isSelected && (
                                            <CheckCircleIcon
                                                className={`text-cyan-400 ${compact ? 'h-4 w-4' : 'h-5 w-5'
                                                    }`}
                                            />
                                        )}
                                    </div>

                                    {/* Gradient preview */}
                                    {showGradient && (
                                        <div
                                            className="mb-3 rounded border border-white/10"
                                            style={{
                                                height: compact ? 30 : 40,
                                                background: `linear-gradient(to bottom, ${variant.gradient.start} 0%, ${variant.gradient.middle} 45%, ${variant.gradient.end} 100%)`,
                                            }}
                                        />
                                    )}

                                    {/* Color palette */}
                                    <div className="flex items-center gap-1">
                                        {variant.colors.map((color, index) => (
                                            <div
                                                key={index}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleColorClick(color, variant);
                                                }}
                                                className="flex-1 cursor-pointer rounded border-2 border-white/30 transition-transform duration-150 hover:scale-110 hover:border-cyan-400"
                                                style={{
                                                    aspectRatio: '1',
                                                    backgroundColor: color,
                                                    boxShadow: `0 0 0 rgba(0,0,0,0)`,
                                                }}
                                            />
                                        ))}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorVariantPicker;
