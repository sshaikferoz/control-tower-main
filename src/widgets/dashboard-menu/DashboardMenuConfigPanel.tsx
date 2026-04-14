'use client';

import React, { useRef, useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    MagnifyingGlassIcon,
    PlusIcon,
    TrashIcon,
} from '@heroicons/react/24/outline';
import { DashboardMenuWidgetConfig, DashboardMenuItemConfig, DashboardMenuIconType, DashboardMenuDisplayMode, DASHBOARD_MENU_ICONS } from './DashboardMenuConfig.types';
import { TargetReportConfig } from '@/helpers/types';

interface DashboardMenuConfigPanelProps {
    value: DashboardMenuWidgetConfig;
    onChange: (config: DashboardMenuWidgetConfig) => void;
}

const REPORT_TYPE_OPTIONS: TargetReportConfig['type'][] = [
    'Bex Query',
    'Lumira',
    'WAD Template',
    'Web Link',
];

const defaultConfig: DashboardMenuWidgetConfig = {
    items: [],
    displayMode: 'multiple',
    layout: 'list',
};

const DISPLAY_MODE_OPTIONS: { value: DashboardMenuDisplayMode; label: string }[] = [
    { value: 'multiple', label: 'Multiple' },
    { value: 'single', label: 'Single' },
];

/** Icon options: Default (report) + all icons from public/icons */
const ICON_PICKER_OPTIONS: { value: DashboardMenuIconType | ''; label: string; src?: string }[] = [
    { value: '', label: 'Default' },
    ...DASHBOARD_MENU_ICONS.map((icon) => ({
        value: icon.id as DashboardMenuIconType,
        label: icon.label,
        src: `/icons/${icon.id}`,
    })),
];

interface CollapsibleSectionProps {
    title: string;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    defaultOpen = true,
    children,
}) => {
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
            {isOpen && <div className="border-t border-white/10 px-4 py-3">{children}</div>}
        </div>
    );
};

interface LabeledInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

