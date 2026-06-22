'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
    ChartBarIcon,
    ChevronDownIcon,
    ChevronUpIcon,
    TrashIcon,
    PaintBrushIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { ChartWidgetConfig, CHART_TYPES, SeriesConfig, SeriesType, LineType, GridLineStyle, PointerStyle } from './ChartConfig.types';
import { ColorVariant, COLOR_VARIANTS } from '@/components/ColorVariantPicker';
import { DIMENSION_DATE_PATTERNS } from '@/helpers/dimensionFormatting';

interface ChartConfigPanelProps {
    response?: any;
    value: ChartWidgetConfig;
    onChange: (config: ChartWidgetConfig) => void;
}

const defaultConfig: ChartWidgetConfig = {
    chartType: 'line',
    xAxisKey: '',
    groupByKey: undefined,
    measures: [],
    stacked: false,
    valueFormat: 'non-currency',
    showLegend: true,
    showGridLines: true,
    showDataLabels: false,
    gridLineStyle: 'dashed-short',
    colorPalette: undefined,
    colorVariantId: undefined,
    seriesConfig: {
        series: [],
    },
    listenToEvent: undefined,
};

const defaultColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d084d0', '#ffb347', '#87ceeb', '#dda0dd', '#98d8c8'];

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
        <div className="flex flex-col gap-2 mb-4">
            <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
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

// Custom Checkbox Component
interface CustomCheckboxProps {
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange, description }) => {
    return (
        <div className="mb-3">
            <label className="flex cursor-pointer items-start gap-3">
                <div className="relative flex-shrink-0">
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-white/30 bg-white/5 transition-all checked:border-cyan-400 checked:border-1"
                    />
                    {checked && (
                        <CheckIcon className="pointer-events-none absolute inset-0 m-auto h-3 w-3" />
                    )}
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium text-white">{label}</div>
                    {description && <div className="mt-1 text-xs text-white/60">{description}</div>}
                </div>
            </label>
        </div>
    );
};

