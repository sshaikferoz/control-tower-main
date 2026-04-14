'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    PlusIcon,
    TrashIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import useBexJson from '@/hooks/useBexJson';
import {
    AlertNotificationsWidgetConfig,
    AlertCategoryConfig,
    AlertItemConfig,
    ALERT_NOTIFICATION_ICONS,
    ThresholdMode,
} from './AlertNotificationsConfig.types';

interface AlertNotificationsConfigPanelProps {
    value: AlertNotificationsWidgetConfig;
    onChange: (config: AlertNotificationsWidgetConfig) => void;
}

const defaultConfig: AlertNotificationsWidgetConfig = {
    categories: [],
    listenToEvent: undefined,
    transparentBackground: false,
};

function CollapsibleSection({
    title,
    defaultOpen = true,
    children,
}: {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    return (
        <div className="mb-4 rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm">
            <button
                type="button"
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
            {isOpen && (
                <div className="border-t border-white/10 px-4 py-3">{children}</div>
            )}
        </div>
    );
}

function LabeledInput({
    label,
    value,
    onChange,
    type = 'text',
    placeholder,
    id,
    min,
    max,
    step,
}: {
    label: string;
    value: string | number;
    onChange: (v: string | number) => void;
    type?: 'text' | 'number';
    placeholder?: string;
    id?: string;
    min?: number;
    max?: number;
    step?: number;
}) {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="mb-3 flex flex-col gap-1">
            <label htmlFor={inputId} className="text-xs font-medium text-white/70">
                {label}
            </label>
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={(e) =>
                    onChange(type === 'number' ? Number(e.target.value) : e.target.value)
                }
                placeholder={placeholder}
                min={min}
                max={max}
                step={step}
                className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            />
        </div>
    );
}

