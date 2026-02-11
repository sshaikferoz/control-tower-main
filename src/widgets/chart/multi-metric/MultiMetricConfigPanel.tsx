'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    TrashIcon,
    PlusIcon,
    ChartBarIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { MultiMetricWidgetConfig, MultiMetricItem } from './MultiMetricConfig.types';
import useBexJson from '@/hooks/useBexJson';

interface MultiMetricConfigPanelProps {
    response?: any;
    value: MultiMetricWidgetConfig;
    onChange: (config: MultiMetricWidgetConfig) => void;
}

const defaultConfig: MultiMetricWidgetConfig = {
    metrics: [],
    layout: 'horizontal',
    showDividers: true,
};

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
    id?: string;
    name?: string;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ label, value, onChange, options, placeholder, id, name }) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const selectName = name || selectId;

    return (
        <div className="flex flex-col gap-2 mb-4">
            <label htmlFor={selectId} className="mb-2 block text-xs font-medium text-white/70">{label}</label>
            <div className="relative">
                <select
                    id={selectId}
                    name={selectName}
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
    id?: string;
    name?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({ label, checked, onChange, description, id, name }) => {
    const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const checkboxName = name || checkboxId;

    return (
        <div className="mb-3">
            <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3">
                <div className="relative flex-shrink-0">
                    <input
                        id={checkboxId}
                        name={checkboxName}
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
    id?: string;
    name?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, value, onChange, type = 'text', min, max, step, placeholder, id, name }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const inputName = name || inputId;

    if (type === 'color') {
        const colorInputId = `${inputId}-color`;
        const textInputId = `${inputId}-text`;
        return (
            <div className="mb-4">
                <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
                <div className="flex items-center gap-3">
                    <div
                        className="h-10 w-5 cursor-pointer rounded-lg border-2 border-white/20 transition-all hover:border-cyan-400"
                        style={{ backgroundColor: value as string }}
                    >
                        <input
                            id={colorInputId}
                            name={`${inputName}-color`}
                            type="color"
                            value={value as string}
                            onChange={(e) => onChange(e.target.value)}
                            className="h-full w-full cursor-pointer opacity-0"
                        />
                    </div>
                    <input
                        id={textInputId}
                        name={`${inputName}-text`}
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 w-10 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2 mb-4">
            <label htmlFor={inputId} className="mb-2 block text-xs font-medium text-white/70">{label}</label>
            <input
                id={inputId}
                name={inputName}
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:!text-white/70 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
};

export const MultiMetricConfigPanel: React.FC<MultiMetricConfigPanelProps> = ({
    response,
    value = defaultConfig,
    onChange,
}) => {
    const config = { ...defaultConfig, ...value };

    const handleChange = (key: keyof MultiMetricWidgetConfig, newValue: any) => {
        onChange({
            ...config,
            [key]: newValue,
        });
    };

    const handleMetricChange = (index: number, field: keyof MultiMetricItem, newValue: any) => {
        const newMetrics = [...(config.metrics || [])];
        newMetrics[index] = {
            ...newMetrics[index],
            [field]: newValue,
        };
        handleChange('metrics', newMetrics);
    };

    const handleAddMetric = () => {
        const newMetric: MultiMetricItem = {
            id: `metric-${Date.now()}`,
            title: `Metric ${(config.metrics?.length || 0) + 1}`,
            queryName: '',
            valueKey: undefined,
            titleAlignment: 'center',
            valueAlignment: 'center',
            decimalPrecision: 2,
            valueFormat: 'non-currency',
            enableTrend: false,
            trendValue: undefined,
            invertTrend: false,
            metricLayout: 'vertical',
        };
        handleChange('metrics', [...(config.metrics || []), newMetric]);
    };

    const handleRemoveMetric = (index: number) => {
        const newMetrics = [...(config.metrics || [])];
        newMetrics.splice(index, 1);
        handleChange('metrics', newMetrics);
    };

    // Layout options
    const layoutOptions = [
        { value: 'horizontal', label: 'Horizontal' },
        { value: 'vertical', label: 'Vertical' },
    ];

    // Alignment options
    const alignmentOptions = [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' },
        { value: 'right', label: 'Right' },
    ];

    // Format options
    const formatOptions = [
        { value: 'non-currency', label: 'Non-Currency' },
        { value: 'currency', label: 'Currency' },
    ];

    // Metric layout options
    const metricLayoutOptions = [
        { value: 'vertical', label: 'Vertical (Title above Value)' },
        { value: 'verticalTitleBelow', label: 'Vertical (Title below Value)' },
        { value: 'horizontal', label: 'Horizontal (Title beside Value)' },
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
                    label="Layout Direction"
                    value={config.layout || 'horizontal'}
                    onChange={(value) => handleChange('layout', value)}
                    options={layoutOptions}
                    id="layout-direction"
                    name="layout-direction"
                />

                <CustomCheckbox
                    label="Show Dividers"
                    checked={config.showDividers ?? true}
                    onChange={(checked) => handleChange('showDividers', checked)}
                    description="Display dividers between metrics"
                    id="show-dividers"
                    name="show-dividers"
                />

                <CustomCheckbox
                    label="Transparent Background"
                    checked={config.transparentBackground === true}
                    onChange={(checked) => handleChange('transparentBackground', checked)}
                    description="Use transparent background instead of gradient"
                    id="transparent-background"
                    name="transparent-background"
                />
            </CollapsibleSection>

            {/* Metrics Configuration */}
            <CollapsibleSection
                title="Metrics Configuration"
                defaultOpen={true}
                icon={<ChartBarIcon className="h-5 w-5" />}
            >
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs text-white/60">
                        Configure multiple metrics.
                    </p>
                    <button
                        onClick={handleAddMetric}
                        className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-3 py-1.5 text-sm font-medium text-cyan-400 transition-all hover:bg-cyan-400/20 hover:border-cyan-400"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Metric
                    </button>
                </div>

                {(!config.metrics || config.metrics.length === 0) && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-white/50">No metrics configured. Click "Add Metric" to get started.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {(config.metrics || []).map((metric, index) => (
                        <MetricConfigCard
                            key={metric.id}
                            metric={metric}
                            index={index}
                            onMetricChange={handleMetricChange}
                            onRemove={handleRemoveMetric}
                            alignmentOptions={alignmentOptions}
                            formatOptions={formatOptions}
                            metricLayoutOptions={metricLayoutOptions}
                        />
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    );
};

// Individual metric configuration card
const MetricConfigCard: React.FC<{
    metric: MultiMetricItem;
    index: number;
    onMetricChange: (index: number, field: keyof MultiMetricItem, value: any) => void;
    onRemove: (index: number) => void;
    alignmentOptions: { value: string; label: string }[];
    formatOptions: { value: string; label: string }[];
    metricLayoutOptions: { value: string; label: string }[];
}> = ({ metric, index, onMetricChange, onRemove, alignmentOptions, formatOptions, metricLayoutOptions }) => {
    const [queryNameInput, setQueryNameInput] = useState(metric.queryName || '');

    // Fetch BEX data when query name is provided
    const { data: bexData, isLoading: bexLoading, error: bexError } = useBexJson(
        queryNameInput,
        {
            parser: 'new',
            enabled: !!queryNameInput && queryNameInput.length > 0,
        }
    );

    // Extract available fields from response
    const availableFields = useMemo(() => {
        if (!bexData) {
            return {
                keyFigureKeys: [],
                headerText: {},
            };
        }

        // Handle enhanced parser result
        const keyFigureKeys = (bexData as any)?.keyFigureKeys || [];
        const headerText = (bexData as any)?.headerText || {};

        return {
            keyFigureKeys,
            headerText,
        };
    }, [bexData]);

    // Update query name when input changes
    useEffect(() => {
        if (queryNameInput !== metric.queryName) {
            const timeoutId = setTimeout(() => {
                onMetricChange(index, 'queryName', queryNameInput);
            }, 500); // Debounce
            return () => clearTimeout(timeoutId);
        }
    }, [queryNameInput, metric.queryName, index, onMetricChange]);

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            {/* Header: Title and Delete Button */}
            <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <label htmlFor={`metric-title-${index}`} className="mb-2 block text-xs font-medium text-white/70">Metric Title</label>
                    <input
                        id={`metric-title-${index}`}
                        name={`metric-title-${index}`}
                        type="text"
                        value={metric.title}
                        onChange={(e) => onMetricChange(index, 'title', e.target.value)}
                        placeholder="Enter metric title"
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:!text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>
                <button
                    onClick={() => onRemove(index)}
                    className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            {/* Query Configuration */}
            <div className="mb-4 rounded-lg border-white/10">
                <CustomInput
                    label="Query Name"
                    type="text"
                    value={queryNameInput}
                    onChange={(value) => setQueryNameInput(value as string)}
                    placeholder="Enter BEX query name"
                    id={`query-name-${index}`}
                    name={`query-name-${index}`}
                />
                {bexLoading && (
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                        <p className="text-xs text-white/50">Loading fields...</p>
                    </div>
                )}
                {bexError && (
                    <p className="text-xs text-red-400">Error: {bexError.message || 'Failed to load query'}</p>
                )}

                {queryNameInput && availableFields.keyFigureKeys.length > 0 && (
                    <CustomSelect
                        label="Value Field"
                        value={metric.valueKey || ''}
                        onChange={(value) => onMetricChange(index, 'valueKey', value || undefined)}
                        options={[
                            { value: '', label: 'None' },
                            ...availableFields.keyFigureKeys.map((key: string) => ({
                                value: key,
                                label: availableFields.headerText[key] || key,
                            })),
                        ]}
                        placeholder="Select value field"
                        id={`value-field-${index}`}
                        name={`value-field-${index}`}
                    />
                )}
            </div>

            {/* Layout Configuration */}
            <div className="mb-4">
                <CustomSelect
                    label="Metric Layout"
                    value={metric.metricLayout || 'vertical'}
                    onChange={(value) => onMetricChange(index, 'metricLayout', value)}
                    options={metricLayoutOptions}
                    id={`metric-layout-${index}`}
                    name={`metric-layout-${index}`}
                />
            </div>

            {/* Alignment Options */}
            <div className="mb-4 flex flex-col gap-4">
                <CustomSelect
                    label="Title Alignment"
                    value={metric.titleAlignment || 'center'}
                    onChange={(value) => onMetricChange(index, 'titleAlignment', value)}
                    options={alignmentOptions}
                    id={`title-alignment-${index}`}
                    name={`title-alignment-${index}`}
                />
                <CustomSelect
                    label="Value Alignment"
                    value={metric.valueAlignment || 'center'}
                    onChange={(value) => onMetricChange(index, 'valueAlignment', value)}
                    options={alignmentOptions}
                    id={`value-alignment-${index}`}
                    name={`value-alignment-${index}`}
                />
            </div>

            {/* Formatting Options */}
            <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <div className="flex flex-col gap-4">
                    <CustomInput
                        label="Decimal Precision"
                        type="number"
                        value={metric.decimalPrecision ?? 2}
                        onChange={(value) => {
                            const numValue = value as number;
                            onMetricChange(index, 'decimalPrecision', isNaN(numValue) ? undefined : numValue);
                        }}
                        min={0}
                        max={10}
                        step={1}
                        id={`decimal-precision-${index}`}
                        name={`decimal-precision-${index}`}
                    />
                    <CustomSelect
                        label="Value Format"
                        value={metric.valueFormat || 'non-currency'}
                        onChange={(value) => onMetricChange(index, 'valueFormat', value)}
                        options={formatOptions}
                        id={`value-format-${index}`}
                        name={`value-format-${index}`}
                    />
                </div>
                <CustomInput
                    label="Unit Suffix"
                    type="text"
                    value={metric.unit || ''}
                    onChange={(value) => onMetricChange(index, 'unit', value)}
                    placeholder="e.g. %, USD, kg"
                    id={`unit-suffix-${index}`}
                    name={`unit-suffix-${index}`}
                />
            </div>

            {/* Trend Configuration */}
            <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <CustomCheckbox
                    label="Enable Trend Indicator"
                    checked={metric.enableTrend || false}
                    onChange={(checked) => onMetricChange(index, 'enableTrend', checked)}
                    description="Show trend indicator"
                    id={`enable-trend-${index}`}
                    name={`enable-trend-${index}`}
                />

                {metric.enableTrend && (
                    <div className="ml-4 space-y-3">
                        <div className="flex flex-col gap-4">
                            <CustomInput
                                label="Trend Value"
                                type="number"
                                value={metric.trendValue ?? ''}
                                onChange={(value) => {
                                    const numValue = value as number;
                                    onMetricChange(index, 'trendValue', isNaN(numValue) ? undefined : numValue);
                                }}
                                placeholder="Compare value"
                                id={`trend-value-${index}`}
                                name={`trend-value-${index}`}
                            />
                            <div className="flex items-end">
                                <CustomCheckbox
                                    label="Invert Trend"
                                    checked={metric.invertTrend || false}
                                    onChange={(checked) => onMetricChange(index, 'invertTrend', checked)}
                                    description="Reverse comparison logic"
                                    id={`invert-trend-${index}`}
                                    name={`invert-trend-${index}`}
                                />
                            </div>
                        </div>
                        <p className="text-xs text-white/50">
                            Trend colors: Green (up), Red (down), Yellow (equal)
                        </p>
                    </div>
                )}
            </div>

            {/* Event Listening Configuration */}
            <div className="mb-4 space-y-3 rounded-lg border border-white/10 bg-white/5 p-3">
                <h5 className="mb-2 text-sm font-semibold text-white">Filter Event Configuration</h5>
                <CustomInput
                    label="Listen to Event"
                    type="text"
                    value={metric.listenToEvent || ''}
                    onChange={(value) => onMetricChange(index, 'listenToEvent', value || undefined)}
                    placeholder="Event name from filter panel (e.g., filter-changed)"
                    id={`listen-to-event-${index}`}
                    name={`listen-to-event-${index}`}
                />
                <p className="text-xs text-white/50">
                    Enter the event name emitted by the filter panel widget. Leave empty to disable event listening.
                </p>

                {metric.listenToEvent && (
                    <div className="mt-4 space-y-3">
                        <div className="mb-2 flex items-center justify-between">
                            <label className="text-xs font-medium text-white/70">Variable Mappings</label>
                            <button
                                onClick={() => {
                                    const currentMappings = metric.variableMappings || [];
                                    onMetricChange(index, 'variableMappings', [
                                        ...currentMappings,
                                        { filterVariableName: '', bexVariableName: '' },
                                    ]);
                                }}
                                className="rounded px-2 py-1 text-xs text-cyan-400 transition-colors hover:bg-cyan-400/10"
                            >
                                <PlusIcon className="mr-1 inline h-3 w-3" />
                                Add Mapping
                            </button>
                        </div>
                        {(metric.variableMappings || []).map((mapping, mapIndex) => (
                            <div key={mapIndex} className="flex gap-2 rounded border border-white/10 bg-white/5 p-2">
                                <div className="flex-1">
                                    <CustomInput
                                        label="Filter Variable Name"
                                        type="text"
                                        value={mapping.filterVariableName}
                                        onChange={(value) => {
                                            const updatedMappings = [...(metric.variableMappings || [])];
                                            updatedMappings[mapIndex] = { ...mapping, filterVariableName: value as string };
                                            onMetricChange(index, 'variableMappings', updatedMappings);
                                        }}
                                        placeholder="Variable name from filter event"
                                        id={`filter-var-${index}-${mapIndex}`}
                                        name={`filter-var-${index}-${mapIndex}`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <CustomInput
                                        label="BEX Variable Name"
                                        type="text"
                                        value={mapping.bexVariableName}
                                        onChange={(value) => {
                                            const updatedMappings = [...(metric.variableMappings || [])];
                                            updatedMappings[mapIndex] = { ...mapping, bexVariableName: value as string };
                                            onMetricChange(index, 'variableMappings', updatedMappings);
                                        }}
                                        placeholder="Variable name for BEX query"
                                        id={`bex-var-${index}-${mapIndex}`}
                                        name={`bex-var-${index}-${mapIndex}`}
                                    />
                                </div>
                                <button
                                    onClick={() => {
                                        const updatedMappings = (metric.variableMappings || []).filter((_, i) => i !== mapIndex);
                                        onMetricChange(index, 'variableMappings', updatedMappings.length > 0 ? updatedMappings : undefined);
                                    }}
                                    className="mt-6 rounded p-1 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                        {(!metric.variableMappings || metric.variableMappings.length === 0) && (
                            <p className="text-xs text-white/50">
                                Add variable mappings to map filter panel variables to BEX query variables.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
