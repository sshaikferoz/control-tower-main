'use client';

import React, { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    PaintBrushIcon,
    ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { TypographyConfig, WidgetTypographyConfig } from '@/helpers/types';

const FONT_FAMILIES = [
    { value: '', label: 'Default' },
    { value: 'Poppins, sans-serif', label: 'Poppins' },
    { value: 'Inter, sans-serif', label: 'Inter' },
    { value: 'Roboto, sans-serif', label: 'Roboto' },
    { value: 'Open Sans, sans-serif', label: 'Open Sans' },
    { value: 'Montserrat, sans-serif', label: 'Montserrat' },
    { value: 'Lato, sans-serif', label: 'Lato' },
    { value: 'Manifa2, sans-serif', label: 'Manifa2' },
    { value: 'Georgia, serif', label: 'Georgia' },
    { value: 'Courier New, monospace', label: 'Courier New' },
];

const FONT_WEIGHTS = [
    { value: '', label: 'Default' },
    { value: '300', label: '300 (Light)' },
    { value: '400', label: '400 (Regular)' },
    { value: '500', label: '500 (Medium)' },
    { value: '600', label: '600 (Semi Bold)' },
    { value: '700', label: '700 (Bold)' },
    { value: '800', label: '800 (Extra Bold)' },
    { value: '900', label: '900 (Black)' },
];

const FONT_SIZES = [
    { value: '', label: 'Default' },
    { value: '12px', label: '12px' },
    { value: '14px', label: '14px' },
    { value: '16px', label: '16px' },
    { value: '18px', label: '18px' },
    { value: '20px', label: '20px' },
    { value: '24px', label: '24px' },
    { value: '28px', label: '28px' },
    { value: '32px', label: '32px' },
];

interface TypographyConfigUIProps {
    value?: WidgetTypographyConfig;
    onChange: (config: WidgetTypographyConfig) => void;
    elementTypes?: string[];
}

// Collapsible Section Component
interface CollapsibleSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    icon?: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, defaultOpen = true, children, icon }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
                <div className="flex items-center gap-2">
                    {icon && <div className="text-white/70">{icon}</div>}
                    <h3 className="text-sm font-semibold text-white">{title}</h3>
                </div>
                {isOpen ? (
                    <ChevronUpIcon className="h-5 w-5 text-white/70" />
                ) : (
                    <ChevronDownIcon className="h-5 w-5 text-white/70" />
                )}
            </button>
            {isOpen && <div className="border-t border-white/10 px-4 py-3">{children}</div>}
        </div>
    );
};

// Custom Select Component
interface CustomSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, placeholder }) => {
    return (
        <div className="mb-4 flex flex-col gap-2">
            <label className="block text-xs font-medium text-white/70">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    style={value && options.find(opt => opt.value === value)?.value.includes('font')
                        ? { fontFamily: options.find(opt => opt.value === value)?.value || 'inherit' }
                        : {}}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value} className="bg-gray-800">
                            {option.label}
                        </option>
                    ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                    <ChevronDownIcon className="h-5 w-5 text-white/50" />
                </div>
            </div>
        </div>
    );
};