function LabeledSelect({
    label,
    value,
    onChange,
    options,
    id,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: { value: string; label: string }[];
    id?: string;
}) {
    const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    return (
        <div className="mb-3 flex flex-col gap-1">
            <label htmlFor={selectId} className="text-xs font-medium text-white/70">
                {label}
            </label>
            <select
                id={selectId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-gray-900">
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}

const ICON_OPTIONS: { value: string; label: string; src?: string }[] = [
    { value: '', label: 'Default (alert icon)' },
    ...ALERT_NOTIFICATION_ICONS.map((icon) => ({
        value: icon.id,
        label: icon.label,
        src: `/icons/${icon.id}`,
    })),
];

function IconSelect({
    label,
    value,
    onChange,
    id,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    id?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selected = ICON_OPTIONS.find((o) => (o.value || '') === (value || '')) ?? ICON_OPTIONS[0];
    const selectedSrc = selected.src;

    return (
        <div ref={containerRef} className="relative mb-3">
            <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen((p) => !p)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
                {selectedSrc ? (
                    <img
                        src={selectedSrc}
                        alt=""
                        className="h-5 w-5 flex-shrink-0 object-contain brightness-0 invert"
                    />
                ) : (
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-medium text-white/60">
                        —
                    </span>
                )}
                <span className="min-w-0 flex-1 truncate">{selected.label}</span>
                <ChevronDownIcon
                    className={`h-4 w-4 flex-shrink-0 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            {isOpen && (
                <div className="absolute left-0 right-0 top-full z-10 mt-1 max-h-56 overflow-auto rounded-lg border border-white/20 bg-gray-900 py-1 shadow-lg">
                    {ICON_OPTIONS.map((opt) => {
                        const optSrc = 'src' in opt ? opt.src : undefined;
                        const isSelected = (opt.value || '') === (value || '');
                        return (
                            <button
                                key={opt.value || 'default'}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value || '');
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 ${isSelected ? 'bg-cyan-400/20 text-cyan-200' : ''
                                    }`}
                            >
                                {optSrc ? (
                                    <img
                                        src={optSrc}
                                        alt=""
                                        className="h-5 w-5 flex-shrink-0 object-contain brightness-0 invert"
                                    />
                                ) : (
                                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center text-[10px] font-medium text-white/60">
                                        —
                                    </span>
                                )}
                                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

const THRESHOLD_MODE_OPTIONS: { value: ThresholdMode; label: string }[] = [
    { value: 'above', label: 'Above (higher value = worse)' },
    { value: 'below', label: 'Below (lower value = worse)' },
];

function AlertItemCard({
    alert: config,
    index,
    onAlertChange,
    onRemove,
}: {
    alert: AlertItemConfig;
    index: number;
    onAlertChange: (index: number, field: keyof AlertItemConfig, value: any) => void;
    onRemove: (index: number) => void;
}) {
    const [queryInput, setQueryInput] = useState(config.queryName || '');
    const { data: bexData, isLoading, error } = useBexJson(queryInput, {
        parser: 'new',
        enabled: !!queryInput.trim(),
    });

    const availableFields = useMemo(() => {
        if (!bexData) return { keyFigureKeys: [] as string[], headerText: {} as Record<string, string> };
        const keyFigureKeys = (bexData as any)?.keyFigureKeys ?? [];
        const headerText = (bexData as any)?.headerText ?? {};
        return { keyFigureKeys, headerText };
    }, [bexData]);

    useEffect(() => {
        const t = setTimeout(() => {
            if (queryInput !== config.queryName) onAlertChange(index, 'queryName', queryInput);
        }, 400);
        return () => clearTimeout(t);
    }, [queryInput, config.queryName, index, onAlertChange]);

    return (
        <div className="rounded-lg border border-white/10 bg-white/5 p-3">

            <div className="mb-3 flex justify-end gap-2">
                <button
                    type="button"
                    title={config.enabled === false ? 'Enable alert' : 'Disable alert'}
                    aria-label={config.enabled === false ? 'Enable alert' : 'Disable alert'}
                    onClick={() =>
                        onAlertChange(index, 'enabled', config.enabled === false)
                    }
                    className={`inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-medium transition-colors ${config.enabled === false
                        ? 'border-white/40 bg-white/5 text-white/70'
                        : 'border-cyan-400/70 bg-cyan-400/80 text-gray-900'
                        }`}
                >
                    {config.enabled === false ? 'Disabled' : 'Enabled'}
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(index)}
                    className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
            <div className="mb-2">
                <LabeledInput
                    label="Alert Title"
                    value={config.title}
                    onChange={(v) => onAlertChange(index, 'title', v)}
                    placeholder="e.g. Suppliers Capacity Constraint"
                    id={`alert-title-${index}`}
                />
            </div>

            <LabeledInput
                label="Query Name"
                value={queryInput}
                onChange={(v) => setQueryInput(String(v))}
                placeholder="BEX query name"
                id={`alert-query-${index}`}
            />
            {isLoading && (
                <p className="mb-2 text-xs text-white/50">Loading fields…</p>
            )}
            {error && (
                <p className="mb-2 text-xs text-red-400">
                    Error: {(error as Error).message || 'Failed to load query'}
                </p>
            )}
            {queryInput && availableFields.keyFigureKeys.length > 0 && (
                <LabeledSelect
                    label="Value Field"
                    value={config.valueKey || ''}
                    onChange={(v) => onAlertChange(index, 'valueKey', v || undefined)}
                    options={[
                        { value: '', label: 'None' },
                        ...availableFields.keyFigureKeys.map((key: string) => ({
                            value: key,
                            label: (availableFields.headerText as Record<string, string>)[key] || key,
                        })),
                    ]}
                    id={`alert-valueKey-${index}`}
                />
            )}

            <LabeledInput
                label="Suffix"
                value={config.suffix ?? ''}
                onChange={(v) => onAlertChange(index, 'suffix', v)}
                placeholder="e.g. Suppliers, Item, Items, %"
                id={`alert-suffix-${index}`}
            />

            <LabeledSelect
                label="Threshold Mode"
                value={config.thresholdMode ?? 'above'}
                onChange={(v) => onAlertChange(index, 'thresholdMode', v as ThresholdMode)}
                options={THRESHOLD_MODE_OPTIONS}
                id={`alert-thresholdMode-${index}`}
            />
            <div className="grid grid-cols-2 gap-2">
                <LabeledInput
                    label="Warning Threshold"
                    value={config.warningThreshold ?? ''}
                    onChange={(v) =>
                        onAlertChange(
                            index,
                            'warningThreshold',
                            typeof v === 'number' && !Number.isNaN(v) ? v : undefined
                        )
                    }
                    type="number"
                    placeholder="Optional"
                    id={`alert-warning-${index}`}
                />
                <LabeledInput
                    label="Critical Threshold"
                    value={config.criticalThreshold ?? ''}
                    onChange={(v) =>
                        onAlertChange(
                            index,
                            'criticalThreshold',
                            typeof v === 'number' && !Number.isNaN(v) ? v : undefined
                        )
                    }
                    type="number"
                    placeholder="Optional"
                    id={`alert-critical-${index}`}
                />
            </div>

            <div className="mb-3 flex items-center gap-2">
                <input
                    type="checkbox"
                    id={`alert-currency-${index}`}
                    checked={config.isCurrencyFormat ?? false}
                    onChange={(e) => onAlertChange(index, 'isCurrencyFormat', e.target.checked)}
                    className="h-4 w-4 rounded border-white/30 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                />
                <label htmlFor={`alert-currency-${index}`} className="text-xs text-white/80">
                    Currency format
                </label>
            </div>

            <LabeledInput
                label="Precision (decimals)"
                value={config.precision ?? 2}
                onChange={(v) =>
                    onAlertChange(
                        index,
                        'precision',
                        typeof v === 'number' && !Number.isNaN(v) ? v : undefined
                    )
                }
                type="number"
                min={0}
                max={10}
                step={1}
                id={`alert-precision-${index}`}
            />

            <IconSelect
                label="Icon"
                value={config.iconType ?? ''}
                onChange={(v) => onAlertChange(index, 'iconType', v || undefined)}
                id={`alert-icon-${index}`}
            />
        </div>
    );
}

export const AlertNotificationsConfigPanel: React.FC<AlertNotificationsConfigPanelProps> = ({
    value,
    onChange,
}) => {
    const config = { ...defaultConfig, ...value };
    const [categorySearch, setCategorySearch] = useState('');
    const [alertSearchByCategory, setAlertSearchByCategory] = useState<Record<string, string>>({});

    const handleChange = (patch: Partial<AlertNotificationsWidgetConfig>) => {
        onChange({ ...config, ...patch });
    };

    const handleCategoryChange = (
        catIndex: number,
        patch: Partial<AlertCategoryConfig> | ((prev: AlertCategoryConfig) => AlertCategoryConfig)
    ) => {
        const categories = [...(config.categories || [])];
        const prev = categories[catIndex];
        if (!prev) return;
        categories[catIndex] =
            typeof patch === 'function' ? patch(prev) : { ...prev, ...patch };
        handleChange({ categories });
    };

    const handleAlertInCategory = (
        catIndex: number,
        alertIndex: number,
        field: keyof AlertItemConfig,
        val: any
    ) => {
        const categories = [...(config.categories || [])];
        const cat = categories[catIndex];
        if (!cat?.alerts) return;
        const alerts = [...cat.alerts];
        alerts[alertIndex] = { ...alerts[alertIndex], [field]: val };
        categories[catIndex] = { ...cat, alerts };
        handleChange({ categories });
    };

    const addCategory = () => {
        const newCat: AlertCategoryConfig = {
            id: `category-${Date.now()}`,
            title: `Category ${(config.categories?.length ?? 0) + 1}`,
            alerts: [],
            enabled: true,
        };
        handleChange({ categories: [...(config.categories ?? []), newCat] });
    };

    const removeCategory = (catIndex: number) => {
        const categories = (config.categories ?? []).filter((_, i) => i !== catIndex);
        handleChange({ categories });
    };

    const addAlert = (catIndex: number) => {
        const categories = [...(config.categories ?? [])];
        const cat = categories[catIndex];
        if (!cat) return;
        const newAlert: AlertItemConfig = {
            id: `alert-${Date.now()}`,
            title: `Alert ${(cat.alerts?.length ?? 0) + 1}`,
            queryName: '',
            valueKey: undefined,
            suffix: '',
            warningThreshold: undefined,
            criticalThreshold: undefined,
            thresholdMode: 'above',
            isCurrencyFormat: false,
            precision: 2,
            iconType: undefined,
            enabled: true,
        };
        categories[catIndex] = {
            ...cat,
            alerts: [...(cat.alerts ?? []), newAlert],
        };
        handleChange({ categories });
    };

    const removeAlert = (catIndex: number, alertIndex: number) => {
        const categories = [...(config.categories ?? [])];
        const cat = categories[catIndex];
        if (!cat?.alerts) return;
        const alerts = cat.alerts.filter((_, i) => i !== alertIndex);
        categories[catIndex] = { ...cat, alerts };
        handleChange({ categories });
    };

    const normalizedCategorySearch = categorySearch.trim().toLowerCase();
    const visibleCategories = (config.categories ?? [])
        .map((category, index) => ({ category, index }))
        .filter(({ category }) => {
            if (!normalizedCategorySearch) return true;
            const title = (category.title || '').toLowerCase();
            const roles = (category.roles || []).join(' ').toLowerCase();
            return title.includes(normalizedCategorySearch) || roles.includes(normalizedCategorySearch);
        });

    return (
        <div className="space-y-4 text-white">
            <CollapsibleSection title="Basic Configuration" defaultOpen>
                <LabeledInput
                    label="Listen To Event (optional)"
                    value={config.listenToEvent ?? ''}
                    onChange={(v) => handleChange({ listenToEvent: (v as string) || undefined })}
                    placeholder="e.g. filter-changed"
                    id="alert-listen-to-event"
                />
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="alert-transparent-bg"
                        checked={config.transparentBackground ?? false}
                        onChange={(e) =>
                            handleChange({ transparentBackground: e.target.checked })
                        }
                        className="h-4 w-4 rounded border-white/30 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                    />
                    <label htmlFor="alert-transparent-bg" className="text-xs text-white/80">
                        Transparent background
                    </label>
                </div>
            </CollapsibleSection>

            <CollapsibleSection title="Categories & Alerts" defaultOpen>
                <div className="mb-3 flex flex-col gap-2">
                    <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories by title or roles"
                        className="w-full rounded-lg border border-white/20 bg-white/5 py-2 pr-3 pl-3 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                    <p className="text-[11px] text-white/50">
                        Add categories and alerts. Each alert can be bound to a query and threshold-based
                        criticality (W/N/C).
                    </p>
                    <div className="flex justify-end">
                        <button
                            type="button"
                            onClick={addCategory}
                            className="flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:border-cyan-300 hover:bg-cyan-400/20"
                        >
                            <PlusIcon className="h-4 w-4" />
                            Add Category
                        </button>
                    </div>
                </div>

                {(!config.categories || config.categories.length === 0) && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                        <ExclamationTriangleIcon className="mx-auto mb-2 h-8 w-8 text-white/50" />
                        <p className="text-xs text-white/50">
                            No categories. Click &quot;Add Category&quot; then add alerts to each category.
                        </p>
                    </div>
                )}

                <div className="space-y-4">
                    {visibleCategories.map(({ category, index: catIndex }) => (
                        <div
                            key={category.id}
                            className="rounded-lg border border-white/15 bg-white/5 p-3"
                        >
                            <div className="flex items-end gap-1 pb-1 justify-end">
                                <button
                                    type="button"
                                    title={
                                        category.enabled === false
                                            ? 'Enable category'
                                            : 'Disable category'
                                    }
                                    aria-label={
                                        category.enabled === false
                                            ? 'Enable category'
                                            : 'Disable category'
                                    }
                                    onClick={() =>
                                        handleCategoryChange(catIndex, (prev) => ({
                                            ...prev,
                                            enabled: prev.enabled === false,
                                        }))
                                    }
                                    className={`inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-medium transition-colors ${category.enabled === false
                                        ? 'border-white/40 bg-white/5 text-white/70'
                                        : 'border-cyan-400/70 bg-cyan-400/80 text-gray-900'
                                        }`}
                                >
                                    {category.enabled === false ? 'Disabled' : 'Enabled'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => removeCategory(catIndex)}
                                    className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                            <div className="mb-3 flex items-start justify-between gap-2">

                                <div className="flex-1 min-w-0">
                                    <LabeledInput
                                        label="Category Title"
                                        value={category.title}
                                        onChange={(v) =>
                                            handleCategoryChange(catIndex, { title: v as string })
                                        }
                                        placeholder="e.g. Procurement, Inventory"
                                        id={`category-title-${catIndex}`}
                                    />
                                </div>

                            </div>
                            <div className="mb-2 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2">
                                <div className="mb-2">
                                    <span className="text-[11px] font-medium text-white/80">
                                        Allowed Roles
                                    </span>
                                </div>
                                <div className="flex gap-1.5">
                                    <input
                                        type="text"
                                        placeholder="Enter role name and press +"
                                        className="flex-1 min-w-0 rounded-md border border-white/20 bg-white/5 px-2 py-1 text-[11px] text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/40"
                                        onKeyDown={(e) => {
                                            const value = (e.target as HTMLInputElement).value.trim();
                                            if (!value) return;
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleCategoryChange(catIndex, (prev) => ({
                                                    ...prev,
                                                    roles: [...(prev.roles || []), value].filter(
                                                        (v, i, arr) => v && arr.indexOf(v) === i
                                                    ),
                                                }));
                                                (e.target as HTMLInputElement).value = '';
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="flex h-6 w-6 items-center justify-center rounded-md bg-cyan-400/80 text-xs font-semibold text-gray-900 transition-colors hover:bg-cyan-300"
                                        onClick={(e) => {
                                            const input = (e.currentTarget
                                                .previousSibling as HTMLInputElement) || null;
                                            if (!input) return;
                                            const value = input.value.trim();
                                            if (!value) return;
                                            handleCategoryChange(catIndex, (prev) => ({
                                                ...prev,
                                                roles: [...(prev.roles || []), value].filter(
                                                    (v, i, arr) => v && arr.indexOf(v) === i
                                                ),
                                            }));
                                            input.value = '';
                                        }}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="mt-2 space-y-1">
                                    {(category.roles || []).length === 0 ? (
                                        <p className="text-[10px] text-white/50">
                                            No roles assigned. This category will be visible to all
                                            non-admin users.
                                        </p>
                                    ) : (
                                        <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto pr-1">
                                            {(category.roles || []).map((role) => (
                                                <span
                                                    key={role}
                                                    className="inline-flex items-center gap-1 rounded-full bg-cyan-400/15 px-2 py-0.5 text-[10px] font-medium text-cyan-200 break-all"
                                                >
                                                    {role}
                                                    <button
                                                        type="button"
                                                        className="text-[11px] text-cyan-200/80 hover:text-cyan-100"
                                                        aria-label={`Remove role ${role}`}
                                                        onClick={() =>
                                                            handleCategoryChange(catIndex, (prev) => ({
                                                                ...prev,
                                                                roles: (prev.roles || []).filter(
                                                                    (r) => r !== role
                                                                ),
                                                            }))
                                                        }
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="mb-2 flex flex-col gap-2">
                                <input
                                    type="text"
                                    value={alertSearchByCategory[category.id] || ''}
                                    onChange={(e) =>
                                        setAlertSearchByCategory((prev) => ({
                                            ...prev,
                                            [category.id]: e.target.value,
                                        }))
                                    }
                                    placeholder="Search alerts by title, query, or suffix"
                                    className="w-full rounded-lg border border-white/20 bg-white/5 py-1.5 pr-3 pl-3 text-[11px] text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                />
                                <div className="flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => addAlert(catIndex)}
                                        className="flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-2 py-1 text-xs font-medium text-cyan-300 hover:bg-cyan-400/20"
                                    >
                                        <PlusIcon className="h-3 w-3" />
                                        Add Alert
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                {(category.alerts ?? [])
                                    .map((alert, alertIndex) => ({ alert, alertIndex }))
                                    .filter(({ alert }) => {
                                        const s = (alertSearchByCategory[category.id] || '')
                                            .trim()
                                            .toLowerCase();
                                        if (!s) return true;
                                        const title = (alert.title || '').toLowerCase();
                                        const query = (alert.queryName || '').toLowerCase();
                                        const suffix = (alert.suffix || '').toLowerCase();
                                        return (
                                            title.includes(s) ||
                                            query.includes(s) ||
                                            suffix.includes(s)
                                        );
                                    })
                                    .map(({ alert, alertIndex }) => (
                                        <AlertItemCard
                                            key={alert.id}
                                            alert={alert}
                                            index={alertIndex}
                                            onAlertChange={(idx, field, val) =>
                                                handleAlertInCategory(catIndex, idx, field, val)
                                            }
                                            onRemove={(idx) => removeAlert(catIndex, idx)}
                                        />
                                    ))}
                            </div>
                        </div>
                    ))}
                </div>
            </CollapsibleSection>
        </div>
    );
};
