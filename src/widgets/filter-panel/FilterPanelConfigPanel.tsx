'use client';

import React, { useMemo, useState, useEffect } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    TrashIcon,
    PlusIcon,
} from '@heroicons/react/24/outline';
import { FilterPanelWidgetConfig, FilterComponent, SelectionMode, FilterComponentType } from './FilterPanelConfig.types';
import useBexJson from '@/hooks/useBexJson';

interface FilterPanelConfigPanelProps {
    value: FilterPanelWidgetConfig;
    onChange: (config: FilterPanelWidgetConfig) => void;
}

const defaultConfig: FilterPanelWidgetConfig = {
    eventName: '',
    components: [],
};

// Collapsible Section Component
interface CollapsibleSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({ title, defaultOpen = true, children }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex w-full items-center justify-between px-4 py-3 text-left transition-colors hover:bg-white/5"
            >
                <h3 className="text-sm font-semibold text-white">{title}</h3>
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

// Custom Input Component
interface CustomInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const CustomInput: React.FC<CustomInputProps> = ({ label, value, onChange, placeholder }) => {
    return (
        <div className="mb-4">
            <label className="mb-2 block text-xs font-medium text-white/70">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-4 py-2.5 text-sm text-white transition-all focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
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
        <div className="mb-4">
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

// Component Configuration Card
const ComponentConfigCard: React.FC<{
    component: FilterComponent;
    index: number;
    onComponentChange: (index: number, field: keyof FilterComponent, value: any) => void;
    onRemove: (index: number) => void;
}> = ({ component, index, onComponentChange, onRemove }) => {
    const [queryNameInput, setQueryNameInput] = useState(component.queryName || '');

    // Fetch BEX data when query name is provided (for list component)
    const { data: bexData, isLoading: bexLoading } = useBexJson(
        queryNameInput,
        {
            parser: 'new',
            enabled: component.type === 'list' && !!queryNameInput && queryNameInput.length > 0,
        }
    );

    // Extract available fields from response
    const availableFields = useMemo(() => {
        if (!bexData || component.type !== 'list') {
            return [];
        }

        const chartData = (bexData as any)?.chartData || [];
        if (chartData.length === 0) return [];

        return Object.keys(chartData[0]);
    }, [bexData, component.type]);

    // Update query name when input changes
    useEffect(() => {
        if (queryNameInput !== component.queryName) {
            const timeoutId = setTimeout(() => {
                onComponentChange(index, 'queryName', queryNameInput);
            }, 500); // Debounce
            return () => clearTimeout(timeoutId);
        }
    }, [queryNameInput, component.queryName, index, onComponentChange]);

    const componentTypeOptions: { value: FilterComponentType; label: string }[] = [
        { value: 'input', label: 'Input' },
        { value: 'datePicker', label: 'Date Picker' },
        { value: 'list', label: 'List (BEX Query)' },
    ];

    const selectionModeOptions: { value: SelectionMode; label: string }[] = [
        { value: 'single', label: 'Single Selection' },
        { value: 'multi', label: 'Multi Selection' },
        { value: 'range', label: 'Range Selection' },
    ];

    // Filter selection modes based on component type
    const availableSelectionModes = useMemo(() => {
        if (component.type === 'input') {
            return [{ value: 'single' as SelectionMode, label: 'Single Value' }];
        }
        if (component.type === 'datePicker') {
            return [
                { value: 'single' as SelectionMode, label: 'Single Date' },
                { value: 'range' as SelectionMode, label: 'Date Range' },
            ];
        }
        return selectionModeOptions;
    }, [component.type]);

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="mb-4 flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Component {index + 1}</h4>
                <button
                    onClick={() => onRemove(index)}
                    className="rounded p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                >
                    <TrashIcon className="h-5 w-5" />
                </button>
            </div>

            <CustomSelect
                label="Component Type"
                value={component.type}
                onChange={(value) => {
                    onComponentChange(index, 'type', value);
                    // Reset selection mode if not compatible
                    const newType = value as FilterComponentType;
                    if (newType === 'input' && component.selectionMode !== 'single') {
                        onComponentChange(index, 'selectionMode', 'single');
                    }
                }}
                options={componentTypeOptions}
            />

            <CustomInput
                label="Label"
                value={component.label}
                onChange={(value) => onComponentChange(index, 'label', value)}
                placeholder="Enter component label"
            />

            <CustomInput
                label="Variable Name"
                value={component.variableName}
                onChange={(value) => onComponentChange(index, 'variableName', value)}
                placeholder="Variable name for BEX query"
            />

            <CustomSelect
                label="Selection Mode"
                value={component.selectionMode}
                onChange={(value) => onComponentChange(index, 'selectionMode', value)}
                options={availableSelectionModes}
            />

            {component.type === 'input' && (
                <>
                    <CustomInput
                        label="Placeholder"
                        value={component.placeholder || ''}
                        onChange={(value) => onComponentChange(index, 'placeholder', value)}
                        placeholder="Enter placeholder text"
                    />
                    <CustomInput
                        label="Default Value"
                        value={component.defaultValue || ''}
                        onChange={(value) => onComponentChange(index, 'defaultValue', value)}
                        placeholder="Enter default value"
                    />
                </>
            )}

            {component.type === 'datePicker' && (
                <>
                    <CustomInput
                        label="Min Date"
                        value={component.minDate || ''}
                        onChange={(value) => onComponentChange(index, 'minDate', value)}
                        placeholder="YYYY-MM-DD"
                    />
                    <CustomInput
                        label="Max Date"
                        value={component.maxDate || ''}
                        onChange={(value) => onComponentChange(index, 'maxDate', value)}
                        placeholder="YYYY-MM-DD"
                    />
                </>
            )}

            {component.type === 'list' && (
                <>
                    <CustomInput
                        label="BEX Query Name"
                        value={queryNameInput}
                        onChange={setQueryNameInput}
                        placeholder="Enter BEX query name"
                    />
                    {bexLoading && (
                        <div className="mb-2 text-xs text-white/60">Loading query data...</div>
                    )}
                    {availableFields.length > 0 && (
                        <>
                            <CustomSelect
                                label="Display Field"
                                value={component.displayField || ''}
                                onChange={(value) => onComponentChange(index, 'displayField', value)}
                                options={availableFields.map((field) => ({ value: field, label: field }))}
                                placeholder="Select field to display"
                            />
                            <CustomSelect
                                label="Value Field"
                                value={component.valueField || ''}
                                onChange={(value) => onComponentChange(index, 'valueField', value)}
                                options={availableFields.map((field) => ({ value: field, label: field }))}
                                placeholder="Select field to use as value"
                            />
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export const FilterPanelConfigPanel: React.FC<FilterPanelConfigPanelProps> = ({ value, onChange }) => {
    const config = value || defaultConfig;

    const handleEventNameChange = (eventName: string) => {
        onChange({
            ...config,
            eventName,
        });
    };

    const handleAddComponent = () => {
        const newComponent: FilterComponent = {
            id: `component-${Date.now()}`,
            type: 'input',
            label: 'New Filter',
            selectionMode: 'single',
            variableName: '',
        };
        onChange({
            ...config,
            components: [...config.components, newComponent],
        });
    };

    const handleComponentChange = (index: number, field: keyof FilterComponent, fieldValue: any) => {
        const updatedComponents = [...config.components];
        updatedComponents[index] = {
            ...updatedComponents[index],
            [field]: fieldValue,
        };
        onChange({
            ...config,
            components: updatedComponents,
        });
    };

    const handleRemoveComponent = (index: number) => {
        const updatedComponents = config.components.filter((_, i) => i !== index);
        onChange({
            ...config,
            components: updatedComponents,
        });
    };

    return (
        <div className="space-y-4">
            <CollapsibleSection title="Event Configuration" defaultOpen={true}>
                <CustomInput
                    label="Event Name"
                    value={config.eventName}
                    onChange={handleEventNameChange}
                    placeholder="Enter event name (e.g., filter-changed)"
                />
                <p className="mt-2 text-xs text-white/60">
                    This event name will be used to publish filter changes. Other widgets can subscribe to this event.
                </p>
            </CollapsibleSection>

            <CollapsibleSection title="Filter Components" defaultOpen={true}>
                <div className="space-y-4">
                    {config.components.map((component, index) => (
                        <ComponentConfigCard
                            key={component.id}
                            component={component}
                            index={index}
                            onComponentChange={handleComponentChange}
                            onRemove={handleRemoveComponent}
                        />
                    ))}
                </div>

                <button
                    onClick={handleAddComponent}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                    <PlusIcon className="h-5 w-5" />
                    Add Component
                </button>
            </CollapsibleSection>
        </div>
    );
};
