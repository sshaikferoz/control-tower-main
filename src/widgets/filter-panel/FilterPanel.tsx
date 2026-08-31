'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { FilterPanelWidgetConfig, FilterComponent, FilterVariable, DateFilterFormat, HIERARCHY_NODE_IOBJNM } from './FilterPanelConfig.types';
import useBexJson from '@/hooks/useBexJson';
import { WidgetSkeleton } from '@/components/ui/WidgetSkeleton';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setFilterState, FilterValue, HierarchyNodeValue } from '@/store/filterSlice';
import { useFilterPanelSidebar } from './FilterPanelSidebarContext';

interface FilterPanelProps {
    filterPanelConfig?: FilterPanelWidgetConfig;
    title?: string;
    backgroundColor?: string;
    typography?: any;
    showQueryDebugErrors?: boolean;
    debugWidgetName?: string;
}

interface ListFilterColumn {
    field: string;
    value: unknown;
}

interface ListFilterRow {
    key: string;
    value: string;
    columns: ListFilterColumn[];
    hierarchyLevel?: number;
    hasChildren?: boolean;
    parentKey?: string | null;
}

const DEFAULT_DATE_FORMAT: DateFilterFormat = 'MM/DD/YYYY';
const DEFAULT_FILTER_EVENT_NAME = 'filter-changed';

function normalizeEventName(eventName?: string | null): string {
    const trimmed = (eventName || '').trim();
    return trimmed || DEFAULT_FILTER_EVENT_NAME;
}

function getDateFormat(component: FilterComponent): DateFilterFormat {
    if (component.dateFormat === 'YYYY' || component.dateFormat === 'MM/YYYY') {
        return component.dateFormat;
    }
    return DEFAULT_DATE_FORMAT;
}

function pad2(value: number): string {
    return String(value).padStart(2, '0');
}

function toStoredDateValue(pickerValue: string, format: DateFilterFormat): string {
    if (!pickerValue) return '';
    if (format === 'YYYY') {
        const year = pickerValue.trim();
        return /^\d{4}$/.test(year) ? year : '';
    }
    if (format === 'MM/YYYY') {
        const [yearPart, monthPart] = pickerValue.split('-');
        if (!yearPart || !monthPart) return '';
        return `${monthPart}/${yearPart}`;
    }
    const [yearPart, monthPart, dayPart] = pickerValue.split('-');
    if (!yearPart || !monthPart || !dayPart) return '';
    return `${monthPart}/${dayPart}/${yearPart}`;
}

function toPickerDateValue(storedValue: string, format: DateFilterFormat): string {
    const value = storedValue.trim();
    if (!value) return '';

    if (format === 'YYYY') {
        if (/^\d{4}$/.test(value)) return value;
        const year = Number(value);
        if (!Number.isInteger(year) || year < 1000 || year > 9999) return '';
        return String(year);
    }

    // Support legacy values that may already be in picker format.
    if (format === 'MM/YYYY') {
        if (/^\d{4}-\d{2}$/.test(value)) {
            return value;
        }
        const [monthPart, yearPart] = value.split('/');
        if (!monthPart || !yearPart) return '';
        const month = Number(monthPart);
        const year = Number(yearPart);
        if (!Number.isInteger(month) || !Number.isInteger(year) || month < 1 || month > 12) return '';
        return `${year}-${pad2(month)}`;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const [monthPart, dayPart, yearPart] = value.split('/');
    if (!monthPart || !dayPart || !yearPart) return '';
    const month = Number(monthPart);
    const day = Number(dayPart);
    const year = Number(yearPart);
    if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) return '';
    return `${year}-${pad2(month)}-${pad2(day)}`;
}

function parseDateForFormat(rawValue: string, format: DateFilterFormat): Date | null {
    const value = rawValue.trim();
    if (!value) return null;
    if (format === 'YYYY') {
        if (!/^\d{4}$/.test(value)) return null;
        const year = Number(value);
        if (year < 1000 || year > 9999) return null;
        return new Date(year, 0, 1);
    }
    if (format === 'MM/YYYY') {
        const [monthPart, yearPart] = value.split('/');
        if (!monthPart || !yearPart || value.split('/').length !== 2) return null;
        const month = Number(monthPart);
        const year = Number(yearPart);
        if (!Number.isInteger(month) || !Number.isInteger(year)) return null;
        if (month < 1 || month > 12 || year < 1000 || year > 9999) return null;
        return new Date(year, month - 1, 1);
    }
    const [monthPart, dayPart, yearPart] = value.split('/');
    if (!monthPart || !dayPart || !yearPart || value.split('/').length !== 3) return null;
    const month = Number(monthPart);
    const day = Number(dayPart);
    const year = Number(yearPart);
    if (!Number.isInteger(month) || !Number.isInteger(day) || !Number.isInteger(year)) return null;
    if (month < 1 || month > 12 || day < 1 || year < 1000 || year > 9999) return null;
    const maxDay = new Date(year, month, 0).getDate();
    if (day > maxDay) return null;
    return new Date(year, month - 1, day);
}

