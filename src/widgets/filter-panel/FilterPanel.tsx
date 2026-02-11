'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FilterPanelWidgetConfig, FilterComponent, SelectionMode, FilterVariable } from './FilterPanelConfig.types';
import useBexJson from '@/hooks/useBexJson';
import { WidgetSkeleton } from '@/components/ui/WidgetSkeleton';
import { useAppDispatch } from '@/store/hooks';
import { setFilterState } from '@/store/filterSlice';
import { useFilterPanelSidebar } from './FilterPanelSidebarContext';

interface FilterPanelProps {
    filterPanelConfig?: FilterPanelWidgetConfig;
    title?: string;
    backgroundColor?: string;
    typography?: any;
}

// Input Component
const InputFilter: React.FC<{
    component: FilterComponent;
    value: string;
    onChange: (value: string) => void;
}> = ({ component, value, onChange }) => {
    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white/90">
                {component.label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={component.placeholder || 'Enter value...'}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
};

// Date Picker Component
const DatePickerFilter: React.FC<{
    component: FilterComponent;
    value: string | { from: string; to: string } | null;
    onChange: (value: string | { from: string; to: string } | null) => void;
}> = ({ component, value, onChange }) => {
    const isRange = component.selectionMode === 'range';

    if (isRange) {
        const rangeValue = (value as { from: string; to: string }) || { from: '', to: '' };
        return (
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/90">
                    {component.label}
                </label>
                <div className="flex gap-2">
                    <input
                        type="date"
                        value={rangeValue.from}
                        onChange={(e) => onChange({ ...rangeValue, from: e.target.value })}
                        min={component.minDate}
                        max={component.maxDate}
                        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <span className="flex items-center text-white/70">to</span>
                    <input
                        type="date"
                        value={rangeValue.to}
                        onChange={(e) => onChange({ ...rangeValue, to: e.target.value })}
                        min={component.minDate}
                        max={component.maxDate}
                        className="flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>
            </div>
        );
    }

    const singleValue = (value as string) || '';
    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white/90">
                {component.label}
            </label>
            <input
                type="date"
                value={singleValue}
                onChange={(e) => onChange(e.target.value)}
                min={component.minDate}
                max={component.maxDate}
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
};

// List Component (BEX Query)
const ListFilter: React.FC<{
    component: FilterComponent;
    value: string | string[] | null;
    onChange: (value: string | string[] | null) => void;
}> = ({ component, value, onChange }) => {
    const { data: bexData, isLoading, error } = useBexJson(component.queryName || '', {
        parser: 'new',
        enabled: !!component.queryName,
    });

    const options = useMemo(() => {
        if (!bexData || !component.displayField || !component.valueField) return [];

        const chartData = (bexData as any)?.chartData || [];
        return chartData.map((item: any) => ({
            label: item[component.displayField!],
            value: item[component.valueField!],
        }));
    }, [bexData, component.displayField, component.valueField]);

    const isMulti = component.selectionMode === 'multi';
    const selectedValues = isMulti
        ? (Array.isArray(value) ? value : value ? [value] : [])
        : (Array.isArray(value) ? value[0] : value);

    const handleChange = (optionValue: string, checked: boolean) => {
        if (isMulti) {
            const currentValues = Array.isArray(value) ? value : value ? [value] : [];
            if (checked) {
                onChange([...currentValues, optionValue]);
            } else {
                onChange(currentValues.filter((v) => v !== optionValue));
            }
        } else {
            onChange(checked ? optionValue : null);
        }
    };

    if (isLoading) {
        return (
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/90">
                    {component.label}
                </label>
                <div className="rounded-lg border border-white/20 bg-white/10 p-4">
                    <WidgetSkeleton />
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mb-4">
                <label className="mb-2 block text-sm font-medium text-white/90">
                    {component.label}
                </label>
                <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-4 text-sm text-red-300">
                    Error loading options: {error.message}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-white/90">
                {component.label}
            </label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-white/20 bg-white/10 p-2">
                {options.length === 0 ? (
                    <div className="p-4 text-center text-sm text-white/60">No options available</div>
                ) : (
                    options.map((option: { label: string; value: string }) => {
                        const isChecked = isMulti
                            ? (selectedValues as string[]).includes(option.value)
                            : selectedValues === option.value;

                        return (
                            <label
                                key={option.value}
                                className="flex cursor-pointer items-center gap-2 rounded p-2 hover:bg-white/5"
                            >
                                <input
                                    type={isMulti ? 'checkbox' : 'radio'}
                                    checked={isChecked}
                                    onChange={(e) => handleChange(option.value, e.target.checked)}
                                    className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                                />
                                <span className="text-sm text-white">{option.label}</span>
                            </label>
                        );
                    })
                )}
            </div>
        </div>
    );
};

/** Props for the filter form content (used in widget and in sidebar). */
export interface FilterPanelContentProps {
    filterPanelConfig: FilterPanelWidgetConfig;
    title?: string;
    backgroundColor?: string;
    /** When set, only this component is shown (e.g. in sidebar right panel). */
    selectedComponentId?: string | null;
    /** When set, the apply handler is assigned so parent can trigger Apply Filter (e.g. sidebar header). */
    onApplyRef?: React.MutableRefObject<(() => void) | null>;
}

/** Filter form content - used inside the sidebar panel and for inline rendering. */
export const FilterPanelContent: React.FC<FilterPanelContentProps> = ({
    filterPanelConfig,
    title = 'Filter Panel',
    backgroundColor = '#00214E',
    selectedComponentId = null,
    onApplyRef,
}) => {
    const [variables, setVariables] = useState<Record<string, FilterVariable>>({});
    const dispatch = useAppDispatch();
    const defaultLighterColor = `${backgroundColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${defaultLighterColor})`,
        color: '#ffffff',
    };

    useEffect(() => {
        if (!filterPanelConfig) return;
        const initialVariables: Record<string, FilterVariable> = {};
        filterPanelConfig.components.forEach((component) => {
            initialVariables[component.id] = {
                name: component.variableName,
                value: component.selectionMode === 'range'
                    ? { from: '', to: '' }
                    : component.selectionMode === 'multi'
                        ? []
                        : component.defaultValue || null,
            };
        });
        setVariables(initialVariables);
    }, [filterPanelConfig]);

    const handleComponentChange = (componentId: string, value: any) => {
        setVariables((prev) => ({
            ...prev,
            [componentId]: {
                ...prev[componentId],
                value,
            },
        }));
    };

    const handleFilterClick = () => {
        if (!filterPanelConfig) return;
        const nextVariables: Record<string, FilterVariable['value']> = {};
        filterPanelConfig.components.forEach((component) => {
            const variable = variables[component.id];
            if (!variable || variable.value === null ||
                (Array.isArray(variable.value) && variable.value.length === 0) ||
                (typeof variable.value === 'object' && 'from' in variable.value && !variable.value.from && !variable.value.to)) {
                return;
            }
            if (!variable.name) return;
            nextVariables[variable.name] = variable.value;
        });
        dispatch(
            setFilterState({
                eventName: filterPanelConfig.eventName || null,
                variables: nextVariables,
            })
        );
    };

    const handleFilterClickRef = useRef(handleFilterClick);
    handleFilterClickRef.current = handleFilterClick;
    useEffect(() => {
        if (!onApplyRef) return;
        onApplyRef.current = () => handleFilterClickRef.current();
        return () => {
            onApplyRef.current = null;
        };
    }, [onApplyRef]);

    const componentsToRender = selectedComponentId
        ? filterPanelConfig.components.filter((c) => c.id === selectedComponentId)
        : filterPanelConfig.components;

    return (
        <div className="rounded-xl p-4" style={backgroundStyle}>
            <div className="mb-4 max-h-[calc(100%-80px)] overflow-y-auto">
                {componentsToRender.map((component) => {
                    const variable = variables[component.id];
                    if (!variable) return null;
                    switch (component.type) {
                        case 'input':
                            return (
                                <InputFilter
                                    key={component.id}
                                    component={component}
                                    value={(variable.value as string) || ''}
                                    onChange={(value) => handleComponentChange(component.id, value)}
                                />
                            );
                        case 'datePicker':
                            return (
                                <DatePickerFilter
                                    key={component.id}
                                    component={component}
                                    value={variable.value as string | { from: string; to: string } | null}
                                    onChange={(value) => handleComponentChange(component.id, value)}
                                />
                            );
                        case 'list':
                            return (
                                <ListFilter
                                    key={component.id}
                                    component={component}
                                    value={variable.value as string | string[] | null}
                                    onChange={(value) => handleComponentChange(component.id, value)}
                                />
                            );
                        default:
                            return null;
                    }
                })}
            </div>
            {!selectedComponentId && (
                <button
                    onClick={handleFilterClick}
                    className="w-full rounded-lg bg-cyan-400 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                >
                    Apply Filter
                </button>
            )}
        </div>
    );
};

const FilterPanel: React.FC<FilterPanelProps> = ({
    filterPanelConfig,
    title = 'Filter Panel',
    backgroundColor = '#00214E',
}) => {
    const filterSidebar = useFilterPanelSidebar();

    if (!filterPanelConfig || !filterPanelConfig.components || filterPanelConfig.components.length === 0) {
        return (
            <div className="relative flex h-full w-full items-center justify-center">
                <div className="rounded-xl border border-white/20 bg-white/5 px-4 py-3">
                    <p className="text-sm text-white/80">No filter components configured</p>
                </div>
            </div>
        );
    }

    const handleButtonClick = () => {
        if (filterSidebar) {
            filterSidebar.openFilterSidebar(filterPanelConfig, title, backgroundColor);
        }
    };

    const defaultLighterColor = `${backgroundColor}80`;
    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${defaultLighterColor})`,
        color: '#ffffff',
    };

    return (
        <div className="relative flex h-full w-full items-center justify-center">
            <button
                type="button"
                onClick={handleButtonClick}
                className="flex items-center gap-2 rounded-xl px-5 py-3 font-semibold text-white shadow-lg transition-all hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-cyan-400/50"
                style={backgroundStyle}
            >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
            </button>
        </div>
    );
};

export default FilterPanel;
