'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    TrashIcon,
    PlusIcon,
    ChartBarIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import useBexJson from '@/hooks/useBexJson';
import {
    MultiMetricComparisonConfig,
    ComparisonSeries,
    DEFAULT_SERIES_COLORS,
} from './MultiMetricComparisonConfig.types';

interface MultiMetricComparisonConfigPanelProps {
    value: MultiMetricComparisonConfig;
    onChange: (config: MultiMetricComparisonConfig) => void;
}

const defaultConfig: MultiMetricComparisonConfig = {
    series: [],
    chartType: 'bar',
    showHeadlineMetrics: true,
    showLegend: true,
    showGridLines: true,
    showDataLabels: false,
};

// ---- Small reusable controls (mirrors the Multi Metric config panel) -------

const CollapsibleSection: React.FC<{
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
    icon?: React.ReactNode;
}> = ({ title, defaultOpen = true, children, icon }) => {
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

const CustomSelect: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    placeholder?: string;
    id?: string;
}> = ({ label, value, onChange, options, placeholder, id }) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="mb-4 flex flex-col gap-2">
            <label htmlFor={selectId} className="mb-1 block text-xs font-medium text-white/70">{label}</label>
            <div className="relative">
                <select
                    id={selectId}
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

const CustomCheckbox: React.FC<{
    label: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    description?: string;
    id?: string;
}> = ({ label, checked, onChange, description, id }) => {
    const checkboxId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="mb-3">
            <label htmlFor={checkboxId} className="flex cursor-pointer items-start gap-3">
                <div className="relative flex-shrink-0">
                    <input
                        id={checkboxId}
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onChange(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded border-2 border-white/30 bg-white/5 transition-all checked:border-cyan-400"
                    />
                    {checked && <CheckIcon className="pointer-events-none absolute inset-0 m-auto h-3 w-3" />}
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium text-white">{label}</div>
                    {description && <div className="mt-1 text-xs text-white/60">{description}</div>}
                </div>
            </label>
        </div>
    );
};

const CustomInput: React.FC<{
    label: string;
    value: string | number;
    onChange: (value: string | number) => void;
    type?: 'text' | 'number';
    min?: number;
    max?: number;
    step?: number;
    placeholder?: string;
    id?: string;
}> = ({ label, value, onChange, type = 'text', min, max, step, placeholder, id }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="mb-4 flex flex-col gap-2">
            <label htmlFor={inputId} className="mb-1 block text-xs font-medium text-white/70">{label}</label>
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:!text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
};