function validateDateValue(
    value: string,
    format: DateFilterFormat,
    minDate?: string,
    maxDate?: string
): string | null {
    if (!value.trim()) return null;
    const parsedValue = parseDateForFormat(value, format);
    if (!parsedValue) {
        return `Use format ${format}`;
    }
    const parsedMin = minDate ? parseDateForFormat(minDate, format) : null;
    const parsedMax = maxDate ? parseDateForFormat(maxDate, format) : null;
    if (parsedMin && parsedValue < parsedMin) {
        return `Value must be on or after ${minDate}`;
    }
    if (parsedMax && parsedValue > parsedMax) {
        return `Value must be on or before ${maxDate}`;
    }
    return null;
}

function formatAppliedFilterValue(value: FilterValue | undefined): string {
    if (value == null) return '';
    if (typeof value === 'string') return value.trim();
    if (Array.isArray(value)) {
        return value.length > 0
            ? value.map((v) => (typeof v === 'string' ? v : v.nodeKey)).join(', ')
            : '';
    }
    if ('nodeKey' in value) return value.nodeKey.trim();
    const from = value.from?.trim() ?? '';
    const to = value.to?.trim() ?? '';
    if (from && to) return `${from} to ${to}`;
    if (from) return `From ${from}`;
    if (to) return `To ${to}`;
    return '';
}

