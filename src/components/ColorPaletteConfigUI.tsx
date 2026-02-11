'use client';

import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { ColorVariant, COLOR_VARIANTS } from './ColorVariantPicker';
import { HexColorPicker } from 'react-colorful';

interface ColorPaletteConfigUIProps {
    customVariants: ColorVariant[];
    onChange: (customVariants: ColorVariant[]) => void;
}

// Utility function for hex validation
const isValidHex = (hex: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
};

const ColorPaletteConfigUI: React.FC<ColorPaletteConfigUIProps> = ({
    customVariants = [],
    onChange,
}) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [editingVariant, setEditingVariant] = useState<ColorVariant | null>(null);
    const [newVariant, setNewVariant] = useState<Partial<ColorVariant>>({
        name: '',
        colors: ['#000000', '#000000', '#000000', '#000000'],
        gradient: {
            start: '#000000',
            middle: '#000000',
            end: '#000000',
        },
    });
    const [editingColorIndex, setEditingColorIndex] = useState<number | null>(null);
    const [editingGradientColor, setEditingGradientColor] = useState<'start' | 'middle' | 'end' | null>(null);
    const [hexInputs, setHexInputs] = useState<Record<number, string>>({});
    const [gradientHexInputs, setGradientHexInputs] = useState<Record<string, string>>({});

    const handleCreateNew = () => {
        const defaultColors = ['#84B000', '#00A3ED', '#0033A0', '#008430'];
        setNewVariant({
            name: '',
            colors: defaultColors,
            gradient: {
                start: '#0033A0',
                middle: '#00A3ED',
                end: '#84B000',
            },
        });
        const hexInputsInit: Record<number, string> = {};
        defaultColors.forEach((color, index) => {
            hexInputsInit[index] = color;
        });
        setHexInputs(hexInputsInit);
        const gradientHexInit: Record<string, string> = {
            start: '#0033A0',
            middle: '#00A3ED',
            end: '#84B000',
        };
        setGradientHexInputs(gradientHexInit);
        setEditingVariant(null);
        setIsCreateDialogOpen(true);
    };

    const handleEdit = (variant: ColorVariant) => {
        setEditingVariant(variant);
        setNewVariant({
            name: variant.name,
            colors: [...variant.colors],
            gradient: { ...variant.gradient },
        });
        const hexInputsInit: Record<number, string> = {};
        variant.colors.forEach((color, index) => {
            hexInputsInit[index] = color;
        });
        setHexInputs(hexInputsInit);
        const gradientHexInit: Record<string, string> = {
            start: variant.gradient.start,
            middle: variant.gradient.middle,
            end: variant.gradient.end,
        };
        setGradientHexInputs(gradientHexInit);
        setIsCreateDialogOpen(true);
    };

    const handleDelete = (variantId: string) => {
        const updated = customVariants.filter((v) => v.id !== variantId);
        onChange(updated);
    };

    const handleSave = () => {
        if (!newVariant.name || !newVariant.colors || !newVariant.gradient) return;

        const variant: ColorVariant = {
            id: editingVariant?.id || `custom-${Date.now()}`,
            name: newVariant.name,
            colors: newVariant.colors,
            gradient: newVariant.gradient,
        };

        if (editingVariant) {
            const updated = customVariants.map((v) => (v.id === editingVariant.id ? variant : v));
            onChange(updated);
        } else {
            onChange([...customVariants, variant]);
        }

        setIsCreateDialogOpen(false);
        setEditingVariant(null);
        setEditingColorIndex(null);
        setEditingGradientColor(null);
    };

    const handleCancel = () => {
        setIsCreateDialogOpen(false);
        setEditingVariant(null);
        setEditingColorIndex(null);
        setEditingGradientColor(null);
        setHexInputs({});
        setGradientHexInputs({});
    };

    const updateColor = (index: number, color: string) => {
        if (!newVariant.colors) return;
        const updatedColors = [...newVariant.colors];
        updatedColors[index] = color;
        setNewVariant({ ...newVariant, colors: updatedColors });
        setHexInputs({ ...hexInputs, [index]: color });
    };

    const handleHexInputChange = (index: number, hex: string) => {
        setHexInputs({ ...hexInputs, [index]: hex });
        if (isValidHex(hex)) {
            updateColor(index, hex);
        }
    };

    const updateGradientColor = (type: 'start' | 'middle' | 'end', color: string) => {
        if (!newVariant.gradient) return;
        setNewVariant({
            ...newVariant,
            gradient: { ...newVariant.gradient, [type]: color },
        });
        setGradientHexInputs({ ...gradientHexInputs, [type]: color });
    };

    const handleGradientHexInputChange = (type: 'start' | 'middle' | 'end', hex: string) => {
        setGradientHexInputs({ ...gradientHexInputs, [type]: hex });
        if (isValidHex(hex)) {
            updateGradientColor(type, hex);
        }
    };

    const addColor = () => {
        if (!newVariant.colors) return;
        const newColor = '#000000';
        const newIndex = newVariant.colors.length;
        setNewVariant({
            ...newVariant,
            colors: [...newVariant.colors, newColor],
        });
        setHexInputs({ ...hexInputs, [newIndex]: newColor });
    };

    const removeColor = (index: number) => {
        if (!newVariant.colors || newVariant.colors.length <= 1) return;
        const updatedColors = newVariant.colors.filter((_, i) => i !== index);
        setNewVariant({ ...newVariant, colors: updatedColors });
    };

    useEffect(() => {
        if (!isCreateDialogOpen) return;
        const onEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleCancel();
        };
        document.addEventListener('keydown', onEscape);
        return () => document.removeEventListener('keydown', onEscape);
    }, [isCreateDialogOpen]);

    return (
        <div className="text-white">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Color Palettes</h2>
                <button
                    type="button"
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 rounded-lg bg-[#00A3ED] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0088C7]"
                >
                    <PlusIcon className="h-5 w-5" />
                    Create New Palette
                </button>
            </div>

            <p className="mb-6 text-sm text-white/70">
                Manage color palettes available in the mapping screen. Default palettes are shown below, and you can create custom ones.
            </p>

            {/* Default Variants Section */}
            <div className="mb-8">
                <h3 className="mb-4 text-sm font-semibold text-white">
                    Default Palettes ({COLOR_VARIANTS.length})
                </h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {COLOR_VARIANTS.map((variant) => (
                        <div
                            key={variant.id}
                            className="flex min-h-[180px] flex-col rounded-lg border-2 border-white/20 bg-white/5 p-4"
                        >
                            <div className="mb-3 flex items-center justify-between">
                                <span className="text-sm font-semibold text-white">{variant.name}</span>
                                <span className="rounded-full bg-[#84BD00]/20 px-2.5 py-0.5 text-xs font-medium text-[#84BD00]">
                                    Default
                                </span>
                            </div>
                            <div
                                className="mb-3 h-10 rounded border border-white/10"
                                style={{
                                    background: `linear-gradient(to bottom, ${variant.gradient.start} 0%, ${variant.gradient.middle} 45%, ${variant.gradient.end} 100%)`,
                                }}
                            />
                            <div className="flex flex-1 gap-1">
                                {variant.colors.map((color, index) => (
                                    <div
                                        key={index}
                                        className="flex-1 rounded border-2 border-white/30"
                                        style={{ aspectRatio: '1', backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Custom Variants Section */}
            {customVariants.length > 0 && (
                <div>
                    <div className="my-6 border-t border-white/10" />
                    <h3 className="mb-4 text-sm font-semibold text-white">
                        Custom Palettes ({customVariants.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                        {customVariants.map((variant) => (
                            <div
                                key={variant.id}
                                className="relative flex min-h-[180px] flex-col rounded-lg border-2 border-cyan-400/30 bg-white/5 p-4"
                            >
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-sm font-semibold text-white">{variant.name}</span>
                                    <div className="flex gap-1">
                                        <button
                                            type="button"
                                            onClick={() => handleEdit(variant)}
                                            className="rounded p-1.5 text-cyan-400 transition-colors hover:bg-cyan-400/20"
                                        >
                                            <PencilSquareIcon className="h-4 w-4" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(variant.id)}
                                            className="rounded p-1.5 text-[#E1553F] transition-colors hover:bg-red-500/20"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                                <div
                                    className="mb-3 h-10 rounded border border-white/10"
                                    style={{
                                        background: `linear-gradient(to bottom, ${variant.gradient.start} 0%, ${variant.gradient.middle} 45%, ${variant.gradient.end} 100%)`,
                                    }}
                                />
                                <div className="flex flex-1 gap-1">
                                    {variant.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="flex-1 rounded border-2 border-white/30"
                                            style={{ aspectRatio: '1', backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Create/Edit Dialog */}
            {isCreateDialogOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={handleCancel}
                        aria-hidden
                    />
                    <div
                        className="relative z-10 w-full max-w-2xl max-h-[90vh] flex flex-col rounded-lg border border-white/10 bg-[#1a3a6b] shadow-xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="dialog-title"
                    >
                        <h2 id="dialog-title" className="px-6 py-4 text-lg font-semibold text-white">
                            {editingVariant ? 'Edit Color Palette' : 'Create New Color Palette'}
                        </h2>
                        <div className="flex-1 overflow-y-auto px-6 pb-4">
                            <div className="mt-2">
                                <label className="mb-2 block text-xs font-medium text-white/70">
                                    Palette Name
                                </label>
                                <input
                                    type="text"
                                    value={newVariant.name || ''}
                                    onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                                    className="mb-6 w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                    placeholder="Palette Name"
                                />

                                <h4 className="mb-3 text-sm font-semibold text-white">Colors</h4>
                                <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                                    {newVariant.colors?.map((color, index) => (
                                        <div key={index}>
                                            <button
                                                type="button"
                                                onClick={() => setEditingColorIndex(editingColorIndex === index ? null : index)}
                                                className={`mb-2 w-full rounded border-2 transition-colors ${editingColorIndex === index
                                                    ? 'border-cyan-400'
                                                    : 'border-white/30 hover:border-white/50'
                                                    }`}
                                                style={{ aspectRatio: '1', backgroundColor: color }}
                                            />
                                            {editingColorIndex === index && (
                                                <div className="mt-2">
                                                    <HexColorPicker
                                                        color={color}
                                                        onChange={(newColor) => updateColor(index, newColor)}
                                                        className="mb-3"
                                                    />
                                                    <label className="mb-1 block text-xs font-medium text-white/70">
                                                        Hex
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={hexInputs[index] || color}
                                                        onChange={(e) => handleHexInputChange(index, e.target.value)}
                                                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm uppercase text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                                        maxLength={7}
                                                    />
                                                </div>
                                            )}
                                            {newVariant.colors && newVariant.colors.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeColor(index)}
                                                    className="mt-1 rounded p-1 text-[#E1553F] transition-colors hover:bg-red-500/20"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addColor}
                                        className="flex min-h-[60px] flex-col items-center justify-center gap-2 rounded-lg border border-white/30 py-3 text-sm text-white transition-colors hover:border-cyan-400 hover:bg-white/5"
                                    >
                                        <PlusIcon className="h-5 w-5" />
                                        Add Color
                                    </button>
                                </div>

                                <h4 className="mb-3 text-sm font-semibold text-white">Gradient</h4>
                                <div className="mb-4">
                                    <div
                                        className="mb-4 h-14 rounded border-2 border-white/30"
                                        style={{
                                            background: `linear-gradient(to right, ${newVariant.gradient?.start || '#000'} 0%, ${newVariant.gradient?.middle || '#000'} 50%, ${newVariant.gradient?.end || '#000'} 100%)`,
                                        }}
                                    />
                                    <div className="grid grid-cols-3 gap-4">
                                        {(['start', 'middle', 'end'] as const).map((type) => (
                                            <div key={type}>
                                                <span className="mb-2 block text-xs font-medium text-white/70">
                                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setEditingGradientColor(editingGradientColor === type ? null : type)
                                                    }
                                                    className={`mb-2 w-full rounded border-2 transition-colors ${editingGradientColor === type
                                                        ? 'border-cyan-400'
                                                        : 'border-white/30 hover:border-white/50'
                                                        }`}
                                                    style={{
                                                        aspectRatio: '1',
                                                        backgroundColor: newVariant.gradient?.[type] || '#000',
                                                    }}
                                                />
                                                {editingGradientColor === type && (
                                                    <div className="mt-2">
                                                        <HexColorPicker
                                                            color={newVariant.gradient?.[type] || '#000'}
                                                            onChange={(newColor) => updateGradientColor(type, newColor)}
                                                            className="mb-3"
                                                        />
                                                        <label className="mb-1 block text-xs font-medium text-white/70">
                                                            Hex
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={
                                                                gradientHexInputs[type] ||
                                                                newVariant.gradient?.[type] ||
                                                                '#000'
                                                            }
                                                            onChange={(e) =>
                                                                handleGradientHexInputChange(type, e.target.value)
                                                            }
                                                            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm uppercase text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                                            maxLength={7}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 border-t border-white/10 px-6 py-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={
                                    !newVariant.name ||
                                    !newVariant.colors ||
                                    newVariant.colors.length === 0
                                }
                                className="rounded-lg bg-[#00A3ED] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0088C7] disabled:opacity-50 disabled:hover:bg-[#00A3ED]"
                            >
                                {editingVariant ? 'Update' : 'Create'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ColorPaletteConfigUI;