// Custom Input Component
interface CustomInputProps {
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    type?: 'text' | 'number' | 'color';
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, value, onChange, type = 'text', min, max, step, placeholder }) => {
    if (type === 'color') {
        return (
            <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-5 cursor-pointer rounded-lg border-2 border-white/20 transition-all hover:border-cyan-400"
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
                        className="flex-1 w-10 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:!text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 mb-4">
            <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
};

export const ChartConfigPanel: React.FC<ChartConfigPanelProps> = ({
    response,
    value = defaultConfig,
    onChange,
}) => {
    const config = { ...defaultConfig, ...value };

    // Extract available fields from response
    const availableFields = useMemo(() => {
        if (!response) {
            return {
                charKeys: [],
                keyFigureKeys: [],
                headerText: {},
                charUniqueValues: {},
            };
        }

        const charKeys = response.charKeys || [];
        const keyFigureKeys = response.keyFigureKeys || [];
        const headerText = response.headerText || {};
        const charUniqueValues = response.charUniqueValues || {};

        return {
            charKeys,
            keyFigureKeys,
            headerText,
            charUniqueValues,
        };
    }, [response]);

    const handleChange = (key: keyof ChartWidgetConfig, newValue: any) => {
        onChange({
            ...config,
            [key]: newValue,
        });
    };

    // Get current series configuration
    const currentSeries = useMemo(() => {
        return config.seriesConfig?.series || [];
    }, [config.seriesConfig]);

    // Sync seriesConfig with measures
    useEffect(() => {
        const measures = value.measures || [];
        const existingSeries = value.seriesConfig?.series || [];
        const headerText = availableFields.headerText || {};

        // Create a map of existing series by dataKey
        const seriesMap = new Map<string, SeriesConfig>();
        existingSeries.forEach((s) => {
            seriesMap.set(s.dataKey, s);
        });

        // Build new series array based on current measures
        const newSeries: SeriesConfig[] = measures.map((measureKey, index) => {
            const existing = seriesMap.get(measureKey);
            // Get color from palette (in order) or fallback to default
            const paletteColor = value.colorPalette?.[index] || defaultColors[index % defaultColors.length];

            if (existing) {
                // Update color from palette if it changed, preserving other properties
                if (existing.color !== paletteColor) {
                    return {
                        ...existing,
                        color: paletteColor,
                    };
                }
                return existing;
            }
            // Create new series with default values
            const seriesType = (value.chartType === 'composed' ? 'line' : value.chartType) as SeriesType;
            return {
                name: headerText[measureKey] || measureKey,
                dataKey: measureKey,
                color: paletteColor,
                type: seriesType,
                lineType: 'solid' as LineType,
                // Default bar styling for bar charts
                ...(seriesType === 'bar' || value.chartType === 'bar' || value.chartType === 'horizontal-bar' ? {
                    barOpacity: 0.6,
                    barEdgeColor: paletteColor,
                    barEdgeWidth: 2,
                } : {}),
            };
        });

        // Check if series changed
        const seriesChanged =
            newSeries.length !== existingSeries.length ||
            newSeries.some((s, i) => {
                const existing = existingSeries[i];
                if (!existing || s.dataKey !== existing.dataKey) {
                    return true;
                }
                if (s.color !== existing.color) {
                    return true;
                }
                return false;
            });

        if (seriesChanged) {
            onChange({
                ...value,
                seriesConfig: {
                    series: newSeries,
                },
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value.measures, value.chartType, value.colorPalette, availableFields.headerText]);

    const handleMeasureChange = (measureKey: string, checked: boolean) => {
        const currentMeasures = config.measures || [];

        if (checked) {
            if (!currentMeasures.includes(measureKey)) {
                handleChange('measures', [...currentMeasures, measureKey]);
            }
        } else {
            const newMeasures = currentMeasures.filter((m) => m !== measureKey);
            const currentSeriesConfig = value.seriesConfig?.series || [];
            const updatedSeries = currentSeriesConfig.filter((s) => s.dataKey !== measureKey);
            onChange({
                ...value,
                measures: newMeasures,
                seriesConfig: {
                    series: updatedSeries,
                },
            });
        }
    };

    const handleCharKeyToggle = (charKey: string, checked: boolean) => {
        const currentCharKeys = config.charKeys || [];

        if (checked) {
            if (!currentCharKeys.includes(charKey)) {
                handleChange('charKeys', [...currentCharKeys, charKey]);
            }
        } else {
            const newCharKeys = currentCharKeys.filter((k) => k !== charKey);
            handleChange('charKeys', newCharKeys);
        }
    };

    // Set/clear the display format for a single X-Series dimension.
    const handleDimensionFormatChange = (charKey: string, pattern: string) => {
        const current = { ...(config.dimensionFormats || {}) };
        if (pattern) {
            current[charKey] = { type: 'date', pattern };
        } else {
            delete current[charKey];
        }
        handleChange('dimensionFormats', Object.keys(current).length ? current : undefined);
    };

    const handleSeriesTypeChange = (dataKey: string, type: SeriesType) => {
        const currentSeriesConfig = value.seriesConfig?.series || [];
        const updatedSeries = currentSeriesConfig.map((s) =>
            s.dataKey === dataKey ? { ...s, type } : s
        );
        onChange({
            ...value,
            seriesConfig: {
                series: updatedSeries,
            },
        });
    };

    const handleSeriesColorChange = (dataKey: string, color: string) => {
        const currentSeriesConfig = value.seriesConfig?.series || [];
        const updatedSeries = currentSeriesConfig.map((s) =>
            s.dataKey === dataKey ? { ...s, color } : s
        );
        onChange({
            ...value,
            seriesConfig: {
                series: updatedSeries,
            },
        });
    };

    const handleSeriesLineTypeChange = (dataKey: string, lineType: LineType) => {
        const currentSeriesConfig = value.seriesConfig?.series || [];
        const updatedSeries = currentSeriesConfig.map((s) =>
            s.dataKey === dataKey ? { ...s, lineType } : s
        );
        onChange({
            ...value,
            seriesConfig: {
                series: updatedSeries,
            },
        });
    };

    const handleSeriesBarOpacityChange = (dataKey: string, opacity: number) => {
        const currentSeriesConfig = value.seriesConfig?.series || [];
        const updatedSeries = currentSeriesConfig.map((s) =>
            s.dataKey === dataKey ? { ...s, barOpacity: opacity } : s
        );
        onChange({
            ...value,
            seriesConfig: {
                series: updatedSeries,
            },
        });
    };

    const handleSeriesBarEdgeColorChange = (dataKey: string, edgeColor: string) => {
        const currentSeriesConfig = value.seriesConfig?.series || [];
        const updatedSeries = currentSeriesConfig.map((s) =>
            s.dataKey === dataKey ? { ...s, barEdgeColor: edgeColor } : s
        );
        onChange({
            ...value,
            seriesConfig: {
                series: updatedSeries,
            },
        });
    };

    const handleSeriesBarEdgeWidthChange = (dataKey: string, edgeWidth: number) => {
        const currentSeriesConfig = value.seriesConfig?.series || [];
        const updatedSeries = currentSeriesConfig.map((s) =>
            s.dataKey === dataKey ? { ...s, barEdgeWidth: edgeWidth } : s
        );
        onChange({
            ...value,
            seriesConfig: {
                series: updatedSeries,
            },
        });
    };

    const handleColorVariantSelect = (variant: ColorVariant) => {
        handleChange('colorVariantId', variant.id);
        handleChange('colorPalette', variant.colors);
    };

    const selectedVariant = useMemo(() => {
        if (config.colorVariantId) {
            const allVariants = [...COLOR_VARIANTS];
            return allVariants.find((v) => v.id === config.colorVariantId);
        }
        return undefined;
    }, [config.colorVariantId]);

    // Chart type options
    const chartTypeOptions = CHART_TYPES.map((type) => ({
        value: type,
        label: type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' '),
    }));

    // Grid line style options
    const gridLineStyleOptions: { value: GridLineStyle; label: string }[] = [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed-short', label: 'Dashed (Short)' },
        { value: 'dashed-medium', label: 'Dashed (Medium)' },
        { value: 'dashed-long', label: 'Dashed (Long)' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'dash-dot', label: 'Dash-Dot' },
    ];

    // Line type options
    const lineTypeOptions: { value: LineType; label: string }[] = [
        { value: 'solid', label: 'Solid' },
        { value: 'dashed', label: 'Dashed' },
        { value: 'dotted', label: 'Dotted' },
        { value: 'dashDot', label: 'Dash-Dot' },
    ];

    return (
        <div className="space-y-4 text-white">
            {/* Basic Configuration */}
            <CollapsibleSection
                title="Basic Configuration"
                defaultOpen={true}
                icon={<ChartBarIcon className="h-5 w-5" />}
            >
                <CustomSelect
                    label="Chart Type"
                    value={config.chartType}
                    onChange={(value) => handleChange('chartType', value)}
                    options={chartTypeOptions}
                />

                <CustomSelect
                    label="X-Axis Field"
                    value={config.xAxisKey}
                    onChange={(value) => handleChange('xAxisKey', value)}
                    options={availableFields.charKeys.map((key: string) => ({
                        value: key,
                        label: availableFields.headerText[key] || key,
                    }))}
                    placeholder="Select X-Axis field"
                />

                <CustomSelect
                    label="Group By Field (Optional)"
                    value={config.groupByKey || ''}
                    onChange={(value) => handleChange('groupByKey', value || undefined)}
                    options={[
                        { value: '', label: 'None' },
                        ...availableFields.charKeys
                            .filter((key: string) => key !== config.xAxisKey)
                            .map((key: string) => ({
                                value: key,
                                label: availableFields.headerText[key] || key,
                            })),
                    ]}
                />

                {config.chartType === 'table' && (
                    <div className="mt-2">
                        <label className="mb-2 block text-xs font-medium text-white/70">
                            Table Dimensions (X-Series Fields)
                        </label>
                        <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                            {availableFields.charKeys.length === 0 ? (
                                <p className="text-xs text-white/50">
                                    No characteristic fields available to use as table dimensions.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {availableFields.charKeys.map((key: string) => {
                                        const isSelected = (config.charKeys || []).includes(key);
                                        return (
                                            <div key={key}>
                                                <CustomCheckbox
                                                    label={availableFields.headerText[key] || key}
                                                    checked={isSelected}
                                                    onChange={(checked) => handleCharKeyToggle(key, checked)}
                                                    description={key === config.xAxisKey ? 'Currently used as primary X-Axis field' : undefined}
                                                />
                                                {isSelected && (
                                                    <div className="mb-2 ml-7">
                                                        <CustomSelect
                                                            label="Date Format"
                                                            value={config.dimensionFormats?.[key]?.pattern || ''}
                                                            onChange={(value) => handleDimensionFormatChange(key, value)}
                                                            options={[
                                                                { value: '', label: 'No formatting' },
                                                                ...DIMENSION_DATE_PATTERNS.map((p) => ({ value: p, label: p })),
                                                            ]}
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <CustomInput
                    label="Listen To Event (Optional)"
                    value={config.listenToEvent || ''}
                    onChange={(value) => handleChange('listenToEvent', value || undefined)}
                    placeholder="filter-changed"
                />
            </CollapsibleSection>

            {/* Data Selection */}
            <CollapsibleSection
                title="Data Selection"
                defaultOpen={true}
                icon={<ChartBarIcon className="h-5 w-5" />}
            >
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                    {availableFields.keyFigureKeys.length === 0 ? (
                        <p className="text-xs text-white/50">No key figures available in the response.</p>
                    ) : (
                        <div className="space-y-2">
                            {availableFields.keyFigureKeys.map((key: string) => (
                                <CustomCheckbox
                                    key={key}
                                    label={availableFields.headerText[key] || key}
                                    checked={(config.measures || []).includes(key)}
                                    onChange={(checked) => handleMeasureChange(key, checked)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </CollapsibleSection>

            {/* Series Configuration */}
            {config.measures.length > 0 && (
                <CollapsibleSection
                    title="Series Configuration"
                    defaultOpen={false}
                    icon={<PaintBrushIcon className="h-5 w-5" />}
                >
                    <p className="mb-4 text-xs text-white/60">
                        Configure the chart type, color, and styling for each data series. This is especially useful for composed charts.
                    </p>
                    <div className="space-y-3">
                        {currentSeries.map((series) => (
                            <div
                                key={series.dataKey}
                                className="rounded-lg border border-white/10 bg-white/5 p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="h-6 w-6 rounded border border-white/20"
                                            style={{ backgroundColor: series.color }}
                                        />
                                        <div>
                                            <div className="text-sm font-medium text-white">{series.name}</div>
                                            <div className="text-xs text-white/60">{series.dataKey}</div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            const newMeasures = (value.measures || []).filter(
                                                (m) => m !== series.dataKey
                                            );
                                            const currentSeriesConfig = value.seriesConfig?.series || [];
                                            const updatedSeries = currentSeriesConfig.filter(
                                                (s) => s.dataKey !== series.dataKey
                                            );
                                            onChange({
                                                ...value,
                                                measures: newMeasures,
                                                seriesConfig: {
                                                    series: updatedSeries,
                                                },
                                            });
                                        }}
                                        className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    {/* Series Type Selection (for composed charts) */}
                                    {config.chartType === 'composed' && (
                                        <div>
                                            <label className="mb-2 block text-xs font-medium text-white/70">Series Type</label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {(['line', 'bar', 'area'] as SeriesType[]).map((type) => {
                                                    const isSelected = (series.type || 'line') === type;
                                                    const iconColor = isSelected ? 'text-cyan-400' : 'text-white/70';

                                                    return (
                                                        <button
                                                            key={type}
                                                            onClick={() => handleSeriesTypeChange(series.dataKey, type)}
                                                            className={`flex flex-col items-center justify-center gap-2 rounded-lg border px-3 py-3 text-xs font-medium transition-all ${isSelected
                                                                ? 'border-cyan-400 bg-cyan-400/20 text-cyan-400'
                                                                : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'
                                                                }`}
                                                        >
                                                            {type === 'line' && (
                                                                <svg className={`h-5 w-5 ${iconColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 20l9-9 4 4 8-8" />
                                                                </svg>
                                                            )}
                                                            {type === 'bar' && (
                                                                <ChartBarIcon className={`h-5 w-5 ${iconColor}`} />
                                                            )}
                                                            {type === 'area' && (
                                                                <svg className={`h-5 w-5 ${iconColor}`} viewBox="0 0 24 24" fill="none">
                                                                    <path d="M3 20L9 14L13 18L21 10V20H3Z" fill="currentColor" fillOpacity={0.3} />
                                                                    <path d="M3 20L9 14L13 18L21 10" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                            {/* <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span> */}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Line Style (for line/area charts) */}
                                    {(series.type === 'line' || series.type === 'area' || !series.type) && (
                                        <CustomSelect
                                            label="Line Style"
                                            value={series.lineType || 'solid'}
                                            onChange={(value) => handleSeriesLineTypeChange(series.dataKey, value as LineType)}
                                            options={lineTypeOptions}
                                        />
                                    )}

                                    {/* Color Picker */}
                                    <div className="flex flex-col gap-2">



                                    </div>
                                    <CustomInput
                                        label="Series Color"
                                        type="color"
                                        value={series.color}
                                        onChange={(value) => handleSeriesColorChange(series.dataKey, value as string)}
                                    />

                                    {/* Bar Styling (for bar charts) */}
                                    {(series.type === 'bar' || config.chartType === 'bar' || config.chartType === 'horizontal-bar') && (
                                        <div className="space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                                            <CustomInput
                                                label="Bar Opacity"
                                                type="number"
                                                value={series.barOpacity !== undefined ? series.barOpacity : 0.6}
                                                onChange={(value) => handleSeriesBarOpacityChange(series.dataKey, value as number)}
                                                min={0}
                                                max={1}
                                                step={0.1}
                                            />
                                            <CustomInput
                                                label="Bar Edge Color"
                                                type="color"
                                                value={series.barEdgeColor || series.color}
                                                onChange={(value) => handleSeriesBarEdgeColorChange(series.dataKey, value as string)}
                                            />
                                            <CustomInput
                                                label="Bar Edge Width"
                                                type="number"
                                                value={series.barEdgeWidth !== undefined ? series.barEdgeWidth : 2}
                                                onChange={(value) => handleSeriesBarEdgeWidthChange(series.dataKey, value as number)}
                                                min={0.5}
                                                max={20}
                                                step={0.5}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CollapsibleSection>
            )}

            {/* Groups Configuration */}
            {config.groupByKey && (
                <CollapsibleSection
                    title="Groups Configuration"
                    defaultOpen={false}
                    icon={<ChartBarIcon className="h-5 w-5" />}
                >
                    <p className="mb-4 text-xs text-white/60">
                        Select which groups to display and assign colors for each measure within each group.
                    </p>
                    <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
                        {(() => {
                            const groupValues = availableFields.charUniqueValues[config.groupByKey!] || [];
                            if (groupValues.length === 0) {
                                return (
                                    <p className="text-xs text-white/50">No groups available for the selected field.</p>
                                );
                            }

                            return groupValues.map((groupValue: string) => {
                                const groupConfig = config.groupConfigs?.[groupValue] || {};
                                const isEnabled = groupConfig.enabled !== false;
                                const measureColors = groupConfig.measureColors || {};
                                const globalColorPalette = config.colorPalette || defaultColors;

                                const handleGroupToggle = (checked: boolean) => {
                                    const currentGroupConfigs = config.groupConfigs || {};
                                    onChange({
                                        ...config,
                                        groupConfigs: {
                                            ...currentGroupConfigs,
                                            [groupValue]: {
                                                ...currentGroupConfigs[groupValue],
                                                enabled: checked,
                                            },
                                        },
                                    });
                                };

                                const handleMeasureColorChange = (measureKey: string, color: string) => {
                                    const currentGroupConfigs = config.groupConfigs || {};
                                    const currentMeasureColors = currentGroupConfigs[groupValue]?.measureColors || {};
                                    onChange({
                                        ...config,
                                        groupConfigs: {
                                            ...currentGroupConfigs,
                                            [groupValue]: {
                                                ...currentGroupConfigs[groupValue],
                                                measureColors: {
                                                    ...currentMeasureColors,
                                                    [measureKey]: color,
                                                },
                                                enabled: isEnabled,
                                            },
                                        },
                                    });
                                };

                                return (
                                    <div
                                        key={groupValue}
                                        className={`rounded-lg border p-4 ${isEnabled
                                            ? 'border-white/10 bg-white/5'
                                            : 'border-white/5 bg-white/2 opacity-60'
                                            }`}
                                    >
                                        <CustomCheckbox
                                            label={availableFields.headerText[groupValue] || groupValue}
                                            checked={isEnabled}
                                            onChange={handleGroupToggle}
                                        />

                                        {isEnabled && config.measures.length > 0 && (
                                            <div className="mt-3 space-y-2">
                                                <p className="text-xs text-white/70">Assign colors for each measure:</p>
                                                {config.measures.map((measureKey: string, measureIndex: number) => {
                                                    const seriesConfig = currentSeries.find((s) => s.dataKey === measureKey);
                                                    const defaultColor = seriesConfig?.color || globalColorPalette[measureIndex % globalColorPalette.length];
                                                    const measureColor = measureColors[measureKey] || defaultColor;

                                                    return (
                                                        <div
                                                            key={measureKey}
                                                            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2"
                                                        >
                                                            <span className="text-xs text-white">
                                                                {availableFields.headerText[measureKey] || measureKey}
                                                            </span>
                                                            <CustomInput
                                                                label=""
                                                                type="color"
                                                                value={measureColor}
                                                                onChange={(value) => handleMeasureColorChange(measureKey, value as string)}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            });
                        })()}
                    </div>
                </CollapsibleSection>
            )}

            {/* Display Options */}
            <CollapsibleSection
                title="Display Options"
                defaultOpen={false}
                icon={<ChartBarIcon className="h-5 w-5" />}
            >
                <div className="space-y-3">
                    <CustomCheckbox
                        label="Stacked"
                        checked={config.stacked || false}
                        onChange={(checked) => handleChange('stacked', checked)}
                        description="Stack series on top of each other"
                    />

                    <CustomCheckbox
                        label="Show Legend"
                        checked={config.showLegend !== false}
                        onChange={(checked) => handleChange('showLegend', checked)}
                        description="Display chart legend"
                    />

                    <CustomCheckbox
                        label="Show Grid Lines"
                        checked={config.showGridLines !== false}
                        onChange={(checked) => handleChange('showGridLines', checked)}
                        description="Display grid lines on chart"
                    />

                    {(config.chartType === 'line' || config.chartType === 'bar' || config.chartType === 'area' || config.chartType === 'composed' || config.chartType === 'horizontal-bar') && (
                        <CustomCheckbox
                            label="Data Labels"
                            checked={config.showDataLabels !== false}
                            onChange={(checked) => handleChange('showDataLabels', checked)}
                            description="Show value labels at each data point"
                        />
                    )}

                    {config.showGridLines !== false && (
                        <div className="ml-8">
                            <CustomSelect
                                label="Grid Line Style"
                                value={config.gridLineStyle || 'dashed-short'}
                                onChange={(value) => handleChange('gridLineStyle', value as GridLineStyle)}
                                options={gridLineStyleOptions}
                            />
                        </div>
                    )}

                    <CustomCheckbox
                        label="Transparent Background"
                        checked={config.transparentBackground === true}
                        onChange={(checked) => handleChange('transparentBackground', checked)}
                        description="Use transparent background instead of gradient"
                    />
                </div>
            </CollapsibleSection>

            {/* Pointer Style Configuration */}
            {(config.chartType === 'line' || config.chartType === 'area' || config.chartType === 'composed' || config.chartType === 'radar') && (
                <CollapsibleSection
                    title="Pointer Style"
                    defaultOpen={false}
                    icon={<ChartBarIcon className="h-5 w-5" />}
                >
                    <div className="space-y-4">
                        <CustomCheckbox
                            label="Show Pointers"
                            checked={config.pointerStyle?.showPointers !== false}
                            onChange={(checked) => {
                                const pointerStyle: PointerStyle = {
                                    ...config.pointerStyle,
                                    showPointers: checked,
                                };
                                handleChange('pointerStyle', pointerStyle);
                            }}
                        />

                        {config.pointerStyle?.showPointers !== false && (
                            <div className="ml-1 space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
                                <CustomInput
                                    label="Pointer Size"
                                    type="number"
                                    value={config.pointerStyle?.pointerSize ?? 4}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            pointerSize: Math.max(0, value as number),
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                    min={0}
                                    max={20}
                                    step={1}
                                />

                                <CustomInput
                                    label="Pointer Color (optional)"
                                    type="color"
                                    value={config.pointerStyle?.pointerColor || ''}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            pointerColor: (value as string) || undefined,
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                />

                                <CustomInput
                                    label="Pointer Border Color (optional)"
                                    type="color"
                                    value={config.pointerStyle?.pointerStrokeColor || ''}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            pointerStrokeColor: (value as string) || undefined,
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                />

                                <CustomInput
                                    label="Pointer Border Width"
                                    type="number"
                                    value={config.pointerStyle?.pointerStrokeWidth ?? 0}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            pointerStrokeWidth: Math.max(0, value as number),
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                    min={0}
                                    max={10}
                                    step={1}
                                />

                                <CustomInput
                                    label="Active Pointer Size"
                                    type="number"
                                    value={config.pointerStyle?.activePointerSize ?? 8}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            activePointerSize: Math.max(0, value as number),
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                    min={0}
                                    max={30}
                                    step={1}
                                />

                                <CustomInput
                                    label="Active Pointer Border Color"
                                    type="color"
                                    value={config.pointerStyle?.activePointerStrokeColor || '#ffffff'}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            activePointerStrokeColor: value as string,
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                />

                                <CustomInput
                                    label="Active Pointer Border Width"
                                    type="number"
                                    value={config.pointerStyle?.activePointerStrokeWidth ?? 2}
                                    onChange={(value) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            activePointerStrokeWidth: Math.max(0, value as number),
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                    min={0}
                                    max={10}
                                    step={1}
                                />

                                <CustomCheckbox
                                    label="Show Glow Effect on Active Pointers"
                                    checked={config.pointerStyle?.showGlow !== false}
                                    onChange={(checked) => {
                                        const pointerStyle: PointerStyle = {
                                            ...config.pointerStyle,
                                            showGlow: checked,
                                        };
                                        handleChange('pointerStyle', pointerStyle);
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </CollapsibleSection>
            )}

            {/* Value Format */}
            <CollapsibleSection
                title="Value Format"
                defaultOpen={false}
                icon={<ChartBarIcon className="h-5 w-5" />}
            >
                <div className="space-y-4">
                    <CustomSelect
                        label="Format"
                        value={config.valueFormat || 'non-currency'}
                        onChange={(value) => handleChange('valueFormat', value)}
                        options={[
                            { value: 'non-currency', label: 'Non-Currency' },
                            { value: 'currency', label: 'Currency' },
                        ]}
                    />
                    <CustomInput
                        label="Decimal Precision (Y-Series)"
                        type="number"
                        value={config.ySeriesFormatting?.decimalPrecision ?? ''}
                        onChange={(value) => {
                            const num = Number(value);
                            const decimalPrecision = Number.isFinite(num) ? num : undefined;
                            handleChange('ySeriesFormatting', {
                                ...(config.ySeriesFormatting || {}),
                                decimalPrecision,
                            });
                        }}
                        min={0}
                        max={10}
                        step={1}
                        placeholder="Leave empty for default"
                    />
                </div>
            </CollapsibleSection>

            {/* Color Palette */}
            <CollapsibleSection
                title="Color Palette"
                defaultOpen={false}
                icon={<PaintBrushIcon className="h-5 w-5" />}
            >
                <p className="mb-4 text-xs text-white/60">
                    Select a color variant to apply to your chart series.
                </p>
                <div className="max-h-96 space-y-3 overflow-y-auto pr-2">
                    {COLOR_VARIANTS.map((variant) => {
                        const isSelected = config.colorVariantId === variant.id;
                        return (
                            <div
                                key={variant.id}
                                onClick={() => handleColorVariantSelect(variant)}
                                className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${isSelected
                                    ? 'border-cyan-400 bg-cyan-400/10'
                                    : 'border-white/10 bg-white/5 hover:border-cyan-400/50 hover:bg-white/8'
                                    }`}
                            >
                                <div className="mb-2 flex items-center justify-between">
                                    <span
                                        className={`text-sm font-medium ${isSelected ? 'text-cyan-400' : 'text-white'
                                            }`}
                                    >
                                        {variant.name}
                                    </span>
                                    {isSelected && (
                                        <CheckIcon className="h-5 w-5 text-cyan-400" />
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {variant.colors.map((color, index) => (
                                        <div
                                            key={index}
                                            className="h-7 w-7 rounded border border-white/20"
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CollapsibleSection>
        </div>
    );
};