// Input Component
const InputFilter: React.FC<{
    component: FilterComponent;
    value: string;
    onChange: (value: string) => void;
}> = ({ component, value, onChange }) => {
    return (
        <div className="mb-5">
            <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                {component.label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={component.placeholder || 'Enter value...'}
                className="filter-panel-input w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white placeholder:text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            />
        </div>
    );
};

// Date Picker Component
const DatePickerFilter: React.FC<{
    component: FilterComponent;
    value: string | string[] | { from: string; to: string } | null;
    onChange: (value: string | string[] | { from: string; to: string } | null) => void;
}> = ({ component, value, onChange }) => {
    const isRange = component.selectionMode === 'range';
    const isMulti = component.selectionMode === 'multi';
    const dateFormat = getDateFormat(component);
    const inputType = dateFormat === 'YYYY' ? 'text' : dateFormat === 'MM/YYYY' ? 'month' : 'date';
    const pickerMin = component.minDate ? toPickerDateValue(component.minDate, dateFormat) : undefined;
    const pickerMax = component.maxDate ? toPickerDateValue(component.maxDate, dateFormat) : undefined;
    const [validationMessage, setValidationMessage] = useState<string | null>(null);
    const [multiDateInput, setMultiDateInput] = useState('');

    const validateAndSetMessage = (nextValue: string | string[] | { from: string; to: string } | null) => {
        if (isRange) {
            const rangeValue = (nextValue as { from: string; to: string }) || { from: '', to: '' };
            const fromError = validateDateValue(rangeValue.from, dateFormat, component.minDate, component.maxDate);
            if (fromError) {
                setValidationMessage(`From: ${fromError}`);
                return;
            }
            const toError = validateDateValue(rangeValue.to, dateFormat, component.minDate, component.maxDate);
            if (toError) {
                setValidationMessage(`To: ${toError}`);
                return;
            }
            const parsedFrom = parseDateForFormat(rangeValue.from, dateFormat);
            const parsedTo = parseDateForFormat(rangeValue.to, dateFormat);
            if (parsedFrom && parsedTo && parsedFrom > parsedTo) {
                setValidationMessage('From value must be before or equal to To value');
                return;
            }
            setValidationMessage(null);
            return;
        }
        if (isMulti) {
            const arr = (nextValue as string[]) || [];
            const firstError = arr.map((v) => validateDateValue(v, dateFormat, component.minDate, component.maxDate)).find(Boolean);
            setValidationMessage(firstError ? `Invalid date: ${firstError}` : null);
            return;
        }
        setValidationMessage(validateDateValue((nextValue as string) || '', dateFormat, component.minDate, component.maxDate));
    };

    useEffect(() => {
        validateAndSetMessage(value);
    }, [value, dateFormat, component.minDate, component.maxDate, isRange, isMulti]);

    const renderDateInput = (
        pickerValue: string,
        onPickerChange: (stored: string) => void,
        min?: string,
        max?: string,
        className?: string
    ) => {
        if (dateFormat === 'YYYY') {
            return (
                <input
                    type="number"
                    min={min ? Number(min) : 1000}
                    max={max ? Number(max) : 9999}
                    step={1}
                    value={pickerValue}
                    onChange={(e) => onPickerChange(toStoredDateValue(e.target.value, dateFormat))}
                    placeholder="YYYY"
                    className={className || 'filter-panel-input w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20'}
                />
            );
        }
        return (
            <input
                type={inputType}
                value={pickerValue}
                onChange={(e) => onPickerChange(toStoredDateValue(e.target.value, dateFormat))}
                min={min}
                max={max}
                className={className || 'filter-panel-input w-full rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20'}
            />
        );
    };

    if (isRange) {
        const rangeValue = (value as { from: string; to: string }) || { from: '', to: '' };
        return (
            <div className="mb-5">
                <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                    {component.label}
                </label>
                <div className="flex gap-2">
                    {renderDateInput(
                        toPickerDateValue(rangeValue.from, dateFormat),
                        (stored) => onChange({ ...rangeValue, from: stored }),
                        pickerMin,
                        pickerMax,
                        'filter-panel-input flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20'
                    )}
                    <span className="filter-panel-hint flex items-center text-xs font-semibold uppercase tracking-wide text-white/60">to</span>
                    {renderDateInput(
                        toPickerDateValue(rangeValue.to, dateFormat),
                        (stored) => onChange({ ...rangeValue, to: stored }),
                        pickerMin,
                        pickerMax,
                        'filter-panel-input flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20'
                    )}
                </div>
                {validationMessage && <p className="mt-2 text-xs text-red-300">{validationMessage}</p>}
            </div>
        );
    }

    if (isMulti) {
        const multiValues = (Array.isArray(value) ? value : []) as string[];
        const addDate = () => {
            const trimmed = multiDateInput.trim();
            if (!trimmed) return;
            const stored = toStoredDateValue(trimmed, dateFormat);
            if (!stored) return;
            const err = validateDateValue(stored, dateFormat, component.minDate, component.maxDate);
            if (err) return;
            if (!multiValues.includes(stored)) onChange([...multiValues, stored]);
            setMultiDateInput('');
        };
        const removeDate = (index: number) => {
            onChange(multiValues.filter((_, i) => i !== index));
        };
        return (
            <div className="mb-5">
                <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                    {component.label}
                </label>
                <div className="flex gap-2">
                    {dateFormat === 'YYYY' ? (
                        <input
                            type="number"
                            min={pickerMin ? Number(pickerMin) : 1000}
                            max={pickerMax ? Number(pickerMax) : 9999}
                            value={multiDateInput}
                            onChange={(e) => setMultiDateInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDate())}
                            placeholder="YYYY"
                            className="filter-panel-input flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                        />
                    ) : (
                        <input
                            type={inputType}
                            value={multiDateInput}
                            onChange={(e) => setMultiDateInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDate())}
                            min={pickerMin}
                            max={pickerMax}
                            className="filter-panel-input flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                        />
                    )}
                    <button
                        type="button"
                        onClick={addDate}
                        className="filter-panel-btn-primary shrink-0 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold text-[#083765] transition-all hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                    >
                        Add
                    </button>
                </div>
                {multiValues.length > 0 && (
                    <ul className="mt-2 space-y-1">
                        {multiValues.map((stored, index) => (
                            <li
                                key={`${stored}-${index}`}
                                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
                            >
                                <span>{stored}</span>
                                <button
                                    type="button"
                                    onClick={() => removeDate(index)}
                                    className="text-red-300 hover:text-red-200 focus:outline-none"
                                    aria-label="Remove date"
                                >
                                    <XMarkIcon className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
                {validationMessage && <p className="mt-2 text-xs text-red-300">{validationMessage}</p>}
            </div>
        );
    }

    const singleValue = (value as string) || '';
    return (
        <div className="mb-5">
            <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                {component.label}
            </label>
            {renderDateInput(toPickerDateValue(singleValue, dateFormat), (stored) => onChange(stored), pickerMin, pickerMax, undefined)}
            {validationMessage && <p className="mt-2 text-xs text-red-300">{validationMessage}</p>}
        </div>
    );
};

// Hierarchy expand/collapse state persists across the sidebar being closed and
// reopened (which unmounts and remounts ListFilter). Keyed per component for the
// app session; a full page reload resets it. Kept outside React so a reopen
// restores the exact tree state without threading it through the sidebar context.
const hierarchyExpandedStore = new Map<string, Set<string>>();

// List Component (BEX Query)
const ListFilter: React.FC<{
    component: FilterComponent;
    value: string | string[] | { from: string; to: string } | null;
    onChange: (value: string | string[] | { from: string; to: string } | null) => void;
    showQueryDebugErrors?: boolean;
    debugWidgetName?: string;
    // Reports which node keys are parents (have children). handleFilterClick uses
    // this to send VAR_NODE_IOBJNM only for parent nodes, per the hierarchy rule.
    onHierarchyParentKeysChange?: (parentKeys: string[]) => void;
}> = ({ component, value, onChange, showQueryDebugErrors = false, debugWidgetName, onHierarchyParentKeysChange }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const { data: bexData, isLoading, error } = useBexJson(component.queryName || '', {
        parser: 'new',
        displayKey: component.includeDisplayKey === true,
        hierarchy: component.isHierarchyQuery === true,
        enabled: !!component.queryName,
    });
    const parserError =
        typeof (bexData as { error?: unknown } | undefined)?.error === 'string'
            ? (bexData as { error?: string }).error
            : null;

    const displayFields = useMemo(() => {
        if (!component.displayField) return [];
        return Array.isArray(component.displayField) ? component.displayField : [component.displayField];
    }, [component.displayField]);

    const rows = useMemo<ListFilterRow[]>(() => {
        if (!bexData || displayFields.length === 0 || !component.valueField) return [];
        const chartData = (bexData as any)?.chartData || [];
        const parentStack: string[] = [];
        const usedRowKeys = new Set<string>();
        return chartData.map((item: any, index: number) => ({
            ...(function () {
                const rowLevel = Math.max(Number(item.__hierarchyLevel || 1), 1);
                const configuredValue = item[component.valueField!];
                const hierarchyKeyField = `${component.valueField!}_KEY`;
                const hierarchyKeyValue =
                    component.isHierarchyQuery === true ? item[hierarchyKeyField] : undefined;
                let selectedValue =
                    hierarchyKeyValue != null && String(hierarchyKeyValue).trim() !== ''
                        ? String(hierarchyKeyValue)
                        : String(configuredValue ?? '');
                // Cost center hierarchy node keys arrive zero-padded to 32 chars
                // (e.g. "00000000000000000000999930002978"). Strip the padding so
                // the filter requests the node key ("999930002978"); the leading
                // "9999" controlling-area prefix is part of the node key and kept.
                if (
                    component.isHierarchyQuery === true &&
                    component.hierarchyType === 'costcenter'
                ) {
                    selectedValue = selectedValue.replace(/^0+/, '');
                }
                const hierarchyIndex = Number(item.__index);
                const indexKey = Number.isFinite(hierarchyIndex) && hierarchyIndex > 0 ? `idx-${hierarchyIndex}` : `pos-${index}`;
                const baseRowKey =
                    selectedValue.trim() !== ''
                        ? `${selectedValue}::${indexKey}`
                        : indexKey;
                let rowKey = baseRowKey;
                let duplicateCounter = 2;
                while (usedRowKeys.has(rowKey)) {
                    rowKey = `${baseRowKey}::dup-${duplicateCounter}`;
                    duplicateCounter += 1;
                }
                usedRowKeys.add(rowKey);
                while (parentStack.length >= rowLevel) {
                    parentStack.pop();
                }
                const parentKey = rowLevel > 1 ? parentStack[rowLevel - 2] || null : null;
                parentStack[rowLevel - 1] = rowKey;
                return {
                    key: rowKey,
                    value: selectedValue,
                    parentKey,
                };
            })(),
            columns: displayFields.map((field) => ({
                field,
                value: item[field] ?? '-',
            })),
            hierarchyLevel: Number(item.__hierarchyLevel || 0),
            hasChildren: Boolean(item.__hasChildren),
        }));
    }, [bexData, displayFields, component.valueField, component.isHierarchyQuery, component.hierarchyType]);

    // Parent nodes (those with children) are the only ones that carry a
    // VAR_NODE_IOBJNM restriction on apply; report their node keys upward so
    // handleFilterClick can distinguish parents from n-level leaf nodes.
    const parentNodeKeys = useMemo(() => {
        if (component.isHierarchyQuery !== true) return [] as string[];
        const keys = new Set<string>();
        rows.forEach((row) => {
            if (row.hasChildren && row.value) keys.add(String(row.value));
        });
        return Array.from(keys);
    }, [rows, component.isHierarchyQuery]);

    const onHierarchyParentKeysChangeRef = useRef(onHierarchyParentKeysChange);
    onHierarchyParentKeysChangeRef.current = onHierarchyParentKeysChange;
    const parentNodeKeysSignature = parentNodeKeys.join('|');
    useEffect(() => {
        onHierarchyParentKeysChangeRef.current?.(parentNodeKeys);
        // parentNodeKeysSignature captures every change to the key set.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [parentNodeKeysSignature]);

    const filteredRows = useMemo(() => {
        const normalizedSearch = searchTerm.trim().toLowerCase();
        if (!normalizedSearch) return rows;
        return rows.filter((row) =>
            row.columns.some((column) => String(column.value).toLowerCase().includes(normalizedSearch))
        );
    }, [rows, searchTerm]);

    // Expand/collapse state is seeded from the per-component store so it survives
    // the sidebar being closed and reopened. All writes go back to the store.
    const expandStoreKey = `${component.queryName || ''}::${component.id}`;
    const [expandedKeys, setExpandedKeysState] = useState<Set<string>>(
        () => hierarchyExpandedStore.get(expandStoreKey) ?? new Set()
    );
    const setExpandedKeys = useCallback(
        (updater: Set<string> | ((prev: Set<string>) => Set<string>)) => {
            setExpandedKeysState((prev) => {
                const next = typeof updater === 'function' ? updater(prev) : updater;
                hierarchyExpandedStore.set(expandStoreKey, next);
                return next;
            });
        },
        [expandStoreKey]
    );

    // Seed the default expansion (root nodes) only the first time this
    // component's rows load. If a stored expansion already exists — even "all
    // collapsed" — preserve it instead of resetting to roots on every reopen.
    useEffect(() => {
        if (component.isHierarchyQuery !== true) return;
        if (rows.length === 0) return;
        if (hierarchyExpandedStore.has(expandStoreKey)) return;
        const rootWithChildren = rows
            .filter((row) => (row.hierarchyLevel || 1) <= 1 && row.hasChildren)
            .map((row) => row.key);
        setExpandedKeys(new Set(rootWithChildren));
    }, [component.isHierarchyQuery, rows, expandStoreKey, setExpandedKeys]);

    const visibleRows = useMemo(() => {
        if (!component.isHierarchyQuery) return filteredRows;
        const rowsByKey = new Map(rows.map((row) => [row.key, row]));
        // Active search: `filteredRows` already holds every matching node across
        // the whole tree. Reveal each match plus its ancestor chain (ignoring the
        // expand/collapse state) so deep matches in collapsed branches surface and
        // can be selected.
        if (searchTerm.trim() !== '') {
            const keep = new Set<string>();
            filteredRows.forEach((row) => {
                keep.add(row.key);
                let parentKey = row.parentKey;
                while (parentKey && !keep.has(parentKey)) {
                    keep.add(parentKey);
                    parentKey = rowsByKey.get(parentKey)?.parentKey || '';
                }
            });
            return rows.filter((row) => keep.has(row.key));
        }
        // No search: standard expand/collapse visibility.
        return rows.filter((row) => {
            if (!row.parentKey) return true;
            let parentKey = row.parentKey;
            while (parentKey) {
                if (!expandedKeys.has(parentKey)) return false;
                parentKey = rowsByKey.get(parentKey)?.parentKey || '';
            }
            return true;
        });
    }, [component.isHierarchyQuery, expandedKeys, rows, filteredRows, searchTerm]);

    const isMulti = component.selectionMode === 'multi';
    const isRange = component.selectionMode === 'range';
    const selectedValues = isMulti
        ? (Array.isArray(value) ? value : value ? [String(value)] : [])
        : isRange
            ? (value && typeof value === 'object' && !Array.isArray(value) && 'from' in value ? value : { from: '', to: '' })
            : (Array.isArray(value) ? value[0] : typeof value === 'string' ? value : null);

    const handleChange = (optionValue: string, checked: boolean) => {
        if (isMulti) {
            const currentValues = selectedValues as string[];
            if (checked) {
                onChange([...currentValues, optionValue]);
            } else {
                onChange(currentValues.filter((v) => v !== optionValue));
            }
        } else {
            onChange(checked ? optionValue : null);
        }
    };

    const handleRangeChange = (type: 'from' | 'to', optionValue: string, checked: boolean) => {
        if (!isRange || !checked) return;
        const currentRange = selectedValues as { from: string; to: string };
        onChange({
            ...currentRange,
            [type]: optionValue,
        });
    };

    if (isLoading) {
        return (
            <div className="mb-5">
                <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                    {component.label}
                </label>
                <div className="filter-panel-list-box rounded-xl border border-white/15 bg-white/10 p-4">
                    <WidgetSkeleton />
                </div>
            </div>
        );
    }

    if (error || parserError) {
        return (
            <div className="mb-5">
                <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                    {component.label}
                </label>
                <div className="query-error-banner rounded-xl p-4 text-sm">
                    Error loading options: {parserError || error?.message || 'Unknown error'}
                    {showQueryDebugErrors && (
                        <div className="query-debug-error mt-2 rounded p-2 text-xs">
                            <p><strong>Widget:</strong> {debugWidgetName || 'filter-panel'}</p>
                            <p><strong>Filter:</strong> {component.label}</p>
                            <p><strong>Query:</strong> {component.queryName || 'N/A'}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="mb-5">
            <label className="filter-panel-label mb-2 block text-xs font-semibold tracking-wide uppercase text-cyan-50/90">
                {component.label}
            </label>
            <div className="mb-2">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="filter-panel-input w-full rounded-xl border border-white/15 bg-white/10 px-3 py-2.5 text-sm text-white placeholder:text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-all focus:border-cyan-300/70 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                />
            </div>
            <div className="filter-panel-list-box max-h-[calc(100vh-250px)] overflow-auto rounded-xl border border-white/15 bg-[#082750]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
                {visibleRows.length === 0 ? (
                    <div className="filter-panel-empty-msg p-4 text-center text-sm text-white/60">No options available</div>
                ) : (
                    <table className="min-w-full border-collapse text-left text-sm text-white">
                        <thead className="sticky top-0 bg-[#0a315f]/95 backdrop-blur-md">
                            <tr>
                                {isRange ? (
                                    <>
                                        <th className="w-12 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white/80">From</th>
                                        <th className="w-12 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white/80">To</th>
                                    </>
                                ) : (
                                    <th className="w-12 px-3 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white/80">
                                        {isMulti ? 'Select' : 'Pick'}
                                    </th>
                                )}
                                {displayFields.map((field) => (
                                    <th
                                        key={field}
                                        className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80 whitespace-nowrap"
                                    >
                                        {field}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {visibleRows.map((row) => {
                                const optionValue = row.value;
                                if (!optionValue) return null;
                                const isChecked = isMulti
                                    ? (selectedValues as string[]).includes(optionValue)
                                    : selectedValues === optionValue;
                                const isFromChecked = isRange ? (selectedValues as { from: string; to: string }).from === optionValue : false;
                                const isToChecked = isRange ? (selectedValues as { from: string; to: string }).to === optionValue : false;
                                const hierarchyLevel = Math.max((row.hierarchyLevel || 1) - 1, 0);

                                return (
                                    <tr key={row.key} className="border-t border-white/10 transition-colors hover:bg-cyan-300/5">
                                        {isRange ? (
                                            <>
                                                <td className="px-3 py-2 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`${component.id}-from`}
                                                        checked={isFromChecked}
                                                        onChange={(e) => handleRangeChange('from', optionValue, e.target.checked)}
                                                        className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
                                                    />
                                                </td>
                                                <td className="px-3 py-2 text-center">
                                                    <input
                                                        type="radio"
                                                        name={`${component.id}-to`}
                                                        checked={isToChecked}
                                                        onChange={(e) => handleRangeChange('to', optionValue, e.target.checked)}
                                                        className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
                                                    />
                                                </td>
                                            </>
                                        ) : (
                                            <td className="px-3 py-2 text-center">
                                                <input
                                                    type={isMulti ? 'checkbox' : 'radio'}
                                                    checked={isChecked}
                                                    onChange={(e) => handleChange(optionValue, e.target.checked)}
                                                    className="h-4 w-4 cursor-pointer rounded border-white/30 bg-white/10 text-cyan-300 focus:ring-2 focus:ring-cyan-300/30"
                                                />
                                            </td>
                                        )}
                                        {row.columns.map((column) => (
                                            <td
                                                key={`${row.key}-${column.field}`}
                                                className="px-3 py-2 text-sm text-white/95 whitespace-nowrap"
                                            >
                                                {component.isHierarchyQuery && column.field === displayFields[0] ? (
                                                    <span className="inline-flex items-center" style={{ paddingLeft: `${hierarchyLevel * 14}px` }}>
                                                        {row.hasChildren ? (
                                                            <button
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setExpandedKeys((prev) => {
                                                                        const next = new Set(prev);
                                                                        if (next.has(row.key)) next.delete(row.key);
                                                                        else next.add(row.key);
                                                                        return next;
                                                                    });
                                                                }}
                                                                className="mr-1 inline-flex h-5 w-5 items-center justify-center rounded text-cyan-100/70 transition-colors hover:bg-white/10 hover:text-cyan-100"
                                                                aria-label={expandedKeys.has(row.key) ? 'Collapse node' : 'Expand node'}
                                                            >
                                                                <ChevronRightIcon
                                                                    className={`h-3.5 w-3.5 transition-transform duration-200 ${expandedKeys.has(row.key) ? 'rotate-90' : ''}`}
                                                                />
                                                            </button>
                                                        ) : (
                                                            <span className="mr-1 inline-flex h-5 w-5 items-center justify-center text-white/25">•</span>
                                                        )}
                                                        <span>{String(column.value)}</span>
                                                    </span>
                                                ) : (
                                                    String(column.value)
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
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
    /** When set, the clear handler is assigned so parent can trigger Clear Filter (e.g. sidebar header). */
    onClearRef?: React.MutableRefObject<(() => void) | null>;
    showQueryDebugErrors?: boolean;
    debugWidgetName?: string;
}

function createInitialVariables(filterPanelConfig: FilterPanelWidgetConfig): Record<string, FilterVariable> {
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
    return initialVariables;
}

/** Filter form content - used inside the sidebar panel and for inline rendering. */
export const FilterPanelContent: React.FC<FilterPanelContentProps> = ({
    filterPanelConfig,
    title = 'Filter Panel',
    backgroundColor = '#00214E',
    selectedComponentId = null,
    onApplyRef,
    onClearRef,
    showQueryDebugErrors = false,
    debugWidgetName,
}) => {
    const filterSidebar = useFilterPanelSidebar();
    const configKey = useMemo(() => {
        const componentSignature = filterPanelConfig.components
            .map((component) => `${component.id}:${component.variableName}:${component.type}:${component.selectionMode}`)
            .join('|');
        return `${filterPanelConfig.eventName}::${componentSignature}`;
    }, [filterPanelConfig.eventName, filterPanelConfig.components]);
    const [variables, setVariables] = useState<Record<string, FilterVariable>>(() => {
        const draftValues = filterSidebar?.getDraftValues(filterPanelConfig);
        return draftValues || createInitialVariables(filterPanelConfig);
    });
    const dispatch = useAppDispatch();
    // Node keys (per component id) that are parent nodes in a hierarchy list.
    // Reported by each ListFilter; consumed by handleFilterClick to decide which
    // selected values carry a VAR_NODE_IOBJNM node restriction vs. a plain value.
    const hierarchyParentKeysRef = useRef<Record<string, Set<string>>>({});
    const defaultLighterColor = `${backgroundColor}80`;

    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${defaultLighterColor})`,
        color: '#ffffff',
    };

    useEffect(() => {
        const draftValues = filterSidebar?.getDraftValues(filterPanelConfig);
        setVariables(draftValues || createInitialVariables(filterPanelConfig));
    }, [configKey]);

    useEffect(() => {
        if (!filterSidebar) return;
        filterSidebar.setDraftValues(filterPanelConfig, variables);
    }, [filterSidebar, filterPanelConfig, variables]);

    const handleComponentChange = (componentId: string, value: any) => {
        setVariables((prev) => {
            return {
                ...prev,
                [componentId]: {
                    ...prev[componentId],
                    value,
                },
            };
        });
    };

    const handleFilterClick = () => {
        if (!filterPanelConfig) return;
        const nextVariables: Record<string, FilterValue> = {};
        filterPanelConfig.components.forEach((component) => {
            const variable = variables[component.id];
            if (!variable || variable.value === null ||
                (Array.isArray(variable.value) && variable.value.length === 0) ||
                (typeof variable.value === 'object' && 'from' in variable.value && !variable.value.from && !variable.value.to)) {
                return;
            }
            if (!variable.name) return;
            if (component.type === 'datePicker') {
                const format = getDateFormat(component);
                if (component.selectionMode === 'range') {
                    const rangeValue = variable.value as { from: string; to: string };
                    const fromParsed = parseDateForFormat(rangeValue.from || '', format);
                    const toParsed = parseDateForFormat(rangeValue.to || '', format);
                    const hasInvalidFrom = !!rangeValue.from && !fromParsed;
                    const hasInvalidTo = !!rangeValue.to && !toParsed;
                    if (hasInvalidFrom || hasInvalidTo) return;
                    if (fromParsed && toParsed && fromParsed > toParsed) return;
                } else if (component.selectionMode === 'multi') {
                    const arr = (variable.value as string[]) || [];
                    const allValid = arr.every((v) => parseDateForFormat(v, format));
                    if (!allValid) return;
                } else {
                    const singleValue = String(variable.value || '');
                    if (singleValue && !parseDateForFormat(singleValue, format)) return;
                }
            }
            // A hierarchy list selection restricts by node, but only *parent*
            // nodes carry a VAR_NODE_IOBJNM restriction (=0HIER_NODE); an n-level
            // leaf node (no children) is sent as a plain EQ value. Wrap only the
            // parent keys into HierarchyNodeValue, leaving leaves as strings.
            const nodeIObjNm =
                component.type === 'list' && component.isHierarchyQuery === true && component.hierarchyType
                    ? HIERARCHY_NODE_IOBJNM[component.hierarchyType]
                    : undefined;
            if (nodeIObjNm) {
                const parentKeys = hierarchyParentKeysRef.current[component.id] ?? new Set<string>();
                const toApplied = (key: string): string | HierarchyNodeValue =>
                    parentKeys.has(key) ? { nodeKey: key, nodeIObjNm } : key;
                nextVariables[variable.name] = Array.isArray(variable.value)
                    ? (variable.value as string[]).map(toApplied)
                    : toApplied(String(variable.value));
            } else {
                nextVariables[variable.name] = variable.value;
            }
        });
        dispatch(
            setFilterState({
                eventName: normalizeEventName(filterPanelConfig.eventName),
                variables: nextVariables,
            })
        );
    };

    const handleFilterClickRef = useRef(handleFilterClick);
    handleFilterClickRef.current = handleFilterClick;
    const handleClearFilters = () => {
        const clearedVariables = createInitialVariables(filterPanelConfig);
        setVariables(clearedVariables);
        filterSidebar?.clearDraftValues(filterPanelConfig);
        dispatch(
            setFilterState({
                eventName: normalizeEventName(filterPanelConfig.eventName),
                variables: {},
            })
        );
    };
    const handleClearFiltersRef = useRef(handleClearFilters);
    handleClearFiltersRef.current = handleClearFilters;
    useEffect(() => {
        if (!onApplyRef) return;
        onApplyRef.current = () => handleFilterClickRef.current();
        return () => {
            onApplyRef.current = null;
        };
    }, [onApplyRef]);
    useEffect(() => {
        if (!onClearRef) return;
        onClearRef.current = () => handleClearFiltersRef.current();
        return () => {
            onClearRef.current = null;
        };
    }, [onClearRef]);

    const componentsToRender = selectedComponentId
        ? filterPanelConfig.components.filter((c) => c.id === selectedComponentId)
        : filterPanelConfig.components;

    return (
        <div
            className="filter-panel-content-card rounded-2xl border border-white/15 bg-white/[0.04] p-4"
            style={backgroundStyle}
        >
            {!selectedComponentId && (
                <div className="filter-panel-title-bar mb-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                    <p className="filter-panel-label text-[11px] font-medium tracking-wide text-white/70 uppercase">
                        {title}
                    </p>
                </div>
            )}
            <div className="mb-4 max-h-[calc(100%-88px)] overflow-y-auto pr-1">
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
                                    value={variable.value as string | string[] | { from: string; to: string } | null}
                                    onChange={(value) => handleComponentChange(component.id, value)}
                                />
                            );
                        case 'list':
                            return (
                                <ListFilter
                                    key={component.id}
                                    component={component}
                                    value={variable.value as string | string[] | { from: string; to: string } | null}
                                    onChange={(value) => handleComponentChange(component.id, value)}
                                    showQueryDebugErrors={showQueryDebugErrors}
                                    debugWidgetName={debugWidgetName}
                                    onHierarchyParentKeysChange={(parentKeys) => {
                                        hierarchyParentKeysRef.current[component.id] = new Set(parentKeys);
                                    }}
                                />
                            );
                        default:
                            return null;
                    }
                })}
            </div>
            {!selectedComponentId && (
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleClearFilters}
                        className="filter-panel-btn-secondary w-1/2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:border-white/35 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                    >
                        Clear Filter
                    </button>
                    <button
                        onClick={handleFilterClick}
                        className="filter-panel-btn-primary w-1/2 rounded-xl bg-cyan-300 px-4 py-2.5 text-sm font-semibold transition-all hover:bg-cyan-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/60"
                    >
                        Apply Filter
                    </button>
                </div>
            )}
        </div>
    );
};

const FilterPanel: React.FC<FilterPanelProps> = ({
    filterPanelConfig,
    title = 'Filter Panel',
    backgroundColor = '#00214E',
    showQueryDebugErrors = false,
    debugWidgetName,
}) => {
    const filterSidebar = useFilterPanelSidebar();
    const dispatch = useAppDispatch();
    const appliedFilterState = useAppSelector((rootState) => rootState.filters);
    const hasConfig = Boolean(filterPanelConfig && filterPanelConfig.components && filterPanelConfig.components.length > 0);

    const handleButtonClick = () => {
        if (filterSidebar && filterPanelConfig) {
            filterSidebar.openFilterSidebar(
                filterPanelConfig,
                title,
                backgroundColor,
                showQueryDebugErrors,
                debugWidgetName || title || 'filter-panel'
            );
        }
    };

    const handleClearFilters = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!filterPanelConfig) return;
        filterSidebar?.clearDraftValues(filterPanelConfig);
        dispatch(
            setFilterState({
                eventName: normalizeEventName(filterPanelConfig.eventName),
                variables: {},
            })
        );
    };

    const defaultLighterColor = `${backgroundColor}80`;
    const backgroundStyle = {
        backgroundImage: `linear-gradient(to bottom, ${backgroundColor}, ${defaultLighterColor})`,
        color: '#ffffff',
    };
    const appliedCount = useMemo(() => {
        if (!filterPanelConfig || !hasConfig) return 0;
        if (appliedFilterState.eventName !== filterPanelConfig.eventName) return 0;
        return filterPanelConfig.components.reduce((count, component) => {
            const hasValue = Boolean(formatAppliedFilterValue(appliedFilterState.variables[component.variableName]));
            return hasValue ? count + 1 : count;
        }, 0);
    }, [appliedFilterState.eventName, appliedFilterState.variables, filterPanelConfig, hasConfig]);

    if (!hasConfig) {
        return (
            <div className="filter-panel-widget relative flex h-full w-full items-center justify-center">
                <div className="filter-panel-no-config rounded-xl border border-white/20 bg-white/5 px-4 py-3">
                    <p className="text-sm text-white/80">No filter components configured</p>
                </div>
            </div>
        );
    }

    return (
        <div className="filter-panel-widget relative flex h-full w-full p-2 items-center justify-center">

            <button
                type="button"
                onClick={handleButtonClick}
                className="filter-panel-trigger-btn group flex w-full h-full items-center gap-2 rounded-2xl border border-white/10 px-5 py-3 font-semibold text-white transition-all hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                style={backgroundStyle}
                aria-label={appliedCount > 0 ? `Filters, ${appliedCount} applied` : 'Filters'}
            >
                <svg className="h-5 w-5 transition-transform group-hover:rotate-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filters
                {appliedCount > 0 && (
                    <span className="filter-panel-count-badge inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-cyan-100/40 bg-cyan-200 px-1.5 text-[11px] font-bold text-[#083765]">
                        {appliedCount}
                    </span>
                )}
            </button>
            {appliedCount > 0 && (
                <button
                    type="button"
                    onClick={handleClearFilters}
                    className="filter-panel-clear-badge absolute top-0 right-1 z-10 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                    aria-label="Clear filters"
                    title="Clear filters"
                >
                    <XMarkIcon className="h-3.5 w-3.5 stroke-[2.5]" />
                </button>
            )}
        </div>
    );
};

export default FilterPanel;