// Custom Input Component
interface CustomInputProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    type?: 'text' | 'number' | 'color';
    placeholder?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, value, onChange, type = 'text', placeholder }) => {
    if (type === 'color') {
        return (
            <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-16 cursor-pointer rounded-lg border-2 border-white/20 transition-all hover:border-cyan-400"
                        style={{ backgroundColor: value as string }}
                    >
                        <input
                            type="color"
                            value={value as string}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-full w-full cursor-pointer opacity-0"
                        />
                    </div>
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="w-32 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4 flex flex-col gap-2">
            <label className="block text-xs font-medium text-white/70">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
};

export const TypographyConfigUI: React.FC<TypographyConfigUIProps> = ({
    value = {},
    onChange,
    elementTypes = ['title', 'value', 'label'],
}) => {
    const handleChange = (
        elementType: string,
        property: keyof TypographyConfig,
        propertyValue: any
    ) => {
        const newConfig = {
            ...value,
            [elementType]: {
                ...(value[elementType] || {}),
                [property]: propertyValue || undefined,
            },
        };
        // Remove property if value is empty
        if (!propertyValue) {
            const elementConfig = { ...(value[elementType] || {}) };
            delete elementConfig[property];
            if (Object.keys(elementConfig).length === 0) {
                const { [elementType]: _, ...rest } = newConfig;
                onChange(rest);
                return;
            }
            newConfig[elementType] = elementConfig;
        }
        onChange(newConfig);
    };

    const handleReset = (elementType: string) => {
        const newConfig = { ...value };
        delete newConfig[elementType];
        onChange(newConfig);
    };

    return (
        <div className="space-y-4 text-white">
            <div className="mb-4">
                <h3 className="mb-0.5 text-sm font-semibold text-white">Typography Settings</h3>
                <p className="text-xs text-white/60">
                    Fine-tune typography for each element. Changes instantly affect your widget.
                </p>
            </div>

            {elementTypes.map((type) => {
                const config = value[type] || {};
                const isConfigured = Object.keys(config).length > 0;

                return (
                    <CollapsibleSection
                        key={type}
                        title={`${type.charAt(0).toUpperCase() + type.slice(1)} Typography`}
                        defaultOpen={true}
                        icon={<PaintBrushIcon className="h-5 w-5" />}
                    >
                        {/* Configured Badge */}
                        {isConfigured && (
                            <div className="mb-4 flex items-center justify-end">
                                <span className="rounded bg-cyan-400/20 px-2 py-1 text-xs font-medium text-cyan-400">
                                    Configured
                                </span>
                            </div>
                        )}

                        {/* Basic Typography Section */}
                        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                            <h4 className="mb-3 text-xs font-medium text-white/70">Basic Typography</h4>

                            <CustomSelect
                                label="Font Family"
                                value={config.fontFamily || ''}
                                onChange={(value) => handleChange(type, 'fontFamily', value)}
                                options={FONT_FAMILIES}
                            />

                            <div className="grid grid-cols-2 gap-3">
                                <CustomSelect
                                    label="Font Size"
                                    value={config.fontSize || ''}
                                    onChange={(value) => handleChange(type, 'fontSize', value)}
                                    options={FONT_SIZES}
                                />

                                <CustomSelect
                                    label="Font Weight"
                                    value={config.fontWeight?.toString() || ''}
                                    onChange={(value) => handleChange(type, 'fontWeight', value ? Number(value) : undefined)}
                                    options={FONT_WEIGHTS}
                                />
                            </div>
                        </div>

                        {/* Color & Alignment Section */}
                        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                            <h4 className="mb-3 text-xs font-medium text-white/70">Color & Alignment</h4>

                            <CustomInput
                                label="Text Color"
                                type="color"
                                value={config.color || '#ffffff'}
                                onChange={(value) => handleChange(type, 'color', value)}
                            />

                            <div className="mb-4">
                                <label className="mb-2 block text-xs font-medium text-white/70">Text Alignment</label>
                                <div className="flex items-center justify-end gap-2">
                                    <button
                                        onClick={() => handleChange(type, 'textAlign', 'left')}
                                        className={`flex items-center justify-center rounded-lg border p-2 transition-all ${config.textAlign === 'left'
                                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                                            }`}
                                        title="Align Left"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h6M3 14h6M3 6h6M3 18h6" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleChange(type, 'textAlign', 'center')}
                                        className={`flex items-center justify-center rounded-lg border p-2 transition-all ${config.textAlign === 'center'
                                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                                            }`}
                                        title="Align Center"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleChange(type, 'textAlign', 'right')}
                                        className={`flex items-center justify-center rounded-lg border p-2 transition-all ${config.textAlign === 'right'
                                            ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                            : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                                            }`}
                                        title="Align Right"
                                    >
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M3 6h18M3 18h18" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10h6M15 14h6M15 6h6M15 18h6" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Advanced Settings Section */}
                        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-3">
                            <h4 className="mb-3 text-xs font-medium text-white/70">Advanced Settings</h4>

                            <div className="grid grid-cols-2 gap-3">
                                <CustomInput
                                    label="Letter Spacing"
                                    type="text"
                                    value={config.letterSpacing || ''}
                                    onChange={(value) => handleChange(type, 'letterSpacing', value)}
                                    placeholder="e.g., 1px"
                                />

                                <CustomInput
                                    label="Line Height"
                                    type="text"
                                    value={config.lineHeight || ''}
                                    onChange={(value) => handleChange(type, 'lineHeight', value)}
                                    placeholder="e.g., 1.5"
                                />
                            </div>
                        </div>

                        {/* Reset Button */}
                        {isConfigured && (
                            <div className="mt-4 flex items-center justify-end border-t border-white/10 pt-4">
                                <button
                                    onClick={() => handleReset(type)}
                                    className="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-1.5 text-sm font-medium text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500"
                                    title="Reset to default"
                                >
                                    <ArrowPathIcon className="h-4 w-4" />
                                    Reset
                                </button>
                            </div>
                        )}
                    </CollapsibleSection>
                );
            })}
        </div>
    );
};