const LabeledInput: React.FC<LabeledInputProps> = ({ label, id, className, ...rest }) => {
    const inputId = id || `input-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="mb-3 flex flex-col gap-1">
            <label
                htmlFor={inputId}
                className="mb-1 block text-xs font-medium text-white/70"
            >
                {label}
            </label>
            <input
                id={inputId}
                {...rest}
                className={
                    className ||
                    'w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20'
                }
            />
        </div>
    );
};

interface LabeledSelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string; label: string }[];
}

const LabeledSelect: React.FC<LabeledSelectProps> = ({
    label,
    id,
    className,
    options,
    ...rest
}) => {
    const selectId = id || `select-${label.toLowerCase().replace(/\s+/g, '-')}`;

    return (
        <div className="mb-3 flex flex-col gap-1">
            <label
                htmlFor={selectId}
                className="mb-1 block text-xs font-medium text-white/70"
            >
                {label}
            </label>
            <div className="relative">
                <select
                    id={selectId}
                    {...rest}
                    className={
                        className ||
                        'w-full appearance-none rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20'
                    }
                >
                    {options.map((opt) => (
                        <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-gray-900 text-white"
                        >
                            {opt.label}
                        </option>
                    ))}
                </select>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-white/50">
                    ▼
                </span>
            </div>
        </div>
    );
};

interface IconSelectOption {
    value: DashboardMenuIconType | '';
    label: string;
    src?: string;
}

interface IconSelectProps {
    label: string;
    value: DashboardMenuIconType | '';
    options: IconSelectOption[];
    onChange: (value: DashboardMenuIconType | undefined) => void;
    id?: string;
}

const IconSelect: React.FC<IconSelectProps> = ({
    label,
    value,
    options,
    onChange,
    id,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const selected = options.find((o) => (o.value || '') === (value || '')) || options[0];

    return (
        <div ref={containerRef} className="relative mb-3">
            <span className="mb-1 block text-xs font-medium text-white/70">{label}</span>
            <button
                type="button"
                id={id}
                onClick={() => setIsOpen((prev) => !prev)}
                className="flex w-full items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
            >
                {selected.src ? (
                    <img
                        src={selected.src}
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
                    {options.map((opt) => {
                        const isSelected = (opt.value || '') === (value || '');
                        return (
                            <button
                                key={opt.value || 'default'}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value || undefined);
                                    setIsOpen(false);
                                }}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-white transition-colors hover:bg-white/10 ${isSelected ? 'bg-cyan-400/20 text-cyan-200' : ''
                                    }`}
                            >
                                {opt.src ? (
                                    <img
                                        src={opt.src}
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
};

export const DashboardMenuConfigPanel: React.FC<DashboardMenuConfigPanelProps> = ({
    value,
    onChange,
}) => {
    const [itemSearch, setItemSearch] = useState('');

    const config: DashboardMenuWidgetConfig = {
        ...defaultConfig,
        ...value,
        items: value?.items || [],
    };

    const handleChange = (newConfig: Partial<DashboardMenuWidgetConfig>) => {
        onChange({
            ...config,
            ...newConfig,
        });
    };

    const handleItemChange = (
        index: number,
        updater: (item: DashboardMenuItemConfig) => DashboardMenuItemConfig
    ) => {
        const items = [...config.items];
        items[index] = updater(items[index]);
        handleChange({ items });
    };

    const handleAddItem = () => {
        const newItem: DashboardMenuItemConfig = {
            id: `menu-item-${Date.now()}`,
            targetReport: {
                type: 'Bex Query',
                technicalId: '',
                name: '',
                description: '',
                showInfo: true,
            },
            iconType: 'report',
            enabled: true,
        };
        handleChange({ items: [...config.items, newItem] });
    };

    const handleRemoveItem = (index: number) => {
        const items = [...config.items];
        items.splice(index, 1);
        handleChange({ items });
    };

    const normalizedItemSearch = itemSearch.trim().toLowerCase();
    const visibleItems = config.items
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
            if (!normalizedItemSearch) return true;
            const target = item.targetReport;
            return [
                target.name || '',
                target.technicalId || '',
                target.description || '',
                target.type || '',
                item.id || '',
            ]
                .join(' ')
                .toLowerCase()
                .includes(normalizedItemSearch);
        });

    return (
        <div className="space-y-4 text-white">
            <CollapsibleSection title="Display" defaultOpen>
                <LabeledSelect
                    label="Single / Multiple"
                    value={config.displayMode ?? 'multiple'}
                    onChange={(e) =>
                        handleChange({
                            displayMode: e.target.value as DashboardMenuDisplayMode,
                        })
                    }
                    options={DISPLAY_MODE_OPTIONS}
                />
                <p className="text-xs text-white/50">
                    Single: one card with large logo, title and description. Multiple: list of
                    menu items (default).
                </p>
            </CollapsibleSection>
            <CollapsibleSection title="Menu Items" defaultOpen>
                <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs text-white/60">
                        Add one or more menu entries. Each entry opens a configured report
                        in a new page.
                    </p>
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:bg-cyan-400/20 hover:border-cyan-300"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Item
                    </button>
                </div>
                <div className="relative mb-3">
                    <MagnifyingGlassIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-white/40" />
                    <input
                        type="text"
                        value={itemSearch}
                        onChange={(e) => setItemSearch(e.target.value)}
                        placeholder="Search by report name, ID, type, or description"
                        className="w-full rounded-lg border border-white/20 bg-white/5 py-2 pr-3 pl-9 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                    />
                </div>

                {config.items.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-white/60">
                            No menu items configured. Click &quot;Add Item&quot; to add your first
                            report link.
                        </p>
                    </div>
                )}

                {config.items.length > 0 && visibleItems.length === 0 && (
                    <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-center">
                        <p className="text-xs text-white/60">
                            No menu items found for &quot;{itemSearch}&quot;.
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    {visibleItems.map(({ item, index }) => {
                        const target = item.targetReport;
                        return (
                            <div
                                key={item.id}
                                className="rounded-lg border border-white/15 bg-white/5 p-3"
                            >
                                <div className="flex flex-row items-end gap-1 pb-1 justify-end">
                                    <button
                                        type="button"
                                        title={
                                            item.enabled === false
                                                ? 'Enable menu item'
                                                : 'Disable menu item'
                                        }
                                        aria-label={
                                            item.enabled === false
                                                ? 'Enable menu item'
                                                : 'Disable menu item'
                                        }
                                        onClick={() =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                enabled: prev.enabled === false,
                                            }))
                                        }
                                        className={`inline-flex h-6 items-center rounded-full border px-2 text-[10px] font-medium transition-colors ${item.enabled === false
                                            ? 'border-white/40 bg-white/5 text-white/70'
                                            : 'border-cyan-400/70 bg-cyan-400/80 text-gray-900'
                                            }`}
                                    >
                                        {item.enabled === false ? 'Disabled' : 'Enabled'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveItem(index)}
                                        className="rounded-lg p-1.5 text-white/70 transition-colors hover:bg-red-500/20 hover:text-red-400"
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </button>
                                </div>
                                <div className="mb-3 flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <LabeledInput
                                            label="Report Name"
                                            value={target.name || ''}
                                            placeholder="Display name shown in the menu"
                                            onChange={(e) =>
                                                handleItemChange(index, (prev) => ({
                                                    ...prev,
                                                    targetReport: {
                                                        ...prev.targetReport,
                                                        name: e.target.value,
                                                    },
                                                }))
                                            }
                                        />
                                    </div>

                                </div>

                                {/* Per-item role configuration */}
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
                                                    handleItemChange(index, (prev) => ({
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
                                                handleItemChange(index, (prev) => ({
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
                                        {(item.roles || []).length === 0 ? (
                                            <p className="text-[10px] text-white/50">
                                                No roles assigned. This menu item will be visible to all
                                                non-admin users.
                                            </p>
                                        ) : (
                                            <div className="flex max-h-20 flex-wrap gap-1 overflow-y-auto pr-1">
                                                {(item.roles || []).map((role) => (
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
                                                                handleItemChange(index, (prev) => ({
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

                                <div className="grid grid-cols-1 gap-3">
                                    <IconSelect
                                        label="Icon"
                                        value={item.iconType || ''}
                                        options={ICON_PICKER_OPTIONS}
                                        onChange={(iconType) =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                iconType: iconType as DashboardMenuIconType | undefined,
                                            }))
                                        }
                                        id={`menu-item-icon-${index}`}
                                    />

                                    <LabeledSelect
                                        label="Report Type"
                                        value={target.type}
                                        onChange={(e) =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                targetReport: {
                                                    ...prev.targetReport,
                                                    type: e.target.value as TargetReportConfig['type'],
                                                },
                                            }))
                                        }
                                        options={REPORT_TYPE_OPTIONS.map((t) => ({
                                            value: t,
                                            label: t,
                                        }))}
                                    />

                                    <LabeledInput
                                        label={
                                            target.type === 'Web Link'
                                                ? 'URL'
                                                : 'Technical ID'
                                        }
                                        value={target.technicalId || ''}
                                        placeholder={
                                            target.type === 'Web Link'
                                                ? 'https://...'
                                                : 'Enter technical report ID'
                                        }
                                        onChange={(e) =>
                                            handleItemChange(index, (prev) => ({
                                                ...prev,
                                                targetReport: {
                                                    ...prev.targetReport,
                                                    technicalId: e.target.value,
                                                },
                                            }))
                                        }
                                    />

                                    <div className="mb-2">
                                        <label className="mb-1 block text-xs font-medium text-white/70">
                                            Report Description
                                        </label>
                                        <textarea
                                            value={target.description || ''}
                                            placeholder="Short description for tooltips or details"
                                            onChange={(e) =>
                                                handleItemChange(index, (prev) => ({
                                                    ...prev,
                                                    targetReport: {
                                                        ...prev.targetReport,
                                                        description: e.target.value,
                                                    },
                                                }))
                                            }
                                            rows={2}
                                            className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-xs text-white placeholder:text-white/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-3 flex justify-end">
                    <button
                        type="button"
                        onClick={handleAddItem}
                        className="flex items-center gap-1 rounded-lg border border-cyan-400/50 bg-cyan-400/10 px-2.5 py-1.5 text-xs font-medium text-cyan-300 transition-all hover:border-cyan-300 hover:bg-cyan-400/20"
                    >
                        <PlusIcon className="h-4 w-4" />
                        Add Item
                    </button>
                </div>
            </CollapsibleSection>
        </div>
    );
};

