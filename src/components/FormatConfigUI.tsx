'use client';

import React, { useState } from 'react';
import {
    FormatConfig,
    FORMAT_PRESETS,
    applyValueFormat,
    ScaleType,
    RoundingType,
} from '@/helpers/formatConfig';

interface FormatConfigUIProps {
    value?: FormatConfig;
    onChange: (config: FormatConfig) => void;
    sampleValue?: number; // Optional sample value to show preview
    label?: string;
}

export const FormatConfigUI: React.FC<FormatConfigUIProps> = ({
    value = {},
    onChange,
    sampleValue = 1234567.89,
    label = 'Format Configuration',
}) => {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [config, setConfig] = useState<FormatConfig>(value);

    const handleChange = (updates: Partial<FormatConfig>) => {
        const newConfig = { ...config, ...updates };
        setConfig(newConfig);
        onChange(newConfig);
    };

    const applyPreset = (presetName: string) => {
        const preset = FORMAT_PRESETS[presetName];
        if (preset) {
            setConfig(preset);
            onChange(preset);
        }
    };

    const preview = applyValueFormat(sampleValue, config);

    return (
        <div className="mt-2 mb-2 rounded-lg border border-white/10 bg-white/10 p-4 text-white">
            <h3 className="mb-3 text-sm font-semibold text-white">{label}</h3>

            {/* Presets */}
            <div className="mb-4">
                <span className="mb-1 block text-xs font-medium text-white/80">
                    Quick Presets:
                </span>
                <div className="flex flex-wrap gap-2">
                    {Object.keys(FORMAT_PRESETS).map((presetName) => (
                        <button
                            key={presetName}
                            type="button"
                            onClick={() => applyPreset(presetName)}
                            className="rounded-full bg-white/30 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-white/50"
                        >
                            {presetName}
                        </button>
                    ))}
                </div>
            </div>

            {/* Basic Configuration */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Scale */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/80">Scale</label>
                    <select
                        value={config.scale || 'none'}
                        onChange={(e) => handleChange({ scale: e.target.value as ScaleType })}
                        className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    >
                        <option value="none">None (1)</option>
                        <option value="thousand">Thousand (K/M)</option>
                        <option value="million">Million (M/MM)</option>
                        <option value="billion">Billion (B)</option>
                        <option value="auto">Auto (K/M/B)</option>
                    </select>
                </div>

                {/* Decimals */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/80">Decimals</label>
                    <input
                        type="number"
                        min={0}
                        max={10}
                        value={config.decimals ?? 0}
                        onChange={(e) =>
                            handleChange({
                                decimals: Number.isNaN(parseInt(e.target.value, 10))
                                    ? 0
                                    : parseInt(e.target.value, 10),
                            })
                        }
                        className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>

                {/* Prefix */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/80">Prefix</label>
                    <input
                        type="text"
                        value={config.prefix || ''}
                        onChange={(e) => handleChange({ prefix: e.target.value })}
                        placeholder="e.g., $"
                        className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>

                {/* Suffix */}
                <div className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-white/80">Suffix</label>
                    <input
                        type="text"
                        value={config.suffix || ''}
                        onChange={(e) => handleChange({ suffix: e.target.value })}
                        placeholder="e.g., %, M, units"
                        className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-xs font-medium text-white/90 transition-colors hover:text-cyan-300"
                >
                    {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options
                </button>
            </div>

            {/* Advanced Configuration */}
            {showAdvanced && (
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Rounding */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/80">Rounding</label>
                        <select
                            value={config.rounding || 'round'}
                            onChange={(e) =>
                                handleChange({ rounding: e.target.value as RoundingType })
                            }
                            className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                        >
                            <option value="round">Round (Standard)</option>
                            <option value="floor">Floor (Round Down)</option>
                            <option value="ceil">Ceil (Round Up)</option>
                            <option value="none">None</option>
                        </select>
                    </div>

                    {/* Show Sign */}
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-white/80">Show Sign</label>
                        <select
                            value={config.showSign ? 'yes' : 'no'}
                            onChange={(e) =>
                                handleChange({ showSign: e.target.value === 'yes' })
                            }
                            className="w-full rounded-lg border border-white/30 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                        >
                            <option value="no">No</option>
                            <option value="yes">Yes (+/-)</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Preview */}
            <div className="mt-4 rounded-md bg-white/10 p-3">
                <div className="mb-1 text-xs text-white/80">
                    Preview ({sampleValue.toLocaleString()}):
                </div>
                <div className="text-lg font-bold text-[#84BD00]">
                    {preview}
                </div>
            </div>

            {/* Clear Button */}
            <div className="mt-3">
                <button
                    type="button"
                    onClick={() => {
                        setConfig({});
                        onChange({});
                    }}
                    className="rounded border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/10"
                >
                    Clear Formatting
                </button>
            </div>
        </div>
    );
};