const ColorInput: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    id?: string;
}> = ({ label, value, onChange, id }) => {
    const inputId = id || `color-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 cursor-pointer overflow-hidden rounded-lg border-2 border-white/20" style={{ backgroundColor: value }}>
                    <input
                        id={inputId}
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="h-full w-full cursor-pointer opacity-0"
                    />
                </div>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                />
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------

export const MultiMetricComparisonConfigPanel: React.FC<MultiMetricComparisonConfigPanelProps> = ({
    value = defaultConfig,
    onChange,
}) => {
    const config = { ...defaultConfig, ...value };

    const handleChange = (key: keyof MultiMetricComparisonConfig, newValue: any) => {
        onChange({ ...config, [key]: newValue });
    };

    const handleSeriesChange = (index: number, field: keyof ComparisonSeries, newValue: any) => {
        const next = [...(config.series || [])];
        next[index] = { ...next[index], [field]: newValue };
        handleChange('series', next);
    };

    const handleAddSeries = () => {
        const index = config.series?.length || 0;
        const newSeries: ComparisonSeries = {
            id: `series-${Date.now()}`,
            queryName: '',
            label: `Series ${index + 1}`,
            labelSource: 'manual',
            color: DEFAULT_SERIES_COLORS[index % DEFAULT_SERIES_COLORS.length],
            categoryKey: undefined,
            valueKey: undefined,
            headlineAggregation: 'sum',
            valueFormat: 'non-currency',
            decimalPrecision: 2,
        };
        handleChange('series', [...(config.series || []), newSeries]);
    };

    const handleRemoveSeries = (index: number) => {
        const next = [...(config.series || [])];
        next.splice(index, 1);
        handleChange('series', next);
    };

    const chartTypeOptions = [
        { value: 'bar', label: 'Grouped Bars' },
        { value: 'horizontal-bar', label: 'Horizontal Bars' },
        { value: 'line', label: 'Lines' },
        { value: 'area', label: 'Areas' },
    ];

    return (
        <div className="space-y-4 text-white">
            <CollapsibleSection title="Chart Configuration" defaultOpen icon={<ChartBarIcon className="h-5 w-5" />}>
                <CustomSelect
                    label="Chart Type"
                    value={config.chartType || 'bar'}
                    onChange={(v) => handleChange('chartType', v)}
                    options={chartTypeOptions}
                    id="comparison-chart-type"
                />
                <CustomInput
                    label="Subtitle (Optional)"
                    value={config.subtitle || ''}
                    onChange={(v) => handleChange('subtitle', (v as string) || undefined)}
                    placeholder="e.g. Last 6 Months"
                    id="comparison-subtitle"
                />
                <CustomCheckbox
                    label="Show Headline Metrics"
                    checked={config.showHeadlineMetrics ?? true}
                    onChange={(c) => handleChange('showHeadlineMetrics', c)}
                    description="Show one big aggregated number per query"
                    id="comparison-show-headline"
                />
                <CustomCheckbox
                    label="Show Legend"
                    checked={config.showLegend ?? true}
                    onChange={(c) => handleChange('showLegend', c)}
                    id="comparison-show-legend"
                />
                <CustomCheckbox
                    label="Show Grid Lines"
                    checked={config.showGridLines ?? true}
                    onChange={(c) => handleChange('showGridLines', c)}
                    id="comparison-show-grid"
                />
                <CustomCheckbox
                    label="Show Data Labels"
                    checked={config.showDataLabels ?? false}
                    onChange={(c) => handleChange('showDataLabels', c)}
                    description="Print the value on each bar / point"
                    id="comparison-show-labels"
                />
                <CustomCheckbox
                    label="Transparent Background"
                    checked={config.transparentBackground === true}
                    onChange={(c) => handleChange('transparentBackground', c)}
                    description="Use transparent background instead of gradient"
                    id="comparison-transparent"
                />
                <CustomInput
                    label="Listen To Event (Optional)"
                    value={config.listenToEvent || ''}
                    onChange={(v) => handleChange('listenToEvent', (v as string) || undefined)}
                    placeholder="Event name from filter panel"
                    id="comparison-listen-event"
                />
            </CollapsibleSection>

            <CollapsibleSection title="Query Series" defaultOpen icon={<ChartBarIcon className="h-5 w-5" />}>
                <div className="mb-4 flex items-center justify-between">
                    <p className="text-xs text-white/60">Each query becomes one series in the comparison.</p>
                    <button
                        onClick={handleAddSeries}
                        className="flex items-center gap-2 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-3 py-1.5 text-sm font-medium text-cyan-400 transition-all hover:border-cyan-400 hover:bg-cyan-400/20"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Query
                    </button>
                </div>

                {(!config.series || config.series.length === 0) && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-white/50">No queries yet. Click &quot;Add Query&quot; to get started.</p>
                    </div>
                )}

                <div className="space-y-3">
                    {(config.series || []).map((s, index) => (
                        <SeriesConfigCard
                            key={s.id}
                            series={s}
                            index={index}
                            onSeriesChange={handleSeriesChange}
                            onRemove={handleRemoveSeries}
                        />
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    );
};

const aggregationOptions = [
    { value: 'sum', label: 'Sum' },
    { value: 'average', label: 'Average' },
    { value: 'last', label: 'Last' },
    { value: 'first', label: 'First' },
    { value: 'max', label: 'Max' },
    { value: 'min', label: 'Min' },
];

const labelSourceOptions = [
    { value: 'manual', label: 'Manual' },
    { value: 'query', label: 'From Query Field' },
];

const formatOptions = [
    { value: 'non-currency', label: 'Non-Currency' },
    { value: 'currency', label: 'Currency' },
];

const SeriesConfigCard: React.FC<{
    series: ComparisonSeries;
    index: number;
    onSeriesChange: (index: number, field: keyof ComparisonSeries, value: any) => void;
    onRemove: (index: number) => void;
}> = ({ series, index, onSeriesChange, onRemove }) => {
    const [queryNameInput, setQueryNameInput] = useState(series.queryName || '');

    const { data: bexData, isLoading, error } = useBexJson(queryNameInput, {
        parser: 'new',
        enabled: !!queryNameInput && queryNameInput.length > 0,
    });

    const fields = useMemo(() => {
        if (!bexData) {
            return { allFieldKeys: [] as string[], keyFigureKeys: [] as string[], charKeys: [] as string[], headerText: {} as Record<string, string> };
        }
        const chartData = (bexData as any)?.chartData || [];
        const rowKeys = chartData.length > 0 ? Object.keys(chartData[0] || {}) : [];
        const charKeys = (bexData as any)?.charKeys || [];
        const keyFigureKeys = (bexData as any)?.keyFigureKeys || [];
        const headerText = (bexData as any)?.headerText || {};
        const allFieldKeys = Array.from(new Set([...charKeys, ...keyFigureKeys, ...rowKeys])) as string[];
        return { allFieldKeys, keyFigureKeys, charKeys, headerText };
    }, [bexData]);

    // Debounced commit of the query name.
    useEffect(() => {
        if (queryNameInput !== series.queryName) {
            const timeoutId = setTimeout(() => {
                onSeriesChange(index, 'queryName', queryNameInput);
            }, 500);
            return () => clearTimeout(timeoutId);
        }
    }, [queryNameInput, series.queryName, index, onSeriesChange]);

    const labelFor = (key: string) => fields.headerText[key] || key;
    const categoryOptions = (fields.charKeys.length > 0 ? fields.charKeys : fields.allFieldKeys).map((k: string) => ({ value: k, label: labelFor(k) }));
    const valueOptions = (fields.keyFigureKeys.length > 0 ? fields.keyFigureKeys : fields.allFieldKeys).map((k: string) => ({ value: k, label: labelFor(k) }));

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-3 flex items-start justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold text-white">
                    <span className="inline-block h-3 w-3 rounded-full" style={{ backgroundColor: series.color }} />
                    {series.label || `Series ${index + 1}`}
                </span>
                <button
                    onClick={() => onRemove(index)}
                    className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>

            <CustomInput
                label="Query Name"
                value={queryNameInput}
                onChange={(v) => setQueryNameInput(v as string)}
                placeholder="Enter BEX query name"
                id={`comparison-query-${index}`}
            />
            {isLoading && (
                <div className="mb-3 flex items-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent" />
                    <p className="text-xs text-white/50">Loading fields...</p>
                </div>
            )}
            {error && <p className="mb-3 text-xs text-red-400">Error: {error.message || 'Failed to load query'}</p>}

            {queryNameInput && categoryOptions.length > 0 && (
                <CustomSelect
                    label="Category Field (X-Axis)"
                    value={series.categoryKey || ''}
                    onChange={(v) => onSeriesChange(index, 'categoryKey', v || undefined)}
                    options={categoryOptions}
                    placeholder="Select category field"
                    id={`comparison-category-${index}`}
                />
            )}

            {queryNameInput && valueOptions.length > 0 && (
                <CustomSelect
                    label="Value Field"
                    value={series.valueKey || ''}
                    onChange={(v) => onSeriesChange(index, 'valueKey', v || undefined)}
                    options={valueOptions}
                    placeholder="Select value field"
                    id={`comparison-value-${index}`}
                />
            )}

            <CustomSelect
                label="Series Label Source"
                value={series.labelSource || 'manual'}
                onChange={(v) => onSeriesChange(index, 'labelSource', v)}
                options={labelSourceOptions}
                id={`comparison-label-source-${index}`}
            />

            {(series.labelSource || 'manual') === 'manual' ? (
                <CustomInput
                    label="Series Label"
                    value={series.label}
                    onChange={(v) => onSeriesChange(index, 'label', v)}
                    placeholder="Enter series label"
                    id={`comparison-label-${index}`}
                />
            ) : (
                <CustomSelect
                    label="Label Field"
                    value={series.labelFieldKey || ''}
                    onChange={(v) => onSeriesChange(index, 'labelFieldKey', v || undefined)}
                    options={fields.allFieldKeys.map((k) => ({ value: k, label: labelFor(k) }))}
                    placeholder="Select label field"
                    id={`comparison-label-field-${index}`}
                />
            )}

            <ColorInput
                label="Series Color"
                value={series.color}
                onChange={(v) => onSeriesChange(index, 'color', v)}
                id={`comparison-color-${index}`}
            />

            {/* Header aggregation control temporarily disabled.
            <CustomSelect
                label="Headline Aggregation"
                value={series.headlineAggregation || 'sum'}
                onChange={(v) => onSeriesChange(index, 'headlineAggregation', v)}
                options={aggregationOptions}
                id={`comparison-agg-${index}`}
            />
            */}

            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                <CustomInput
                    label="Decimal Precision"
                    type="number"
                    value={series.decimalPrecision ?? 2}
                    onChange={(v) => {
                        const num = v as number;
                        onSeriesChange(index, 'decimalPrecision', isNaN(num) ? undefined : num);
                    }}
                    min={0}
                    max={10}
                    step={1}
                    id={`comparison-precision-${index}`}
                />
                <CustomSelect
                    label="Value Format"
                    value={series.valueFormat || 'non-currency'}
                    onChange={(v) => onSeriesChange(index, 'valueFormat', v)}
                    options={formatOptions}
                    id={`comparison-format-${index}`}
                />
                <CustomInput
                    label="Unit Suffix"
                    value={series.unit || ''}
                    onChange={(v) => onSeriesChange(index, 'unit', (v as string) || undefined)}
                    placeholder="e.g. %, USD"
                    id={`comparison-unit-${index}`}
                />
            </div>
        </div>
    );
};
